"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/api'; 

import { orbitronFont, outfitFont } from '@/app/fonts';



const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // ⏱️ استیت‌های ساعت و تاریخ
  const [time, setTime] = useState<Date | null>(null);
  
  // 📊 استیت‌های دیتای واقعی بک‌اند
  const [stats, setStats] = useState({ projects: 0, messages: 0, folders: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 🔒 چک امنیتی - اگه توکن نبود بره به لاگین
  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      router.push('/auth');
    }
  }, []);

  // ⏱️ راه‌اندازی ساعت زنده
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 🚀 دریافت دیتای واقعی از سرور
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        let pCount = 0, mCount = 0, fCount = 0;

        // ۱. فچ کردن دیتای پروژه‌ها
        try {
          const pRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, { cache: 'no-store' });
          const pData = await pRes.json();
          if (pData.success && pData.data) {
            pCount = pData.data.length;
          }
        } catch (err) {
          console.error("خطا در دریافت پروژه‌ها:", err);
        }

        // ۲. فچ کردن پیام‌ها
        try {
          const mRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            cache: 'no-store'
          });

          if (!mRes.ok) {
            console.error(`❌ خطای HTTP در دریافت پیام‌ها: ${mRes.status}`);
            throw new Error(`HTTP ${mRes.status}`);
          }

          const mData = await mRes.json();
          
          if (mData.success && Array.isArray(mData.data)) {
            const unread = mData.data.filter((m: any) => !m.isRead);
            mCount = unread.length;
            console.log(`✅ پیام‌های خوانده نشده: ${mCount}`);
          } else {
            console.warn('⚠️ ساختار داده پیام‌ها نامعتبر است:', mData);
          }
        } catch (err) {
          console.error("خطا در دریافت صندوق پیام‌ها:", err);
        }

        // ۳. فچ کردن درایو مشتریان
        try {
          const fRes = await fetchWithAuth('/client-folders/all');
          
          if (fRes.ok) {
            const fData = await fRes.json();
            if (fData.success && fData.data) {
              fCount = fData.data.length;
              console.log(`✅ پوشه‌های مشتریان: ${fCount}`);
            }
          }
        } catch (err) {
          console.error("خطا در دریافت پوشه مشتریان:", err);
        }

        setStats({ projects: pCount, messages: mCount, folders: fCount });

      } catch (error) {
        console.error('خطای کلی داشبورد:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // توابع فرمت زمان
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date: Date) => new Intl.DateTimeFormat('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-16 px-4 md:px-8 mt-6" style={{ fontFamily: persianFontFamily }} dir="rtl">
      
      {/* ======================= هدر داشبورد و ساعت لایو ======================= */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/5 pb-6 md:pb-8 relative"
      >
        <div className="absolute top-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>
        
        <div className="flex flex-col gap-2 relative z-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">مرکز فرماندهی</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1 leading-relaxed">نمای کلی سیستم، آمار زنده و دسترسی سریع به ابزارهای استودیو.</p>
        </div>

        {/* ⏱️ ویجت ساعت */}
        <div className="flex flex-col items-center xl:items-end bg-[#050505] border border-white/10 rounded-2xl px-6 py-4 shadow-xl relative z-10 w-full xl:w-auto">
          <span className={`text-3xl md:text-4xl font-black text-white tracking-widest ${orbitronFont.className}`} dir="ltr">
            {time ? formatTime(time) : '00:00:00'}
          </span>
          <span className="text-zinc-500 text-xs mt-2 font-medium">
            {time ? formatDate(time) : 'در حال همگام‌سازی...'}
          </span>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6 md:gap-8 relative z-10">
        
        {/* ======================= کارت‌های آماری (Stats) ======================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* کارت ۱: پوشه مشتریان */}
          <motion.div variants={itemVariants} className="bg-[#111111] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-400 text-xs md:text-sm font-medium">پوشه مشتریان فعال</span>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-12 w-16 bg-white/10 rounded-lg animate-pulse mt-2"></motion.div>
                ) : (
                  <motion.span key="val" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-4xl md:text-5xl font-black text-white tracking-tighter mt-2 ${outfitFont.className}`}>
                    {stats.folders < 10 && stats.folders > 0 ? `0${stats.folders}` : stats.folders}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* کارت ۲: پیام‌ها (کارت هایلایت شده) */}
          <motion.div variants={itemVariants} className="bg-white border border-white/20 rounded-3xl p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(255,255,255,0.1)] md:shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-black/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <span className="text-black bg-black/10 px-3 py-1 rounded-lg text-[10px] md:text-xs font-bold animate-pulse">زنده</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-black/60 text-xs md:text-sm font-bold">پیام‌های خوانده‌نشده</span>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-12 w-16 bg-black/10 rounded-lg animate-pulse mt-2"></motion.div>
                ) : (
                  <motion.span key="val" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-4xl md:text-5xl font-black text-black tracking-tighter mt-2 ${outfitFont.className}`}>
                    {stats.messages < 10 && stats.messages > 0 ? `0${stats.messages}` : stats.messages}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* کارت ۳: پروژه‌ها */}
          <motion.div variants={itemVariants} className="bg-[#111111] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors pointer-events-none"></div>
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-400 text-xs md:text-sm font-medium">پروژه‌های منتشر شده</span>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-12 w-16 bg-white/10 rounded-lg animate-pulse mt-2"></motion.div>
                ) : (
                  <motion.span key="val" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-4xl md:text-5xl font-black text-white tracking-tighter mt-2 ${outfitFont.className}`}>
                    {stats.projects < 10 && stats.projects > 0 ? `0${stats.projects}` : stats.projects}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ======================= دسترسی سریع (Quick Actions) ======================= */}
        <div className="mt-2 md:mt-4">
          <h3 className="text-white font-bold text-lg md:text-xl mb-4 md:mb-6">عملیات سریع</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            
            {/* اکشن ۱ */}
            <motion.div variants={itemVariants}>
              <Link href="/admin/projects/new" className="flex flex-col justify-between h-32 md:h-40 bg-[#050505] border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 group transition-all duration-300 hover:bg-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">آپلود پروژه جدید</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs">اضافه کردن نمونه کار به سایت</p>
                </div>
              </Link>
            </motion.div>

            {/* اکشن ۲ */}
            <motion.div variants={itemVariants}>
              <Link href="/admin/projects" className="flex flex-col justify-between h-32 md:h-40 bg-[#050505] border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 group transition-all duration-300 hover:bg-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">مدیریت نمونه‌کارها</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs">ویرایش، حذف و تغییر اولویت‌ها</p>
                </div>
              </Link>
            </motion.div>

            {/* اکشن ۳ */}
            <motion.div variants={itemVariants}>
              <Link href="/admin/contacts" className="flex flex-col justify-between h-32 md:h-40 bg-[#050505] border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 group transition-all duration-300 hover:bg-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">صندوق پیام‌ها</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs">بررسی درخواست‌های سایت</p>
                </div>
              </Link>
            </motion.div>

            {/* اکشن ۴ */}
            <motion.div variants={itemVariants}>
              <Link href="/admin/client-folders" className="flex flex-col justify-between h-32 md:h-40 bg-[#050505] border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 group transition-all duration-300 hover:bg-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">درایو مشتریان</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs">آپلود و مدیریت فایل‌های مشتری</p>
                </div>
              </Link>
            </motion.div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}