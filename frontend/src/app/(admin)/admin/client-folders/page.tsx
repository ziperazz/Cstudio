"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/api';
import { orbitronFont, outfitFont } from '@/app/fonts';

const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

const toPersianDigits = (num: number | string) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (char) => persianNumbers[parseInt(char)]);
};

const toShamsiDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const shamsi = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
    return toPersianDigits(shamsi);
  } catch (error) {
    return 'تاریخ نامشخص';
  }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 30 } }
};

interface ClientUser {
  _id: string;
  name: string;
  username: string;
}

interface ClientFolder {
  _id: string;
  title: string;
  description: string;
  driveLink: string;
  client: ClientUser;
  createdAt: string;
}

export default function AdminClientFoldersPage() {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    driveLink: '',
    client: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // 🎯 اضافه کردن 'admin'
      const clientsRes = await fetchWithAuth('/users', {}, 'admin');
      const clientsData = await clientsRes.json();
      if (clientsData.success) {
        setClients(clientsData.data || []);
      }

      // 🎯 اضافه کردن 'admin'
      const foldersRes = await fetchWithAuth('/client-folders/all', {}, 'admin');
      const foldersData = await foldersRes.json();
      if (foldersData.success) {
        setFolders(foldersData.data || []);
      }
    } catch (err) {
      console.error('خطا در دریافت اطلاعات', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // 🎯 اضافه کردن 'admin'
      const res = await fetchWithAuth('/client-folders', {
        method: 'POST',
        body: JSON.stringify(formData)
      }, 'admin');
      
      const data = await res.json();

      if (data.success) {
        setSuccess('لینک گوگل درایو با موفقیت به کارفرما اختصاص یافت!');
        setFormData({ title: '', description: '', driveLink: '', client: '' });
        fetchData(); 
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.message || 'خطا در ثبت اطلاعات');
      }
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 منطق استخراج کارفرماهای دارای درایو (برای فیلترهای دکمه‌ای)
  const uniqueClientsWithFolders = Array.from(new Set(folders.map(f => f.client?._id)))
    .map(id => folders.find(f => f.client?._id === id)?.client)
    .filter(Boolean) as ClientUser[];

  // 🚀 منطق ترکیب سرچ و فیلتر درایوها
  const filteredFolders = folders.filter(f => {
    // 1. بررسی فیلتر دسته‌بندی کارفرما
    const matchesClient = selectedClientFilter === 'all' || f.client?._id === selectedClientFilter;
    
    // 2. بررسی مطابقت با متن جستجو شده (در نام کارفرما، آیدی کارفرما یا عنوان پوشه)
    const matchesSearch = !searchQuery || (
      (f.client?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.client?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return matchesClient && matchesSearch;
  });

  return (
    <motion.div 
      className="w-full flex flex-col gap-6 md:gap-10 pb-16 px-4 md:px-8 mt-6 relative overflow-x-hidden"
      style={{ fontFamily: persianFontFamily }}
      variants={containerVariants}
      initial="hidden"
      animate="show"
      dir="rtl"
    >
      {/* واترمارک بک‌گراند (فقط تو رزولوشن‌های بزرگ و به عنوان پس‌زمینه) */}
      <div className={`hidden md:block absolute top-0 left-8 text-zinc-800 font-black text-6xl xl:text-8xl uppercase tracking-widest ${orbitronFont.className} opacity-20 select-none pointer-events-none z-0`}>
        DRIVE
      </div>

      {/* ======================= تیتر صفحه و سرچ‌بار ======================= */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 md:pb-8 relative z-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: persianFontFamily }}>
            فضای ابری کارفرمایان
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl font-light">
            پروژه‌ها و فایل‌های نهایی را مستقیماً به داشبورد اختصاصی هر کارفرما متصل کنید تا تجربه‌ای بی‌نقص و یکپارچه داشته باشند.
          </p>
        </div>
        
        {/* 🔍 باکس جستجو */}
        <div className="relative w-full md:w-80 lg:w-96 shrink-0">
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="جستجوی کارفرما یا عنوان پروژه..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111111] border border-white/5 rounded-2xl py-3.5 pr-12 pl-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-[#151515] transition-all"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 items-start relative z-10">
        
        {/* ======================= فرم ثبت درایو جدید ======================= */}
        <motion.div variants={itemVariants} className="xl:col-span-5 2xl:col-span-4 xl:sticky xl:top-24">
          <form 
            onSubmit={handleSubmit}
            className="bg-[#111111] border border-white/5 rounded-[24px] p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden"
          >
            {/* افکت نوری پس زمینه فرم - استایل استودیو */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2 relative z-10">
              <h2 className="text-white font-bold text-lg flex items-center gap-3">
                <div className="w-2 h-8 bg-white rounded-full"></div>
                ثبت لینک جدید
              </h2>
              <span className={`text-xs text-zinc-500 uppercase tracking-widest font-bold ${outfitFont.className}`}>New Link</span>
            </div>

            {/* انتخاب کارفرما */}
            <div className="flex flex-col gap-2 relative z-10">
              <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">کارفرما</label>
              <div className="relative">
                <select 
                  name="client" value={formData.client} onChange={handleChange} required
                  className="w-full h-14 px-4 bg-[#050505] border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-white/40 focus:bg-[#0a0a0a] transition-all text-sm appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#111111] text-zinc-500">-- انتخاب کارفرما --</option>
                  {clients.map(c => (
                    <option key={c._id} value={c._id} className="bg-[#111111] text-white">{c.name} (@{c.username})</option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            {/* عنوان پروژه */}
            <div className="flex flex-col gap-2 relative z-10">
              <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">عنوان پوشه / پروژه</label>
              <input 
                type="text" name="title" value={formData.title} onChange={handleChange} required
                placeholder="مثال: تیزر تبلیغاتی برند..."
                className="w-full h-14 px-4 bg-[#050505] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/40 focus:bg-[#0a0a0a] transition-all text-sm"
              />
            </div>

            {/* لینک گوگل درایو */}
            <div className="flex flex-col gap-2 relative z-10">
              <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">لینک اشتراک‌گذاری درایو (URL)</label>
              <input 
                type="url" name="driveLink" value={formData.driveLink} onChange={handleChange} required dir="ltr"
                placeholder="https://drive.google.com/..."
                className={`w-full h-14 px-4 bg-[#050505] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/40 focus:bg-[#0a0a0a] transition-all text-sm tracking-tight ${outfitFont.className}`}
              />
            </div>

            {/* توضیحات */}
            <div className="flex flex-col gap-2 relative z-10">
              <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">توضیحات تکمیلی (اختیاری)</label>
              <textarea 
                name="description" value={formData.description} onChange={handleChange} rows={3}
                placeholder="توضیحاتی که کارفرما در داشبورد خود مشاهده می‌کند..."
                className="w-full p-4 bg-[#050505] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/40 focus:bg-[#0a0a0a] transition-all text-sm resize-none leading-relaxed"
              />
            </div>

            {/* پیام‌های خطا و موفقیت */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3 font-medium relative z-10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-center gap-3 font-medium relative z-10">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" disabled={isSubmitting}
              className="w-full h-14 mt-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm md:text-base relative z-10 cursor-pointer"
            >
              {isSubmitting ? 'درحال ثبت...' : 'ثبت و اتصال به داشبورد'}
            </button>
          </form>
        </motion.div>

        {/* ======================= لیست درایوهای اختصاص‌یافته ======================= */}
        <motion.div variants={itemVariants} className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-3">
              پوشه‌های فعال در سیستم
              {!isLoading && filteredFolders.length > 0 && (
                <span className={`bg-zinc-800 text-white text-xs px-2.5 py-1 rounded-md ${outfitFont.className}`}>
                  {toPersianDigits(filteredFolders.length)}
                </span>
              )}
            </h2>
          </div>

          {/* 🚀 فیلتر درایوها بر اساس کارفرما */}
          {!isLoading && uniqueClientsWithFolders.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
              <button 
                onClick={() => setSelectedClientFilter('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${selectedClientFilter === 'all' ? 'bg-white text-black' : 'bg-[#111111] text-zinc-400 hover:bg-zinc-800 border border-white/5'}`}
              >
                نمایش همه
              </button>
              {uniqueClientsWithFolders.map(client => (
                <button 
                  key={client._id}
                  onClick={() => setSelectedClientFilter(client._id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${selectedClientFilter === client._id ? 'bg-white text-black' : 'bg-[#111111] text-zinc-400 hover:bg-zinc-800 border border-white/5'}`}
                >
                  {client.name}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="w-full flex flex-col gap-4 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-[140px] w-full bg-[#111111] border border-white/5 rounded-[20px]" />)}
            </div>
          ) : filteredFolders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-[#111111] border border-white/5 rounded-[24px] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden"
            >
              <div className="w-24 h-24 bg-[#050505] border border-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-600">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <p className="text-white font-bold text-lg mb-2">هیچ پوشه‌ای یافت نشد</p>
              <p className="text-zinc-500 text-sm max-w-sm leading-relaxed font-light">
                {searchQuery 
                  ? 'با این جستجو نتیجه‌ای در پوشه‌ها پیدا نشد.' 
                  : selectedClientFilter === 'all' 
                    ? 'برای نمایش فایل‌ها در داشبورد کارفرمایان، از فرم سمت راست یک پوشه درایو اختصاص دهید.' 
                    : 'برای این کارفرما پوشه‌ای ثبت نشده است.'}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {filteredFolders.map((folder) => (
                  <motion.div 
                    key={folder._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="group bg-[#111111] border border-white/5 hover:border-white/10 rounded-[20px] p-6 flex flex-col justify-between transition-all duration-300"
                  >
                    <div className="flex flex-col gap-4">
                      {/* هدر کارت (نام مشتری و تاریخ شمسی) */}
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-white text-sm font-bold uppercase shrink-0">
                            {folder.client?.name ? folder.client.name.charAt(0) : '?'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-white font-bold truncate max-w-[120px]">{folder.client?.name || 'ناشناس'}</span>
                            <span className={`text-[10px] text-zinc-500 uppercase tracking-widest ${outfitFont.className}`}>@{folder.client?.username}</span>
                          </div>
                        </div>
                        {/* 🚀 تاریخ شمسی */}
                        <span className="text-[10px] text-zinc-500 font-medium whitespace-nowrap">
                          {toShamsiDate(folder.createdAt)}
                        </span>
                      </div>
                      
                      {/* محتوای کارت */}
                      <div>
                        <h3 className="text-white font-bold text-base md:text-lg group-hover:text-zinc-300 transition-colors line-clamp-1">{folder.title}</h3>
                        {folder.description && (
                          <p className="text-zinc-500 text-xs md:text-sm leading-relaxed mt-3 line-clamp-2 font-light">{folder.description}</p>
                        )}
                      </div>
                    </div>

                    {/* دکمه اکشن */}
                    <div className="pt-6 mt-auto">
                      <a 
                        href={folder.driveLink} target="_blank" rel="noopener noreferrer"
                        className="w-full bg-[#050505] hover:bg-white text-zinc-400 hover:text-black border border-zinc-800 px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group-hover:border-white cursor-pointer"
                      >
                        <span className="text-xs font-bold tracking-wide">مشاهده درایو</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                      </a>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}