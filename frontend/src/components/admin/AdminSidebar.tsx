"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { orbitronFont } from '@/app/fonts';

const orbitron = orbitronFont;
const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

// 🎛️ تنظیمات دقیق لوگو (همانند هدر اصلی سایت)
const cColor = "#888888";                
const studioColor = "#FFFFFF";           
const cLogoWidth = "35px";               
const cLogoHeight = "42px";              
const cThickness = "8px";                
const studioFontSize = "22px";           
const studioOverlap = "-10px";           

// 📋 لیست منوهای پنل ادمین
const menuItems = [
  { name: 'داشبورد', path: '/admin', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"></rect><rect x="14" y="3" width="7" height="5" rx="1"></rect><rect x="14" y="12" width="7" height="9" rx="1"></rect><rect x="3" y="16" width="7" height="5" rx="1"></rect></svg>
  )},
  { name: 'صندوق پیام‌ها', path: '/admin/contacts', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
  )},
  { name: 'نمونه کارها', path: '/admin/projects', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
  )},
  { name: 'آپلود پروژه', path: '/admin/projects/new', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
  )},
  // 🚀 منوی جدید فضای ذخیره‌سازی سرور
  { name: 'فضای ذخیره‌سازی', path: '/admin/media', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
  )},
  { name: 'مدیریت مشتریان', path: '/admin/team', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  )},
  { name: 'درایو مشتریان', path: '/admin/client-folders', icon: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
  )},
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // با تغییر صفحه در موبایل، منو به صورت خودکار بسته شود
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    if(confirm('آیا از خروج خود اطمینان دارید؟')) {
      localStorage.removeItem('adminToken');
      router.push('/auth');
    }
  };

  // 🧩 هسته اصلی محتوای سایدبار 
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div 
      className="w-72 h-full bg-[#050505] border-l border-white/5 flex flex-col justify-between py-10 px-5 relative z-50 overflow-y-auto hide-scrollbar shadow-2xl"
      style={{ fontFamily: persianFontFamily }}
      dir="rtl"
    >
      <div>
        {/* 🎨 بخش لوگوی اصلی */}
        <Link href="/" className="group relative flex items-center cursor-pointer mb-14 justify-center" dir="ltr">
          <div className="flex items-center hover:scale-105 transition-transform duration-500">
            <div 
              className="relative transition-colors duration-500"
              style={{ color: cColor, width: cLogoWidth, height: cLogoHeight }}
            >
              <div 
                className="absolute inset-0 border-current rounded-l-full border-y border-l"
                style={{ borderRight: 'none', borderWidth: cThickness }}
              />
            </div>
            <span 
              className={`tracking-widest font-black leading-none uppercase ${orbitron.className}`}
              style={{ color: studioColor, fontSize: studioFontSize, marginLeft: studioOverlap }}
            >
              STUDIO
            </span>
          </div>
        </Link>

        {/* 📋 منوها */}
        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link key={item.path} href={item.path} className="relative group">
                {isActive && (
                  <motion.div
                    layoutId={`active-bg-${isMobile ? 'mobile' : 'desktop'}`}
                    className="absolute inset-0 bg-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${isActive ? 'text-black font-bold' : 'text-zinc-500 hover:text-white hover:bg-white/5 font-medium'}`}>
                  {/* اعمال strokeWidth متفاوت برای حالت اکتیو */}
                  <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {React.cloneElement(item.icon, { strokeWidth: isActive ? 2.5 : 2 })}
                  </div>
                  <span className="text-[15px] tracking-wide mt-0.5">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 🚪 دکمه خروج */}
      <button 
        onClick={handleLogout}
        className="group flex items-center gap-4 px-5 py-4 mt-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all duration-300 border border-transparent hover:border-red-500/20"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        <span className="font-bold text-[15px] mt-0.5">خروج از پنل</span>
      </button>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );

  return (
    <>
      {/* 💻 نسخه دسکتاپ */}
      <aside className="hidden md:block w-72 h-screen shrink-0 relative z-30 sticky top-0">
        <SidebarContent />
      </aside>

      {/* 📱 نسخه موبایل */}
      <div className="md:hidden">
        {/* دکمه شناور باز کردن منو */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
        </button>

        {/* لایه تاریک پس‌زمینه و دراور سایدبار */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 cursor-pointer"
              />
              
              {/* Sliding Drawer */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="fixed top-0 right-0 h-full shadow-2xl z-50"
              >
                <SidebarContent isMobile={true} />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}