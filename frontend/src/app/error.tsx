"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// 🎯 وارد کردن فونت‌های حرفه‌ای گوگل برای اعداد و کلمات انگلیسی
import { orbitronFont, outfitFont } from '@/app/fonts';



const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  
  // لاگ کردن ارور در کنسول برای دیباگ ادمین
  useEffect(() => {
    console.error("🚨 سیستم با خطای زیر مواجه شد:", error);
  }, [error]);

  return (
    <div 
      className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center relative overflow-hidden selection:bg-red-500/30"
      style={{ fontFamily: persianFontFamily }}
      dir="rtl"
    >
      {/* ================= افکت‌های نوری پس‌زمینه (تم هشدار) ================= */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-red-500/5 rounded-full blur-[100px] md:blur-[150px] pointer-events-none"></div>
      
      {/* خطوط شبکه (Grid Lines) با رنگ قرمز خیلی محو */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] pointer-events-none"></div>

      {/* ================= محتوای اصلی ================= */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-2xl">
        
        {/* باکس خطای بحرانی */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-full mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className={`text-red-400 text-xs tracking-widest font-bold ${outfitFont.className}`} dir="ltr">
            CRITICAL FAILURE
          </span>
        </motion.div>

        {/* آیکون و عدد خطا */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          className="relative flex flex-col items-center justify-center mb-6"
        >
          <div className="w-24 h-24 md:w-32 md:h-32 bg-red-500/5 border border-red-500/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm relative">
             <div className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-20"></div>
             <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500 md:w-16 md:h-16">
               <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
               <line x1="12" y1="9" x2="12" y2="13"></line>
               <line x1="12" y1="17" x2="12.01" y2="17"></line>
             </svg>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            خطای پردازش سیستم!
          </h1>
        </motion.div>

        {/* متن‌های خطا */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-3 w-full"
        >
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light">
            متأسفانه در هنگام ارتباط با سرور و پردازش اطلاعات خطای غیرمنتظره‌ای رخ داده است.
          </p>

          {/* باکس ترمینال-طوری برای نمایش متن ارور واقعی به ادمین */}
          <div className="mt-4 bg-[#0a0a0a] border border-red-500/10 p-4 md:p-5 rounded-2xl w-full text-left overflow-x-auto relative group">
            <span className={`absolute top-2 right-4 text-[10px] text-zinc-600 tracking-widest uppercase font-bold ${outfitFont.className}`}>Error Log</span>
            <code className={`text-red-400/80 text-xs md:text-sm font-medium tracking-wide ${outfitFont.className}`} dir="ltr">
              &gt; {error.message || "Internal Server Error (500)"}
              {error.digest && <span className="block mt-1 text-zinc-500 text-[10px]">Digest: {error.digest}</span>}
            </code>
          </div>
        </motion.div>

        {/* دکمه‌های عملیات */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-10"
        >
          {/* دکمه تلاش مجدد (اجرای تابع reset) */}
          <button 
            onClick={() => reset()}
            className="w-full sm:w-auto bg-white hover:bg-zinc-200 text-black font-bold px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><polyline points="3 3 3 8 8 8"></polyline></svg>
            <span>تلاش مجدد</span>
          </button>

          {/* دکمه بازگشت به داشبورد */}
          <Link 
            href="/admin"
            className="w-full sm:w-auto bg-[#111111] hover:bg-white/10 text-white border border-white/10 hover:border-white/30 font-medium px-8 py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500 group-hover:text-white transition-colors"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>
            <span>داشبورد</span>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}