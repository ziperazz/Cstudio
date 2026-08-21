"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // چک کردن توکن امنیتی ادمین
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      // اگر توکنی نبود، سریعاً هدایت میشه به صفحه ورود
      router.push('/auth');
    } else {
      // اگر توکن بود، اجازه ورود میده
      setIsAuthenticated(true);
    }
  }, [router]);

  // تا زمانی که وضعیت لاگین مشخص نشده، این لودینگ فضایی نمایش داده میشه
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"
        />
      </div>
    );
  }

  // اگر احراز هویت موفق بود، داشبورد رندر میشه
  return (
    <div 
      className="flex h-screen bg-black overflow-hidden font-['AzarMehr'] text-white" 
      dir="rtl"
    >
      {/* سایدبار سمت راست */}
      <AdminSidebar />
      
      {/* بخش محتوای اصلی (سمت چپ) */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-[url('/bg-noise.png')] bg-repeat opacity-95">
        
        {/* افکت نوری پس‌زمینه داشبورد */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-zinc-800/30 rounded-full blur-[120px] pointer-events-none" />

        {/* هدر بالای پنل */}
        <AdminTopbar />
        
        {/* این children همون صفحات داخلی پنل هستن (مثل لیست پروژه‌ها) */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative z-10 scrollbar-hide">
          {children}
        </main>

      </div>
    </div>
  );
}