"use client";

import React from 'react';
import Link from 'next/link';
import { orbitronFont } from '@/app/fonts';


const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

export default function AdminTopbar() {
  return (
    <header
      // 🎯 z-40 → z-10 | ارتفاع و پدینگ در موبایل کوچک‌تر شده تا فضای عمودی هدر نمایش هدر رو نگیره
      className="h-16 sm:h-20 md:h-24 w-full flex items-center justify-between gap-3 px-4 sm:px-6 md:px-10 bg-[#050505]/90 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-10 transition-all"
      style={{ fontFamily: persianFontFamily }}
      dir="rtl"
    >

      <div className="flex flex-col justify-center gap-1 sm:gap-1.5 min-w-0">
        <h1 className="text-white text-lg sm:text-xl md:text-2xl font-bold tracking-wide truncate">
          پنل مدیریت استودیو
        </h1>
        {/* 🎯 زیرنویس فقط از sm به بالا نشون داده میشه تا توی موبایل با تیتر و دکمه شلوغ نشه */}
        <span
          className={`hidden sm:block text-zinc-500 text-[10px] md:text-xs tracking-[0.2em] uppercase ${orbitronFont.className}`}
          dir="ltr"
        >
          C Studio • Control Center
        </span>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        {/* 🎯 توی موبایل فقط آیکون (دایره‌ای و جمع‌وجور)، از sm به بالا با متن کامل */}
        <Link
          href="/"
          target="_blank"
          title="مشاهده سایت"
          className="group flex items-center justify-center gap-0 sm:gap-3 w-10 h-10 sm:w-auto sm:h-auto shrink-0 text-sm text-zinc-300 bg-[#111111] hover:bg-white hover:text-black sm:px-5 sm:py-3.5 rounded-full sm:rounded-2xl border border-white/5 hover:border-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          <span className="hidden sm:inline font-bold mt-0.5">مشاهده سایت</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="sm:w-[18px] sm:h-[18px] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </Link>
      </div>

    </header>
  );
}