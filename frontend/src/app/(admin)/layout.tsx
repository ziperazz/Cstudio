"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import { getAdminToken, clearAdminSession } from '@/utils/adminAuth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // توکن از کوکی یا localStorage خوانده می‌شود (هرکدام که موجود باشد).
    // خواندن مستقیم localStorage در سافاری می‌توانست استثنا پرتاب کند و
    // در نتیجه ریدایرکت به صفحه‌ی ورود هیچ‌وقت اجرا نمی‌شد.
    const token = getAdminToken();

    if (!token) {
      // نشست ناقص احتمالی هم پاک می‌شود تا middleware دوباره اجازه‌ی ورود ندهد
      clearAdminSession();
      // replace به‌جای push تا صفحه‌ی پنل در تاریخچه‌ی مرورگر نماند
      router.replace('/auth');
      // پشتیبان: اگر به هر دلیلی ناوبری کلاینتی انجام نشد، مرورگر را دستی منتقل می‌کنیم
      const fallback = setTimeout(() => {
        if (window.location.pathname.startsWith('/admin')) {
          window.location.replace('/auth');
        }
      }, 600);
      return () => clearTimeout(fallback);
    }

    setIsAuthenticated(true);
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