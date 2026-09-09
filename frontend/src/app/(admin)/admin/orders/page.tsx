"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/api';

// 🎯 وارد کردن فونت‌های اصلی
import { orbitronFont, outfitFont } from '@/app/fonts';

const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

const toPersianDigits = (num: number | string) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  if (num === undefined || num === null) return '۰';
  return num.toString().replace(/[0-9]/g, (char) => persianNumbers[parseInt(char)]);
};

interface Order {
  _id: string;
  projectId: any;
  projectName: string;
  companyName: string;
  customerName: string;
  customerBrand: string;
  customerPhone: string;
  customerEmail: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  projectVideo?: string;
  projectSlug?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetchWithAuth('/orders', {}, 'admin');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        if (data.data.length > 0 && window.innerWidth > 768) {
          setSelectedOrder(data.data[0]);
          if (!data.data[0].isRead) handleMarkAsRead(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error("خطا در دریافت سفارشات", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      const matchesSearch = 
        ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ord.customerPhone.includes(searchQuery);
      
      const matchesFilter = 
        filterType === 'all' ? true : filterType === 'unread' ? !ord.isRead : ord.isRead;

      return matchesSearch && matchesFilter;
    });
  }, [orders, searchQuery, filterType]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetchWithAuth(`/orders/${id}/read`, { method: 'PATCH' }, 'admin');
      setOrders(prev => prev.map(o => o._id === id ? { ...o, isRead: true } : o));
    } catch (error) {
      console.error("خطا در آپدیت وضعیت", error);
    }
  };

  const handleSelectOrder = (ord: Order) => {
    setSelectedOrder(ord);
    if (!ord.isRead) handleMarkAsRead(ord._id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('سفارش به طور کامل حذف خواهد شد. اطمینان دارید؟')) return;
    try {
      const res = await fetchWithAuth(`/orders/${id}`, { method: 'DELETE' }, 'admin');
      if (res.ok) {
        const newOrders = orders.filter(o => o._id !== id);
        setOrders(newOrders);
        if (selectedOrder?._id === id) {
          setSelectedOrder(newOrders.length > 0 ? newOrders[0] : null);
        }
      }
    } catch (error) {
      console.error("خطا در حذف سفارش", error);
    }
  };

  const formatTime = (dateStr: string) => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(dateStr));
  const formatDateStr = (dateStr: string) => new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'long' }).format(new Date(dateStr));

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) return `https://wa.me/98${cleanPhone.substring(1)}`;
    return `https://wa.me/${cleanPhone}`;
  };

  const targetVideoUrl = selectedOrder?.projectVideo || (typeof selectedOrder?.projectId === 'object' && selectedOrder?.projectId?.videos ? selectedOrder.projectId.videos[0] : null);
  const targetSlug = selectedOrder?.projectSlug || (typeof selectedOrder?.projectId === 'object' && selectedOrder?.projectId?.slug ? selectedOrder.projectId.slug : selectedOrder?.projectId);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full flex flex-col h-[calc(100vh-80px)] px-4 md:px-8 mt-6 overflow-hidden" 
      dir="rtl" 
      style={{ fontFamily: persianFontFamily }}
    >
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>

      {/* هدر صفحه */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">مدیریت سفارشات</h1>
          <p className="text-zinc-400 text-sm font-light">سرنخ‌های فروش (Leads) و درخواست‌های پروژه‌های الگو</p>
        </div>
        {/* 🚀 کلمه ORDERS دقیقاً مثل صفحات دیگر با orbitronFont */}
        <div className={`hidden md:block text-white/5 font-black text-6xl uppercase tracking-widest ${orbitronFont.className} select-none pointer-events-none -mt-4`}>
          ORDERS
        </div>
      </div>

      {/* بخش اصلی (Master-Detail) */}
      <div className="flex flex-col md:flex-row gap-6 h-full pb-8 overflow-hidden relative">
        
        {/* =========================================
            ستون راست: لیست سفارشات (Master)
        ========================================= */}
        <div className={`w-full md:w-[380px] lg:w-[420px] shrink-0 flex flex-col bg-[#111111] border border-white/5 rounded-[24px] overflow-hidden shadow-xl transition-all duration-300 ${selectedOrder && 'hidden md:flex'}`}>
          
          <div className="p-4 border-b border-white/5 bg-[#0a0a0a]/50 flex flex-col gap-3 shrink-0">
            <div className="relative w-full">
              <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="جستجو مشتری یا پروژه..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-white/5 text-sm text-white rounded-xl py-3 pr-11 pl-4 focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>
            <div className="flex bg-black p-1 rounded-lg border border-white/5 w-full">
              {(['all', 'unread', 'read'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`flex-1 py-2 rounded-md text-xs font-bold transition-all duration-300 ${filterType === type ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-white'}`}
                >
                  {type === 'all' ? 'همه' : type === 'unread' ? 'جدید' : 'بررسی شده'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
            {isLoading ? (
              [1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse"></div>)
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-10 text-zinc-600 text-sm">هیچ سفارشی یافت نشد.</div>
            ) : (
              filteredOrders.map(ord => {
                const isActive = selectedOrder?._id === ord._id;
                return (
                  <div 
                    key={ord._id}
                    onClick={() => handleSelectOrder(ord)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300 border ${isActive ? 'bg-white/10 border-white/20 shadow-lg' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                  >
                    {!ord.isRead && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />}
                    
                    <div className="flex justify-between items-start mb-2 pl-2">
                      <h4 className={`font-bold truncate pr-4 ${isActive ? 'text-white' : 'text-zinc-300'}`}>{ord.customerName}</h4>
                      <span className={`text-[10px] whitespace-nowrap ${outfitFont.className} ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`} dir="ltr">{formatTime(ord.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-zinc-800/80 text-zinc-300 text-[10px] px-2 py-1 rounded-md font-bold truncate max-w-[80%] border border-white/5">
                        {ord.projectName}
                      </span>
                    </div>
                    
                    <div className={`text-xs ${outfitFont.className} tracking-wider ${isActive ? 'text-zinc-400' : 'text-zinc-500'}`} dir="ltr">
                      {ord.customerPhone}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================
            ستون چپ: داشبورد جزئیات (Detail View)
        ========================================= */}
        <AnimatePresence mode="wait">
          {selectedOrder ? (
            <motion.div 
              key={selectedOrder._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex-1 flex flex-col bg-[#111111] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl relative ${!selectedOrder && 'hidden md:flex'}`}
            >
              <div className="h-[70px] border-b border-white/5 px-6 flex items-center justify-between shrink-0 bg-[#0a0a0a]/50">
                <button onClick={() => setSelectedOrder(null)} className="md:hidden flex items-center gap-2 text-zinc-400 hover:text-white">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                  <span className="text-sm font-bold">بازگشت به لیست</span>
                </button>
                <div className="hidden md:flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-white-500"></span>
                  <span className="text-sm font-bold text-zinc-300">جزئیات سفارش</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 ml-4 hidden sm:block">ثبت شده در: {toPersianDigits(formatDateStr(selectedOrder.createdAt))}</span>
                  <button onClick={() => handleDelete(selectedOrder._id)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors" title="حذف سفارش">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                
                {/* هیرو کارت پروژه درخواستی */}
                <div className="w-full bg-[#050505] border border-white/5 rounded-2xl p-6 mb-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-white/10 transition-colors"></div>
                  
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-zinc-700 absolute" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.5" ry="2.5"></rect><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
                    
                    {targetVideoUrl && (
                      <video 
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${targetVideoUrl}#t=0.1`} 
                        preload="metadata" 
                        muted 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover z-10 bg-zinc-900" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                  </div>
                  
                  <div className="flex flex-col text-center md:text-right z-10 w-full">
                    <span className={`text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2 ${outfitFont.className}`} dir="ltr">Target Project</span>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{selectedOrder.projectName}</h2>
                    {selectedOrder.companyName && (
                      <span className="text-sm text-zinc-400 mb-4">پروژه الگو متعلق به: <span className="text-white font-bold">{selectedOrder.companyName}</span></span>
                    )}
                    
                    {targetSlug && (
                      <a 
                        href={`/works/${targetSlug}`} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 w-fit mx-auto md:mx-0 px-5 py-2 bg-white/10 hover:bg-white text-zinc-300 hover:text-black rounded-lg text-sm font-bold transition-all flex items-center gap-2 group/btn border border-white/5 hover:border-white"
                      >
                        <span>مشاهده نمونه کار</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover/btn:-translate-x-1 transition-transform" dir="ltr"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </a>
                    )}
                  </div>
                </div>

                {/* گرید اطلاعات مشتری */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  
                  {/* باکس پروفایل */}
                  <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-2xl p-6 flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white text-xl font-bold shrink-0 ${orbitronFont.className}`}>
                      {selectedOrder.customerName.charAt(0)}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs text-zinc-500 mb-1">نام سفارش دهنده</span>
                      <span className="text-lg text-white font-bold truncate mb-2">{selectedOrder.customerName}</span>
                      {selectedOrder.customerBrand && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/5 w-fit">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                          <span className="text-xs text-zinc-300 truncate">{selectedOrder.customerBrand}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* باکس کانتکت و اکشن‌ها */}
                  <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-2xl p-6 flex flex-col justify-center gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500 mb-1">شماره تماس</span>
                        <span className={`text-lg text-white font-bold tracking-widest ${outfitFont.className}`} dir="ltr">{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${selectedOrder.customerPhone}`} className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-white text-zinc-400 hover:text-black flex items-center justify-center transition-colors" title="تماس مستقیم">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        </a>
                        <a href={getWhatsAppLink(selectedOrder.customerPhone)} target="_blank" className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 hover:bg-green-500 text-green-500 hover:text-white flex items-center justify-center transition-colors" title="ارسال پیام در واتس‌اپ">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                        </a>
                      </div>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="border-t border-white/5 pt-3 mt-1 flex items-center gap-2 text-zinc-400">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        <span className={`text-sm truncate ${outfitFont.className}`} dir="ltr">{selectedOrder.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* توضیحات مشتری */}
                <div className="bg-[#0a0a0a]/50 border border-white/5 rounded-2xl p-6 relative">
                  <span className="text-xs text-zinc-500 font-bold mb-3 block">بریف و توضیحات مشتری</span>
                  {selectedOrder.description ? (
                    <p className="text-zinc-200 leading-loose text-base whitespace-pre-wrap font-light">
                      {selectedOrder.description}
                    </p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 opacity-40">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="mb-2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><line x1="9" y1="10" x2="15" y2="10"></line><line x1="12" y1="7" x2="12" y2="13"></line></svg>
                      <span className="text-sm">مشتری توضیحاتی ثبت نکرده است.</span>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#111111] border border-white/5 rounded-[24px]"
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center text-zinc-600">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">جزئیات سفارش</h3>
              <p className="text-zinc-500 text-sm">برای مشاهده اطلاعات کامل، یک سفارش را از لیست انتخاب کنید.</p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}