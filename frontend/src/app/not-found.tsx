"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 🎯 وارد کردن فونت‌های حرفه‌ای گوگل برای اعداد و کلمات انگلیسی
import { orbitronFont, outfitFont } from '@/app/fonts';



const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

export default function NotFoundPage() {
  return (
    <div 
      className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden selection:bg-white/10"
      style={{ fontFamily: persianFontFamily }}
      dir="rtl"
    >
      {/* ================= افکت‌های نوری پس‌زمینه ================= */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-white/5 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>
      
      {/* خطوط شبکه (Grid Lines) برای حس سایبری */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>

      {/* ================= محتوای اصلی ================= */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        
        {/* باکس خطای سیستم */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className={`text-red-400 text-xs tracking-widest font-bold ${outfitFont.className}`} dir="ltr">
            SYSTEM ERROR
          </span>
        </motion.div>

        {/* عدد 404 بزرگ */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="relative"
        >
          <h1 
            className={`text-[120px] md:text-[200px] font-black leading-none text-white tracking-tighter select-none ${orbitronFont.className}`}
            style={{ 
              textShadow: '0 0 40px rgba(255,255,255,0.1)',
            }}
            dir="ltr"
          >
            404
          </h1>
          {/* سایه عدد برای عمق دادن */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/5 blur-3xl pointer-events-none -z-10"></div>
        </motion.div>

        {/* متن‌های خطا */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-3 mt-4 mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            سیگنال قطع شد!
          </h2>
          <p className="text-zinc-500 text-sm md:text-base max-w-md mx-auto leading-relaxed font-light">
            مسیری که به دنبال آن هستید در دیتابیس استودیو وجود ندارد یا سطح دسترسی شما برای مشاهده آن کافی نیست.
          </p>
        </motion.div>

        {/* دکمه‌های بازگشت */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          {/* دکمه بازگشت به سایت اصلی */}
          <Link 
            href="/"
            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <span>بازگشت به سایت</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-x-1 transition-transform"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </Link>

          {/* دکمه بازگشت به پنل ادمین */}
          <Link 
            href="/admin"
            className="w-full sm:w-auto bg-[#111111] hover:bg-white/10 text-white border border-white/10 hover:border-white/30 font-medium px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 group-hover:text-white transition-colors"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>
            <span>مرکز فرماندهی</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}