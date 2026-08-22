"use client";

import React, { useRef, useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 🎯 وارد کردن کامپوننت‌ها
import ContactDrawer from '@/components/ContactDrawer';
import Preloader from '@/components/Preloader';

// 🎯 وارد کردن فونت‌های گوگل
import { orbitronFont } from '@/app/fonts';

gsap.registerPlugin(ScrollTrigger);

// 🎛️===================================================================🎛️
//                   داشبورد تنظیمات صفحه نمونه کارها (WORKS)
// 🎛️===================================================================🎛️

const bgColor = "#000000";               
const textColor = "#FFFFFF";             

const worksWordText = "WORK";
const worksWordFontSize = "260px";       
const englishFontFamily = '"Outfit", sans-serif'; 
const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

const worksWordXOffset = "40px";         
const worksWordYOffset = "80px";        

const worksRowGap = "80px";              
const worksColGap = "20px";              
const worksBoxGlobalScale = 1.0;         

const worksMobileGap = "40px";           
const worksMobilePadding = "20px";       

const boxBorderRadius = "16px";          
const boxType1Width = "900px";           
const boxType1Height = "1310px";         
const boxType2Width = "900px";           
const boxType2Height = "600px";          
const boxType3Width = "600px";           
const boxType3Height = "380px";          
const boxType4Width = "900px";           
const boxType4Height = "580px";          

const worksImageHoverScale = 1.08;       
const worksImageHoverSpeed = "0.7s";     
const worksOverlayOpacity = 0.0;         

const worksTextMarginTop = "25px";       
const worksTitleFontSize = "35px";       
const worksSubFontSize = "20px";         

// ⏱️ تنظیم زمان پری‌لودر
const preloaderDurationMs = 2700;        

const loadMoreBtnText = "دیدن ادامه نمونه کار ها";
const loadMoreBtnWidth = "280px";
const loadMoreBtnHeight = "70px";
const loadMoreBtnMarginTop = "100px";
const loadMoreBtnFontSize = "18px";

const wordStartX = "-300px";     
const wordAnimDuration = 1.5;    
const wordAnimDelay = 0.5;       
const boxesStartY = "200px";     
const boxesAnimDuration = 1.5;   

// 🎛️===================================================================🎛️
//                   تنظیمات هدر و منوی همبرگری
// 🎛️===================================================================🎛️
const cColor = "#888888";                
const studioColor = "#FFFFFF";           
const logoHoverColor = "#FFFFFF";        
const logoTopOffset = "28px";            
const logoLeftOffset = "clamp(20px, 4vw, 35px)"; 
const cLogoWidth = "43px";               
const cLogoHeight = "52px";              
const cThickness = "10px";               
const studioFontSize = "25px";           
const studioOverlap = "-13px";           

const burgerTopOffset = "28px";          
const burgerRightOffset = "clamp(20px, 4vw, 35px)"; 
const menuBlurIntensity = "blur(40px)";  
const menuBgOpacity = "bg-black/80";     
const menuHoverTextColor = "#404040";    

const navLinks = [
  { name: 'خانه', href: '/' },
  { name: 'نمونه کارها', href: '/works' },
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس با ما', href: '/contact' },
  { name: 'پنل مدیریت', href: '/auth' },
];

const menuVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1] } },
  exit: { opacity: 0, transition: { duration: 0.6, ease: [0.76, 0, 0.24, 1], delay: 0.2 } }
};
const containerVariants = {
  initial: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
  animate: { transition: { delayChildren: 0.1, staggerChildren: 0.05, staggerDirection: 1 } }
};
const linkVariants = {
  initial: { y: 30, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.33, 1, 0.68, 1] } },
  exit: { y: 15, opacity: 0, transition: { duration: 0.3 } }
};

// 🎯 دیتا و کانسپت دسته‌بندی معمارانه (فارسی شده)
const CATEGORIES = [
  { id: 'all', title: 'همه' },
  { id: 'teaser', title: 'تیزر تبلیغاتی' },
  { id: 'content', title: 'تولید محتوا' },
  { id: 'product', title: 'معرفی محصول' },
  { id: 'service', title: 'معرفی خدمات' },
  { id: 'campaign', title: 'اجرای کمپین' },
  { id: 'web', title: 'طراحی سایت' }
];

// 🚀 آپدیت اینترفیس
interface Project {
  _id: string;
  companyName: string;
  teaserName: string;
  slug: string;
  description: string;
  category?: string; 
  videos: string[];
  createdAt: string;
}

// =====================================================================
// 📦 کامپوننت‌های رندر باکس 
// =====================================================================
const RenderBox = ({ data, boxWidth, boxHeight, boxRadius }: { data: Project, boxWidth: string, boxHeight: string, boxRadius: string }) => {
  if (!data) return null;

  const w = parseFloat(boxWidth);
  const h = parseFloat(boxHeight);
  const ratio = `${w} / ${h}`; 

  const videoSrc = data.videos && data.videos.length > 0 ? `http://localhost:5000${data.videos[0]}` : '';

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const media = e.currentTarget.querySelector('.work-media') as HTMLVideoElement;
    if (media) {
      media.style.transform = `scale(${worksImageHoverScale})`;
      media.play().catch(() => {});
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const media = e.currentTarget.querySelector('.work-media') as HTMLVideoElement;
    if (media) {
      media.style.transform = 'scale(1)';
      media.pause();
      media.currentTime = 0;
    }
  };

  const mainTitle = data.teaserName || 'تیزر استودیو';
  const subTitle = data.companyName || 'C STUDIO';

  return (
    <Link 
      href={`/works/${data.slug}`}
      className="flex flex-col w-full h-full group" 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-zinc-900 overflow-hidden relative cursor-pointer w-full" style={{ maxWidth: boxWidth, aspectRatio: ratio, borderRadius: boxRadius }}>
        {videoSrc ? (
          <video 
            src={videoSrc} 
            muted 
            loop 
            playsInline 
            className="work-media absolute inset-0 w-full h-full object-cover" 
            style={{ transition: `transform ${worksImageHoverSpeed} cubic-bezier(0.25, 1, 0.5, 1)`, transform: "scale(1)" }} 
          />
        ) : (
          <div className="work-media absolute inset-0 w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-600 transition-transform duration-700">بدون ویدیو</div>
        )}
        <div className="absolute inset-0 pointer-events-none transition-colors duration-500" style={{ backgroundColor: `rgba(0,0,0,${worksOverlayOpacity})` }} />
      </div>
      <div className="flex items-center gap-4 md:gap-6 w-full" style={{ marginTop: worksTextMarginTop }}>
        <h4 className="font-black uppercase tracking-widest leading-tight text-[22px] md:text-[35px] truncate" style={{ color: textColor }}>{mainTitle}</h4>
        <div className="h-[2px] w-[30px] md:w-[50px] bg-zinc-600 shrink-0 group-hover:bg-white transition-colors" />
        <span className="font-light text-zinc-400 text-[16px] md:text-[20px] leading-tight truncate">{subTitle}</span>
      </div>
    </Link>
  );
};

const AnimatedRow = ({ children, delay = 0, isFirstChunk = false, isPreloading = true }: { children: React.ReactNode, delay?: number, isFirstChunk?: boolean, isPreloading?: boolean }) => {
  if (isPreloading) {
    return (
      <div className="flex flex-col md:flex-row w-full justify-center opacity-0" style={{ gap: 'var(--grid-gap)', marginTop: isFirstChunk && delay === 0.7 ? '0px' : 'var(--row-gap)' }}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: parseFloat(boxesStartY) }}
      animate={!isPreloading && isFirstChunk ? { opacity: 1, y: 0 } : undefined}
      whileInView={!isPreloading && !isFirstChunk ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: boxesAnimDuration, ease: [0.16, 1, 0.3, 1], delay }}
      className="flex flex-col md:flex-row w-full justify-center"
      style={{ gap: 'var(--grid-gap)', marginTop: isFirstChunk && delay === 0.7 ? '0px' : 'var(--row-gap)' }}
    >
      {children}
    </motion.div>
  );
};

// =====================================================================
// 🎬 کامپوننت محتوای صفحه با پشتیبانی از URL SearchParams
// =====================================================================
function WorksContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const [isPreloading, setIsPreloading] = useState(true); 
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);

  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [visibleCount, setVisibleCount] = useState(11); 
  const [isLoading, setIsLoading] = useState(true);

  const pageRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPreloading(false);
    }, preloaderDurationMs); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isPreloading || mobileMenuOpen || contactDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isPreloading, mobileMenuOpen, contactDrawerOpen]);

  // 🔄 فچ کردن اطلاعات از دیتابیس
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/projects`, { cache: 'no-store' });
        const data = await res.json();
        if (data.success) {
          setAllProjects(data.data || []);
        }
      } catch (err) {
        console.error('خطا در دریافت پروژه‌ها', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // 🎯 فیلتر کردن پروژه‌ها با تغییر URL و انیمیشن شاهکار GSAP
  useEffect(() => {
    if (isLoading) return;
    
    let filtered = allProjects;
    if (activeCategory !== 'all') {
      filtered = allProjects.filter(p => p.category === activeCategory);
    }
    
    setFilteredProjects(filtered);
    setVisibleCount(11);

    if (gridRef.current) {
      gsap.fromTo(gridRef.current,
        { opacity: 0, y: 40, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      );
      setTimeout(() => ScrollTrigger.refresh(), 100);
    }
  }, [activeCategory, allProjects, isLoading]);

useEffect(() => {
    if (isPreloading || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(pageRef.current, { opacity: 1, duration: 1.2, ease: "power2.out" });
      
      // 🎯 انیمیشن WORK
      gsap.fromTo(".works-word-wrapper",
        { x: wordStartX, opacity: 0 },
        { x: 0, opacity: 1, duration: wordAnimDuration, delay: wordAnimDelay, ease: "power3.out" }
      );

      // 🎯 انیمیشن فیلترها - دقیقاً مثل WORK
      gsap.fromTo(".filters-wrapper",
        { x: wordStartX, opacity: 0 },
        { x: 0, opacity: 1, duration: wordAnimDuration, delay: wordAnimDelay + 0.3, ease: "power3.out" }
      );
    });
    return () => ctx.revert();
  }, [isPreloading]);

  const handleCategoryChange = (catId: string) => {
    if (catId === activeCategory) return;
    
    if (gridRef.current) {
      gsap.to(gridRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.4,
        ease: "power2.inOut",
        onComplete: () => {
          router.push(`/works?category=${catId}`, { scroll: false });
        }
      });
    } else {
      router.push(`/works?category=${catId}`, { scroll: false });
    }
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 11); 
  };

  const renderGridChunks = () => {
    const chunks = [];
    for (let i = 0; i < visibleCount && i < filteredProjects.length; i += 11) {
      chunks.push(filteredProjects.slice(i, i + 11));
    }

    return chunks.map((chunk, chunkIndex) => {
      const isFirstChunk = chunkIndex === 0;

      return (
        <div key={chunkIndex} className="w-full flex flex-col items-center" style={{ marginTop: chunkIndex > 0 ? 'var(--row-gap)' : '0px' }}>
          
          {(chunk[0] || chunk[1] || chunk[2]) && (
            <AnimatedRow delay={isFirstChunk ? 0.7 : 0.1} isFirstChunk={isFirstChunk} isPreloading={isPreloading}>
              <div className="flex flex-col justify-between w-full" style={{ gap: 'var(--grid-gap)', maxWidth: boxType2Width }}>
                {chunk[1] && <RenderBox data={chunk[1]} boxWidth={boxType2Width} boxHeight={boxType2Height} boxRadius={boxBorderRadius} />}
                {chunk[2] && <RenderBox data={chunk[2]} boxWidth={boxType2Width} boxHeight={boxType2Height} boxRadius={boxBorderRadius} />}
              </div>
              {chunk[0] && (
                <div className="flex flex-col w-full mt-10 md:mt-0" style={{ maxWidth: boxType1Width }}>
                  <RenderBox data={chunk[0]} boxWidth={boxType1Width} boxHeight={boxType1Height} boxRadius={boxBorderRadius} />
                </div>
              )}
            </AnimatedRow>
          )}

          {/* 🎯 ردیف دوم اصلاح شده: ۲ باکس غول‌پیکر برای پر کردن صفحه */}
          {(chunk[3] || chunk[4]) && (
            <AnimatedRow delay={isFirstChunk ? 0.85 : 0.1} isFirstChunk={isFirstChunk} isPreloading={isPreloading}>
              {chunk[3] && <div className="w-full" style={{ maxWidth: boxType4Width }}><RenderBox data={chunk[3]} boxWidth={boxType4Width} boxHeight={boxType4Height} boxRadius={boxBorderRadius} /></div>}
              {chunk[4] && <div className="w-full mt-10 md:mt-0" style={{ maxWidth: boxType4Width }}><RenderBox data={chunk[4]} boxWidth={boxType4Width} boxHeight={boxType4Height} boxRadius={boxBorderRadius} /></div>}
            </AnimatedRow>
          )}

          {(chunk[5] || chunk[6] || chunk[7]) && (
            <AnimatedRow delay={isFirstChunk ? 1.0 : 0.1} isFirstChunk={isFirstChunk} isPreloading={isPreloading}>
              {chunk[5] && <div className="w-full" style={{ maxWidth: boxType3Width }}><RenderBox data={chunk[5]} boxWidth={boxType3Width} boxHeight={boxType3Height} boxRadius={boxBorderRadius} /></div>}
              {chunk[6] && <div className="w-full" style={{ maxWidth: boxType3Width }}><RenderBox data={chunk[6]} boxWidth={boxType3Width} boxHeight={boxType3Height} boxRadius={boxBorderRadius} /></div>}
              {chunk[7] && <div className="w-full" style={{ maxWidth: boxType3Width }}><RenderBox data={chunk[7]} boxWidth={boxType3Width} boxHeight={boxType3Height} boxRadius={boxBorderRadius} /></div>}
            </AnimatedRow>
          )}

          {(chunk[8] || chunk[9] || chunk[10]) && (
            <AnimatedRow delay={isFirstChunk ? 1.15 : 0.1} isFirstChunk={isFirstChunk} isPreloading={isPreloading}>
              {chunk[8] && (
                <div className="flex flex-col w-full" style={{ maxWidth: boxType1Width }}>
                  <RenderBox data={chunk[8]} boxWidth={boxType1Width} boxHeight={boxType1Height} boxRadius={boxBorderRadius} />
                </div>
              )}
              <div className="flex flex-col justify-between w-full mt-10 md:mt-0" style={{ gap: 'var(--grid-gap)', maxWidth: boxType2Width }}>
                {chunk[9] && <RenderBox data={chunk[9]} boxWidth={boxType2Width} boxHeight={boxType2Height} boxRadius={boxBorderRadius} />}
                {chunk[10] && <RenderBox data={chunk[10]} boxWidth={boxType2Width} boxHeight={boxType2Height} boxRadius={boxBorderRadius} />}
              </div>
            </AnimatedRow>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <Preloader />

      <div ref={pageRef} className="page-wrapper relative w-full min-h-screen overflow-clip opacity-0" style={{ backgroundColor: bgColor }}>
        <style jsx global>{`
          @font-face { font-family: 'Outfit'; src: url('/fonts/OutfitSemiBold.ttf') format('truetype'); font-weight: 600; font-style: normal; }
          @font-face { font-family: 'AzarMehr'; src: url('/fonts/AzarMehr/Static/woff2/400-AzarMehr-FD-Regular.woff2') format('woff2'); font-weight: 400; font-style: normal; }

          :root {
            --grid-gap: ${worksColGap};
            --row-gap: ${worksRowGap};

            --header-logo-top: 24px;
            --header-logo-left: 24px;
            --header-logo-w: 28px;
            --header-logo-h: 34px;
            --header-logo-thick: 6px;
            --header-studio-size: 14px;
            --header-studio-overlap: -6px;

            --header-burger-top: 24px;
            --header-burger-right: 24px;
            --header-burger-w: 26px;
            --header-burger-h: 18px;
            --header-burger-trans: 8px;

            --header-menu-size: 32px;
          }

          .works-word-text { font-size: clamp(60px, 15vw, ${worksWordFontSize}); }

          .works-word-wrapper {
            position: absolute;
            left: clamp(20px, 4vw, ${worksWordXOffset});
            top: ${worksWordYOffset};
            z-index: 10;
            user-select: none;
          }

          .grid-main-container { padding-top: 400px; }

          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

          @media (min-width: 769px) and (max-width: 1366px) {
            :root {
              --header-logo-top: 24px; --header-logo-left: 24px; --header-logo-w: 36px; --header-logo-h: 43px; --header-logo-thick: 8px; --header-studio-size: 20px; --header-studio-overlap: -10px;
              --header-burger-top: 24px; --header-burger-right: 24px; --header-burger-w: 32px; --header-burger-h: 20px; --header-burger-trans: 9px;
              --header-menu-size: 45px;
            }
          }

          @media (min-width: 1367px) {
            :root {
              --header-logo-top: ${logoTopOffset}; --header-logo-left: ${logoLeftOffset}; --header-logo-w: ${cLogoWidth}; --header-logo-h: ${cLogoHeight}; --header-logo-thick: ${cThickness}; --header-studio-size: ${studioFontSize}; --header-studio-overlap: ${studioOverlap};
              --header-burger-top: ${burgerTopOffset}; --header-burger-right: ${burgerRightOffset}; --header-burger-w: 40px; --header-burger-h: 24px; --header-burger-trans: 11px;
              --header-menu-size: clamp(40px, 8vw, 60px);
            }
          }

          .burger-line { display: block; height: 2px; width: 100%; background-color: white; transition: all 0.5s cubic-bezier(0.76, 0, 0.24, 1); }
          .burger-line-1.open { transform: translateY(var(--header-burger-trans)) rotate(45deg); }
          .burger-line-2.open { opacity: 0; }
          .burger-line-3.open { transform: translateY(calc(var(--header-burger-trans) * -1)) rotate(-45deg); }

          @media (max-width: 768px) {
            :root { --header-menu-size: clamp(39px, 8.5vw, 67px) !important; --grid-gap: ${worksMobileGap}; --row-gap: ${worksMobileGap}; }
            .works-word-wrapper { left: ${worksMobilePadding} !important; top: 120px !important; }
            .grid-main-container { padding-top: 240px !important; }
          }
        `}</style>

        <header className="fixed top-0 left-0 w-full z-50 h-[80px] md:h-[100px] bg-black pointer-events-none" dir="ltr">
          <div className="w-full relative h-full">
            <div className="absolute transition-all duration-500 z-[60] pointer-events-auto" style={{ left: "var(--header-logo-left)", top: "var(--header-logo-top)" }}>
              <Link href="/" className="group relative flex items-center cursor-pointer" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center">
                  <div className="relative transition-colors duration-500 group-hover:text-[var(--hover-color)]" style={{ color: cColor, width: "var(--header-logo-w)", height: "var(--header-logo-h)", '--hover-color': logoHoverColor } as React.CSSProperties}>
                    <div className="absolute inset-0 border-current rounded-l-full border-y border-l" style={{ borderRight: 'none', borderWidth: "var(--header-logo-thick)" }} />
                  </div>
                  <span className={`transition-colors duration-500 group-hover:text-[var(--hover-color)] tracking-wider font-bold leading-none ${orbitronFont.className}`} style={{ color: studioColor, fontSize: "var(--header-studio-size)", marginLeft: "var(--header-studio-overlap)", '--hover-color': logoHoverColor } as React.CSSProperties}>
                    STUDIO
                  </span>
                </div>
              </Link>
            </div>

            <div className="absolute z-[60] pointer-events-auto" style={{ right: "var(--header-burger-right)", top: "var(--header-burger-top)" }}>
              <button className="group relative flex flex-col justify-between items-end cursor-pointer focus:outline-none" style={{ width: "var(--header-burger-w)", height: "var(--header-burger-h)" }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                <span className={`burger-line burger-line-1 ${mobileMenuOpen ? 'open' : ''}`} />
                <span className={`burger-line burger-line-2 ${mobileMenuOpen ? 'open' : ''}`} />
                <span className={`burger-line burger-line-3 ${mobileMenuOpen ? 'open' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              variants={menuVariants} initial="initial" animate="animate" exit="exit"
              className={`fixed inset-0 z-40 ${menuBgOpacity} flex justify-center`}
              style={{ backdropFilter: menuBlurIntensity, WebkitBackdropFilter: menuBlurIntensity }}
              dir="rtl"
            >
              <div className="relative w-full h-full max-w-[1920px] mx-auto pointer-events-auto flex flex-col md:block px-[30px] md:px-[100px] pt-[25vh] md:pt-[120px] pb-10">
                <motion.div variants={containerVariants} initial="initial" animate="animate" exit="initial" className="flex-1 flex flex-col justify-start items-start md:absolute md:right-[100px] md:bottom-[51px] md:h-auto" dir="rtl">
                  {navLinks.map((link) => (
                    <div key={link.name} className="h-[55px] md:h-[80px] mb-1 md:mb-0 overflow-hidden flex items-center justify-start w-full">
                      <motion.div variants={linkVariants}>
                        {link.href === '/contact' ? (
                          <button onClick={() => { setMobileMenuOpen(false); setContactDrawerOpen(true); }} className="group relative inline-block font-bold text-white transition-colors duration-300 tracking-tight text-right focus:outline-none cursor-pointer" style={{ fontFamily: persianFontFamily, fontSize: "var(--header-menu-size)" }} onMouseEnter={(e) => e.currentTarget.style.color = menuHoverTextColor} onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}>
                            {link.name}
                          </button>
                        ) : (
                          <Link href={link.href} onClick={() => setMobileMenuOpen(false)} className="group relative inline-block font-bold text-white transition-colors duration-300 tracking-tight text-right" style={{ fontFamily: persianFontFamily, fontSize: "var(--header-menu-size)" }} onMouseEnter={(e) => e.currentTarget.style.color = menuHoverTextColor} onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}>
                            {link.name}
                          </Link>
                        )}
                      </motion.div>
                    </div>
                  ))}
                </motion.div>
                <div className="md:hidden flex-1" />
                <div className="md:hidden w-full h-[1px] bg-zinc-800 mb-6" />
                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} className="flex flex-col items-end md:items-start w-full md:w-auto text-white md:absolute md:left-[100px] md:bottom-[51px]" dir="ltr">
                  <div className="font-bold leading-none text-[22px] md:text-[30px] mb-2 uppercase" style={{ fontFamily: englishFontFamily }}>PHONE</div>
                  <a href="tel:+989376303872" className="text-zinc-400 font-light leading-relaxed text-sm md:text-lg mb-6 md:mb-8 hover:text-white transition-colors text-right md:text-left" style={{ fontFamily: englishFontFamily }}>+98 937 630 3872</a>
                  <div className="font-bold leading-none text-[22px] md:text-[30px] mb-4 uppercase" style={{ fontFamily: englishFontFamily }}>SOCIAL</div>
                  <div className="flex gap-4 justify-end md:justify-start w-full">
                    <a href="https://www.instagram.com/c.studio.adv?igsh=OTIyMmR6MzduNHBk" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors" aria-label="Instagram">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                    <a href="https://t.me/+989376303872" target="_blank" rel="noopener noreferrer" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors" aria-label="Telegram">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </a>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main 
          className="relative w-full max-w-[1920px] mx-auto pb-[100px] md:pb-[200px] px-6 md:px-[40px]"
          dir="rtl"
          style={{ fontFamily: persianFontFamily }}
        >
          <div className="works-word-wrapper hidden md:block" dir="ltr">
            <span className="block uppercase tracking-tight leading-none drop-shadow-2xl works-word-text" style={{ color: textColor, fontFamily: englishFontFamily, fontWeight: 900 }}>
              {worksWordText}
            </span>
          </div>

          <div className="works-word-wrapper md:hidden" dir="ltr">
            <span className="block uppercase tracking-tight leading-none drop-shadow-2xl works-word-text" style={{ color: textColor, fontFamily: englishFontFamily, fontWeight: 900 }}>
              {worksWordText}
            </span>
          </div>

          {/* 🎯 کانتینر اصلی گرید با min-h برای جلوگیری از پرش فوتر */}
          <div className="grid-main-container w-full min-h-[50vh] relative z-20 flex flex-col items-center" style={{ transform: `scale(${worksBoxGlobalScale})`, transformOrigin: 'top center' }}>
            
            {/* 🎯 منوی فیلترها با قابلیت اسکرول نرم در موبایل */}
<div className="filters-wrapper w-full max-w-[1700px] flex flex-nowrap overflow-x-auto hide-scrollbar items-center justify-start md:justify-center gap-8 md:gap-14 px-6 md:px-0 mb-16 md:mb-24" dir="rtl" style={{ WebkitOverflowScrolling: 'touch' }}>              {CATEGORIES.map(cat => {
                const isActive = activeCategory === cat.id;
                const count = cat.id === 'all' 
                  ? allProjects.length 
                  : allProjects.filter(p => p.category === cat.id).length;
                const countStr = count < 10 ? `0${count}` : `${count}`;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex-shrink-0 flex items-center gap-2 whitespace-nowrap transition-all duration-500 font-bold tracking-wider text-[16px] md:text-[18px] ${isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
                    style={{ fontFamily: persianFontFamily }}
                  >
                    <span>{cat.title}</span>
                    <span className="opacity-50 font-light text-[12px] md:text-[14px]" style={{ fontFamily: englishFontFamily }} dir="ltr">
                      [{countStr}]
                    </span>
                    {isActive && <span className="text-white mr-2 font-light" style={{ fontFamily: englishFontFamily }}>/</span>}
                  </button>
                )
              })}
            </div>

            {isLoading ? (
              <div className="w-12 h-12 mt-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin opacity-0" />
            ) : filteredProjects.length === 0 ? (
              
              // 🎯 بخش شاهکار "پروژه‌ای یافت نشد"
              <div className="w-full flex flex-col items-center justify-center min-h-[40vh]">
                <span className="text-zinc-900 font-black text-[clamp(60px,15vw,150px)] leading-none tracking-tighter select-none" style={{ fontFamily: englishFontFamily }}>
                  EMPTY
                </span>
                <p className="text-zinc-400 mt-2 md:mt-6 text-[16px] md:text-[20px] font-light" style={{ fontFamily: persianFontFamily }}>
                  در حال حاضر پروژه‌ای در این بخش منتشر نشده است.
                </p>
              </div>

            ) : (
              <>
                <div ref={gridRef} className="w-full flex flex-col items-center">
                  {renderGridChunks()}
                </div>
                
                {!isPreloading && visibleCount < filteredProjects.length && (
                  <div className="w-full flex justify-center relative z-20" style={{ marginTop: loadMoreBtnMarginTop }}>
                    <button 
                      onClick={handleLoadMore}
                      className="flex items-center justify-center rounded-full border border-zinc-700 text-zinc-300 transition-all duration-300 hover:bg-white hover:border-white hover:text-black font-bold tracking-widest cursor-pointer w-full md:w-auto" 
                      style={{ minWidth: loadMoreBtnWidth, height: loadMoreBtnHeight, fontSize: loadMoreBtnFontSize }}
                    >
                      {loadMoreBtnText}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>

        <section dir="ltr" className="w-full bg-[#111111] relative z-10">
          <footer className="flex flex-col md:flex-row min-h-[100px] items-center justify-between px-[4vw] py-10 gap-8 md:gap-0 border-t border-white/5">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
              <div className="text-[18px] md:text-[22px] font-bold tracking-[0.38em] text-[#f2f2f2]" style={{ fontFamily: englishFontFamily }}>C STUDIO</div>
              <div className="hidden text-[11px] md:text-[12px] tracking-[0.12em] text-zinc-500 md:block font-medium" style={{ fontFamily: englishFontFamily }}>© 2026 C STUDIO. ALL RIGHTS RESERVED.</div>
            </div>
            <nav className="flex flex-wrap justify-center gap-8 md:gap-12 text-[11px] md:text-[13px] tracking-[0.15em] text-zinc-400 font-medium" style={{ fontFamily: englishFontFamily }}>
              <Link href="/works" className="hover:text-white transition-colors">WORK</Link>
              <Link href="/auth" className="hover:text-white transition-colors">DASHBOARD</Link>
              <Link href="/about" className="hover:text-white transition-colors">ABOUT US</Link>
              <button onClick={() => setContactDrawerOpen(true)} className="hover:text-white transition-colors cursor-pointer uppercase">CONTACT</button>
            </nav>
            <div className="about-footer-anim flex gap-6 md:gap-8 text-[11px] md:text-[13px] tracking-[0.2em] text-zinc-500 font-bold" style={{ fontFamily: englishFontFamily }}>
              <a href="https://www.instagram.com/c.studio.adv?igsh=OTIyMmR6MzduNHBk" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">IG</a>
              <a href="https://t.me/+989376303872" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">TG</a>
              <a href="https://wa.me/989376303872" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">WA</a>
            </div>
            <div className="text-[10px] tracking-[0.12em] text-zinc-500 md:hidden mt-4 font-medium text-center" style={{ fontFamily: englishFontFamily }}>© 2026 C STUDIO. ALL RIGHTS RESERVED.</div>
          </footer>
        </section>

        <ContactDrawer isOpen={contactDrawerOpen} onClose={() => setContactDrawerOpen(false)} onOpenMenu={() => setMobileMenuOpen(true)} />
      </div>
    </>
  );
}

// 🎯 کامپوننت اصلی که درون Suspense رندر میشه تا ارور Build نده
export default function WorksPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
      </div>
    }>
      <WorksContent />
    </Suspense>
  );
}