"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/api';

// 🎯 وارد کردن فونت‌های گوگل برای تایپوگرافی حرفه‌ای
import { orbitronFont, outfitFont } from '@/app/fonts';

const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

// 🎯 تبدیل اعداد انگلیسی به فارسی (برای تاریخ‌ها)
const toPersianDigits = (num: number | string) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  if (num === undefined || num === null) return '۰';
  return num.toString().replace(/[0-9]/g, (char) => persianNumbers[parseInt(char)]);
};

interface ContactMessage {
  _id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// انیمیشن‌های صفحه
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 30 } }
};

export default function AdminContactsPage() {
  // 🗃️ استیت‌های اصلی
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔍 استیت‌های سرچ و فیلتر
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  
  // 🖱️ استیت‌های تعاملات
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ==========================================
  // 🔄 فچ کردن دیتا
  // ==========================================
  const fetchMessages = async () => {
    try {
      // 🎯 استفاده از fetchWithAuth با توکن ادمین
      const res = await fetchWithAuth('/contact', {}, 'admin');
      const data = await res.json();
      if (data.success) setMessages(data.data);
    } catch (error) {
      console.error("خطا در دریافت پیام‌ها", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // ⌨️ بستن مدال با دکمه Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMessage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ==========================================
  // 🧮 پردازش دیتا (سرچ، فیلتر و آمار)
  // ==========================================
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const matchesSearch = 
        msg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.phone.includes(searchQuery) ||
        msg.email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = 
        filterType === 'all' ? true :
        filterType === 'unread' ? !msg.isRead : msg.isRead;

      return matchesSearch && matchesFilter;
    });
  }, [messages, searchQuery, filterType]);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    return {
      total: messages.length,
      unread: messages.filter(m => !m.isRead).length,
      today: messages.filter(m => new Date(m.createdAt).toDateString() === today).length
    };
  }, [messages]);

  // ==========================================
  // ⚡ عملیات‌ها (Actions)
  // ==========================================
  const handleOpenMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      try {
        // 🎯 استفاده از fetchWithAuth
        await fetchWithAuth(`/contact/${msg._id}/read`, { method: 'PATCH' }, 'admin');
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch (error) {
        console.error("خطا در آپدیت وضعیت", error);
      }
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('این پیام برای همیشه حذف خواهد شد. مطمئن هستید؟')) return;
    try {
      // 🎯 استفاده از fetchWithAuth
      const res = await fetchWithAuth(`/contact/${id}`, { method: 'DELETE' }, 'admin');
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== id));
        if (selectedMessage?._id === id) setSelectedMessage(null);
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    } catch (error) {
      console.error("خطا در حذف پیام", error);
    }
  };

  // ✅ عملیات دسته‌جمعی
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredMessages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMessages.map(m => m._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`آیا از حذف ${selectedIds.size} پیام مطمئن هستید؟`)) return;
    for (const id of Array.from(selectedIds)) {
      // 🎯 استفاده از fetchWithAuth
      await fetchWithAuth(`/contact/${id}`, { method: 'DELETE' }, 'admin');
    }
    setMessages(prev => prev.filter(m => !selectedIds.has(m._id)));
    setSelectedIds(new Set());
  };

  // 📅 فرمت تاریخ
  const formatTime = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(dateStr));
  };
  const formatDateStr = (dateStr: string) => {
    return new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateStr));
  };

  return (
    <motion.div 
      className="w-full flex flex-col gap-8 pb-16 px-4 md:px-8 mt-6"
      style={{ fontFamily: persianFontFamily }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      dir="rtl"
    >
      {/* ======================= تیتر صفحه ======================= */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 md:pb-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">صندوق پیام‌ها</h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light">
            مدیریت، پیگیری و بررسی درخواست‌ها و پیام‌های ارسال شده از فرم تماس وب‌سایت.
          </p>
        </div>
        <div className={`hidden md:block text-white/5 font-black text-6xl uppercase tracking-widest ${orbitronFont.className} select-none pointer-events-none`}>
          INBOX
        </div>
      </motion.div>

      {/* ======================= کارت‌های آماری ======================= */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
        {/* کل پیام‌ها */}
        <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none"></div>
          <span className="text-zinc-400 text-sm font-medium">کل پیام‌ها</span>
          <span className={`text-4xl md:text-5xl font-black text-white tracking-tighter ${outfitFont.className}`}>{stats.total}</span>
        </div>
        
        {/* پیام‌های نخوانده (با استایل ویژه و نئونی) */}
        <div className="bg-white border border-white/20 rounded-[24px] p-6 flex flex-col gap-2 relative overflow-hidden group shadow-[0_0_30px_rgba(255,255,255,0.1)]">
          <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/5 rounded-full blur-2xl pointer-events-none"></div>
          <span className="text-black/60 text-sm font-bold">پیام‌های نخوانده</span>
          <span className={`text-4xl md:text-5xl font-black text-black tracking-tighter ${outfitFont.className}`}>{stats.unread}</span>
        </div>

        {/* ورودی امروز */}
        <div className="bg-[#111111] border border-white/5 rounded-[24px] p-6 flex flex-col gap-2 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none"></div>
          <span className="text-zinc-400 text-sm font-medium">ورودی امروز</span>
          <span className={`text-4xl md:text-5xl font-black text-white tracking-tighter ${outfitFont.className}`}>{stats.today}</span>
        </div>
      </motion.div>

      {/* ======================= نوار ابزار (سرچ و فیلتر) ======================= */}
      <motion.div variants={itemVariants} className="bg-[#111111] border border-white/5 rounded-[24px] p-3 flex flex-col md:flex-row items-center justify-between gap-4 sticky top-4 z-20 shadow-2xl">
        
        {/* سرچ‌باکس */}
        <div className="relative w-full md:w-[350px]">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            placeholder="جستجو در نام، ایمیل، شماره..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#050505] border border-white/5 text-sm text-white rounded-xl py-3.5 pr-12 pl-4 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* تب‌های فیلتر */}
          <div className="flex bg-[#050505] p-1.5 rounded-xl border border-white/5 w-full md:w-auto">
            {(['all', 'unread', 'read'] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 ${filterType === type ? 'bg-white text-black shadow-md' : 'text-zinc-500 hover:text-white'}`}
              >
                {type === 'all' ? 'همه' : type === 'unread' ? 'نخوانده' : 'خوانده شده'}
              </button>
            ))}
          </div>

          {/* دکمه حذف دسته‌جمعی */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9, width: 0 }} 
                animate={{ opacity: 1, scale: 1, width: 'auto' }} 
                exit={{ opacity: 0, scale: 0.9, width: 0 }}
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition-all shrink-0 overflow-hidden"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span className="hidden md:inline whitespace-nowrap">حذف {toPersianDigits(selectedIds.size)} مورد</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ======================= لیست پیام‌ها ======================= */}
      <motion.div variants={itemVariants} className="bg-[#111111] border border-white/5 rounded-[24px] overflow-hidden flex-1 shadow-2xl">
        {isLoading ? (
          <div className="p-4 flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-[76px] bg-[#050505] border border-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-600">
            <svg className="w-20 h-20 mb-6 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <p className="text-lg font-bold text-white mb-2">هیچ پیامی یافت نشد.</p>
            <p className="text-sm text-zinc-500 font-light">صندوق پیام‌های شما در این بخش خالی است.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* 🎯 هدر لیست */}
            <div className="grid grid-cols-[40px_minmax(150px,1fr)_minmax(120px,1fr)_minmax(150px,2fr)_80px] gap-4 px-6 py-5 border-b border-white/5 text-xs font-bold text-zinc-500 uppercase tracking-widest items-center hidden md:grid bg-[#050505]/50">
              <button onClick={handleSelectAll} className="w-5 h-5 rounded-md border border-zinc-600 flex items-center justify-center hover:border-white transition-colors mx-auto cursor-pointer">
                {selectedIds.size === filteredMessages.length && filteredMessages.length > 0 && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
              </button>
              <span className="text-right">فرستنده</span>
              {/* 🎯 کلمه شماره تماس وسط‌چین شد تا دقیقاً بالای اعداد قرار بگیره */}
              <span className="text-center w-full block">شماره تماس</span>
              <span className="text-right pr-4">متن پیام (خلاصه)</span>
              <span className="text-left">زمان</span>
            </div>

            {/* ردیف‌های پیام */}
            {filteredMessages.map((msg) => {
              const isSelected = selectedIds.has(msg._id);
              return (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  key={msg._id}
                  onClick={() => handleOpenMessage(msg)}
                  className={`group grid grid-cols-[40px_1fr] md:grid-cols-[40px_minmax(150px,1fr)_minmax(120px,1fr)_minmax(150px,2fr)_80px] gap-4 px-6 py-5 items-center border-b border-white/5 cursor-pointer transition-all duration-300
                    ${!msg.isRead ? 'bg-white/5 hover:bg-white/10' : 'bg-transparent hover:bg-white/5'} 
                    ${isSelected ? '!bg-white/10' : ''}`}
                >
                  {/* 🎯 چک‌باکس و چراغ وضعیت (جدا شده و مرتب) */}
                  <div className="relative flex items-center justify-center w-full h-full">
                    <button 
                      onClick={(e) => toggleSelect(msg._id, e)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer relative z-10
                        ${isSelected ? 'border-white bg-white' : 'border-zinc-600 group-hover:border-zinc-400'}`}
                    >
                      {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                   {/* 🚀 چراغ پیام نخوانده با فاصله استاندارد از مربع */}
{!msg.isRead && (
  <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse" />
)}
                  </div>

                  {/* اطلاعات موبایل و دسکتاپ */}
                  <div className="flex flex-col md:hidden gap-1.5">
                    <div className="flex justify-between items-center w-full">
                      <span className={`font-bold text-base ${!msg.isRead ? 'text-white' : 'text-zinc-400'}`}>{msg.name}</span>
                      <span className={`text-xs ${outfitFont.className} ${!msg.isRead ? 'text-zinc-300' : 'text-zinc-600'}`}>{formatTime(msg.createdAt)}</span>
                    </div>
                    <span className="text-sm text-zinc-500 truncate w-full font-light">{msg.message}</span>
                  </div>

                  <span className={`hidden md:block truncate font-bold text-base text-right ${!msg.isRead ? 'text-white' : 'text-zinc-400'}`}>{msg.name}</span>
                  {/* 🎯 شماره تماس دقیقاً وسط‌چین شد تا زیر هدر خودش بشینه */}
                  <span className={`hidden md:block text-sm tracking-wider text-center w-full ${!msg.isRead ? 'text-zinc-300' : 'text-zinc-500'} ${outfitFont.className}`} dir="ltr">{msg.phone}</span>
                  <span className={`hidden md:block text-sm truncate pr-4 font-light text-right ${!msg.isRead ? 'text-zinc-300' : 'text-zinc-500'}`}>{msg.message}</span>
                  <span className={`hidden md:block text-xs text-left tracking-widest ${!msg.isRead ? 'text-zinc-400' : 'text-zinc-600'} ${outfitFont.className}`} dir="ltr">{formatTime(msg.createdAt)}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* =========================================
          مدال (پاپ‌آپ) نمایش کامل پیام با طراحی پرمیوم
      ========================================= */}
      <AnimatePresence>
        {selectedMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={() => setSelectedMessage(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-3xl bg-[#111111] border border-white/10 rounded-[32px] shadow-2xl z-10 flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* افکت نوری پس زمینه مدال */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

              {/* هدر مدال */}
              <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/5 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center text-white text-2xl font-black uppercase ${orbitronFont.className}`}>
                    {selectedMessage.name.charAt(0)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl md:text-2xl font-black text-white leading-none">{selectedMessage.name}</h2>
                    <span className="text-xs text-zinc-500 font-medium tracking-wide">
                      {toPersianDigits(formatDateStr(selectedMessage.createdAt))} - ساعت <span className={outfitFont.className}>{formatTime(selectedMessage.createdAt)}</span>
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button onClick={(e) => handleDelete(selectedMessage._id, e as any)} className="w-12 h-12 rounded-full bg-[#050505] border border-zinc-800 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 hover:border-red-500/30 flex items-center justify-center transition-all cursor-pointer" title="حذف پیام">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                  <button onClick={() => setSelectedMessage(null)} className="w-12 h-12 rounded-full bg-[#050505] border border-zinc-800 hover:bg-white/10 text-zinc-400 hover:text-white hover:border-white/30 flex items-center justify-center transition-all cursor-pointer" title="بستن (Esc)">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              </div>

              {/* بدنه مدال */}
              <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar relative z-10">
                
                {/* اطلاعات تماس */}
                <div className="flex flex-wrap gap-4 mb-8">
                  <a href={`tel:${selectedMessage.phone}`} className="inline-flex items-center gap-3 bg-[#050505] hover:bg-white hover:text-black border border-white/10 px-5 py-3.5 rounded-2xl text-sm text-zinc-300 font-bold transition-all group" dir="ltr">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span className={`tracking-wider ${outfitFont.className}`}>{selectedMessage.phone}</span>
                  </a>
                  <a href={`mailto:${selectedMessage.email}`} className="inline-flex items-center gap-3 bg-[#050505] hover:bg-white hover:text-black border border-white/10 px-5 py-3.5 rounded-2xl text-sm text-zinc-300 font-bold transition-all group" dir="ltr">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:scale-110 transition-transform"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span className={`tracking-wide ${outfitFont.className}`}>{selectedMessage.email}</span>
                  </a>
                </div>

                {/* متن پیام */}
                <div className="bg-[#050505] border border-white/5 rounded-2xl p-6 md:p-8 relative">
                  <svg className="absolute -top-4 -right-2 text-white/10" width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                  <p className="text-white leading-loose text-base md:text-lg whitespace-pre-wrap relative z-10 pt-2 font-light">
                    {selectedMessage.message}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; border: 2px solid #111111; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </motion.div>
  );
}