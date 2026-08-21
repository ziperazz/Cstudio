"use client";

import React from 'react';
import Link from 'next/link';
import { orbitronFont } from '@/app/fonts';


const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

export default function AdminTopbar() {
  return (
    <header 
      // 🎯 z-40 → z-10
      className="h-24 w-full flex items-center justify-between px-6 md:px-10 bg-[#050505]/90 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-10 transition-all"
      style={{ fontFamily: persianFontFamily }}
      dir="rtl"
    >
      
      <div className="flex flex-col justify-center gap-1.5 mt-1">
        <h1 className="text-white text-lg md:text-xl font-bold tracking-wide">
          پنل مدیریت استودیو
        </h1>
        <span 
          className={`text-zinc-500 text-[10px] md:text-xs tracking-[0.2em] uppercase ${orbitronFont.className}`} 
          dir="ltr"
        >
          C Studio • Control Center
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          href="/"
          target="_blank"
          className="group flex items-center gap-3 text-sm text-zinc-300 bg-[#111111] hover:bg-white hover:text-black px-5 py-3.5 rounded-2xl border border-white/5 hover:border-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        >
          <span className="font-bold mt-0.5">مشاهده سایت</span>
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
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