"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import localFont from 'next/font/local';
import { orbitronFont, outfitFont } from '@/app/fonts';
import { fetchWithAuth } from '@/utils/api';

// 🎨 فونت‌های پروژه
const azarMehr = localFont({
  src: [
    {
      path: '../../../../public/fonts/AzarMehr/AzarMehr-FD-VF[wght,kshd].woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../../public/fonts/AzarMehr/AzarMehr-FD-VF[wght,kshd].woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../../../public/fonts/AzarMehr/AzarMehr-FD-VF[wght,kshd].woff2',
      weight: '900',
      style: 'normal',
    },
  ],
  variable: '--font-azar-mehr',
});

const globalBgColor = "#050505";
const cColor = "#888888";
const studioColor = "#FFFFFF";
const logoHoverColor = "#FFFFFF";

interface ClientFolder {
  _id: string;
  title: string;
  description: string;
  driveLink: string;
  createdAt: string;
}

// ✨ Ambient Floating Particles
const AmbientParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{x: number; y: number; size: number; opacity: number; speed: number}> = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const createParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.8 + 0.4,
          opacity: Math.random() * 0.35 + 0.08,
          speed: Math.random() * 0.25 + 0.05
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };

    resize();
    createParticles();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-50" />;
};

export default function ClientDashboardPage() {
  const router = useRouter();
  const [folders, setFolders] = useState<ClientFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientName, setClientName] = useState('کاربر');
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const headerTextRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const fetchClientData = async () => {
      try {
        setIsLoading(true);
        const storedClient = localStorage.getItem('clientInfo');
        if (storedClient) {
          const parsed = JSON.parse(storedClient);
          setClientName(parsed.name || 'کاربر');
        }

        const res = await fetchWithAuth('/client-folders/my-folders', {}, 'client');
        const data = await res.json();

        if (data.success) {
          setFolders(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching folders', err);
        setFolders([
          { _id: '1', title: 'کمپین ریبرندینگ', description: 'فایل‌های نهایی تیزر تبلیغاتی و سورس‌های گرافیکی که در طول پروژه نهایی شده‌اند. لطفاً پیش از موعد مقرر بررسی نمایید.', driveLink: '#', createdAt: '2026-08-10' },
          { _id: '2', title: 'عکاسی محصول', description: 'شات‌های ادیت شده کالکشن پاییزه', driveLink: '#', createdAt: '2026-07-22' },
          { _id: '3', title: 'موشن گرافیک', description: 'پروژه معرفی خدمات اپلیکیشن', driveLink: '#', createdAt: '2026-06-15' },
          { _id: '4', title: 'طراحی سایت', description: 'سورس کدهای فرانت‌اند و بک‌اند', driveLink: '#', createdAt: '2026-05-02' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, []);

  // 🎬 Smooth Entrance Animation
  useEffect(() => {
    if (isLoading || !mainContainerRef.current) return;

    let ctx = gsap.context(() => {
      gsap.fromTo(headerTextRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" }
      );

      const cards = gsap.utils.toArray('.project-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: gridRef.current,
              start: "top 85%",
            }
          }
        );
      }
    }, mainContainerRef);

    return () => ctx.revert();
  }, [isLoading]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('clientInfo');
    router.push('/auth');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div 
      ref={mainContainerRef} 
      className={`relative min-h-screen overflow-hidden selection:bg-white/30 selection:text-white ${azarMehr.variable} ${outfitFont.variable}`}
      style={{ backgroundColor: globalBgColor }} 
      dir="rtl"
    >
      <AmbientParticles />
      
      {/* 👑 لوگوی اصلی */}
      <header className="fixed top-0 left-0 w-full z-50 h-[80px] md:h-[100px] bg-transparent pointer-events-none" dir="ltr">
        <div className="absolute transition-all duration-500 z-[60] pointer-events-auto left-[24px] md:left-[35px] top-[24px] md:top-[28px]">
          <Link href="/" className="group relative flex items-center cursor-pointer">
            <div className="flex items-center">
              <div className="relative transition-colors duration-500 group-hover:text-[var(--hover-color)]" style={{ color: cColor, width: "clamp(28px, 3vw, 43px)", height: "clamp(34px, 3.5vw, 52px)", '--hover-color': logoHoverColor } as React.CSSProperties}>
                <div className="absolute inset-0 border-current rounded-l-full border-y border-l" style={{ borderRight: 'none', borderWidth: "clamp(6px, 0.8vw, 10px)" }} />
              </div>
              <span className={`transition-colors duration-500 group-hover:text-[var(--hover-color)] tracking-wider font-bold leading-none ${orbitronFont.className}`} style={{ color: studioColor, fontSize: "clamp(14px, 1.5vw, 25px)", marginLeft: "clamp(-6px, -0.8vw, -13px)", '--hover-color': logoHoverColor } as React.CSSProperties}>
                STUDIO
              </span>
            </div>
          </Link>
        </div>
        
        <div className="absolute right-[24px] md:right-[35px] top-[24px] md:top-[28px] z-[60] pointer-events-auto" dir="rtl">
          <button onClick={handleLogout} className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-colors duration-300">
            <span className="font-bold tracking-[0.2em] text-xs uppercase mt-1 hidden md:block" style={{ fontFamily: outfitFont.style.fontFamily }}>Logout</span>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-white transition-colors bg-black/50 backdrop-blur-md">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-hover:-translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </div>
          </button>
        </div>
      </header>

      {/* 📐 Main Content */}
      <main className="relative w-full pt-[140px] md:pt-[180px] pb-[100px] px-6 md:px-0 z-10">
        
        <div className="max-w-[1400px] mx-auto lg:px-[60px] w-full">
          
          {/* 💎 Welcome Section */}
          <div ref={headerTextRef} className="mb-12 md:mb-20 flex flex-col gap-3">
            <span 
              className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs"
              style={{ fontFamily: outfitFont.style.fontFamily }}
              dir="ltr"
            >
              CLIENT VAULT
            </span>
            <h1 
              className="text-4xl md:text-5xl lg:text-[65px] font-black text-white tracking-tighter leading-tight"
              style={{ fontFamily: azarMehr.style.fontFamily }}
            >
              سلام،{' '}
              <span className="text-zinc-400">{clientName}.</span>
            </h1>
            <p 
              className="text-zinc-400 font-light text-sm md:text-base leading-relaxed max-w-md mt-2"
              style={{ fontFamily: azarMehr.style.fontFamily }}
            >
              فایل‌های پروژه‌های شما اینجا آماده دانلود هستن.
            </p>
          </div>

          {/* 📦 Project Grid */}
          <div ref={gridRef} className="relative">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
                  exit={{ opacity: 0 }}
                >
                  {[1, 2, 3].map(i => (
                    <div key={i} className="min-h-[280px] md:min-h-[320px] rounded-[24px] bg-zinc-900/30 border border-white/5 animate-pulse" />
                  ))}
                </motion.div>
              ) : folders.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full aspect-video max-h-[400px] border border-white/10 rounded-[24px] flex flex-col items-center justify-center text-center p-8 bg-zinc-900/10 backdrop-blur-xl"
                >
                  <h2 
                    className="text-white font-black text-xl md:text-3xl mb-3 tracking-tight"
                    style={{ fontFamily: azarMehr.style.fontFamily }}
                  >
                    پروژه‌ای یافت نشد.
                  </h2>
                  <p 
                    className="text-zinc-400 text-sm md:text-base max-w-md font-light leading-relaxed"
                    style={{ fontFamily: azarMehr.style.fontFamily }}
                  >
                    فایل‌های نهایی پروژه‌های شما پس از تکمیل، در این صندوقچه امن قرار خواهند گرفت.
                  </p>
                </motion.div>
              ) : (
                <div 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6 group/grid"
                >
                  {folders.map((folder, idx) => (
                    <a 
                      key={folder._id} 
                      href={folder.driveLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onMouseEnter={() => setActiveCard(folder._id)} 
                      onMouseLeave={() => setActiveCard(null)} 
                      // 🚀 حل باگ: حذف h-fixed، استفاده از min-h برای ارتفاع و همیشه باز بودنِ توضیحات
                      className={`project-card relative overflow-hidden rounded-[24px] bg-zinc-900/20 border transition-all duration-500 cursor-pointer flex flex-col justify-between p-6 md:p-8 min-h-[280px] md:min-h-[320px]
                        ${activeCard === folder._id ? 'border-white/30 bg-zinc-800/40 scale-[1.02] shadow-2xl z-10' : 'border-white/10'}
                        ${activeCard && activeCard !== folder._id ? 'opacity-40 scale-[0.98]' : 'opacity-100'}
                      `}
                    >
                      {/* پس‌زمینه گرادیانت */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-zinc-800/30 to-black transition-opacity duration-700 pointer-events-none ${activeCard === folder._id ? 'opacity-100' : 'opacity-50'}`} />
                      
                      {/* هدرِ داخل کارت */}
                      <div className="relative z-10 flex justify-between items-start w-full">
                        <span 
                          className={`text-lg md:text-xl font-black transition-colors duration-500 ${activeCard === folder._id ? 'text-white' : 'text-white/40'}`}
                          style={{ fontFamily: outfitFont.style.fontFamily }}
                          dir="ltr"
                        >
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        
                        {/* آیکون فلش */}
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-500 ${activeCard === folder._id ? 'bg-white border-white text-black' : 'bg-transparent border-zinc-700 text-white'}`}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                        </div>
                      </div>
                      
                      {/* 🚀 محتوای متنی پایین کارت (بدون قایم موشک بازی، همیشه هست) */}
                      <div className="relative z-10 w-full flex flex-col justify-end mt-auto pt-8">
                        <h3 
                          className="font-black text-xl md:text-2xl text-white mb-3"
                          style={{ fontFamily: azarMehr.style.fontFamily }}
                        >
                          {folder.title}
                        </h3>
                        
                        {/* لاین کلمپ برای جلوگیری از خراب شدن گرید وقتی متن زیاده */}
                        <p 
                          className="text-zinc-400 font-light text-sm md:text-base leading-relaxed line-clamp-3"
                          style={{ fontFamily: azarMehr.style.fontFamily }}
                        >
                          {folder.description}
                        </p>
                        
                        <div className="mt-5 flex items-center gap-2 opacity-80">
                          <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                          <span 
                            className="text-[10px] md:text-xs text-zinc-400 font-bold uppercase tracking-widest"
                            dir="ltr" 
                            style={{ fontFamily: outfitFont.style.fontFamily }}
                          >
                            {formatDate(folder.createdAt)}
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}