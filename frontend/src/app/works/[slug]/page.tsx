"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Mp4Player from '@/components/Mp4Player';
import ContactDrawer from '@/components/ContactDrawer';
import Preloader from '@/components/Preloader';

import { orbitronFont } from '@/app/fonts';

gsap.registerPlugin(ScrollTrigger);

// 🎛️===================================================================🎛️
//                   داشبورد تنظیمات اختصاصی صفحه جزئیات
// 🎛️===================================================================🎛️
const playerMaxWidth = "1274px";
const playerAspectRatio = "1274 / 716";
const videoGap = "80px";

const spaceUnderLastVideo = "60px";
const bottomTextFontSize = "clamp(32px, 5vw, 68px)";
const bottomTextColor = "#FFFFFF";
const bottomTextFontWeight = "900";
const bottomTextLineHeight = "1.4";

const moreWorksBgColor = "#111111";
const moreWorksCardWidth = "600px";
const moreWorksCardAspectRatio = "4/3";
const moreWorksCardGap = "30px";
const moreWorksTitleFontSize = "clamp(50px, 8vw, 100px)";
const moreWorksTitleColor = "#FFFFFF";
const moreWorksTitleMarginLeft = "40px";
const moreWorksTitleMarginRight = "140px";
const moreWorksLineLength = "60px";

const globalBgColor = "#050505";
const solidBlackColor = "#000000";
const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';
const englishFontFamily = '"Outfit", sans-serif';

// 🚀 تنظیم زمان پری‌لودر 
const preloaderDurationMs = 2700;

// 🎛️===================================================================🎛️
//                   تنظیمات هدر و منوی همبرگری (سینک شده با هوم پیج)
// 🎛️===================================================================🎛️
const cColor = "#888888";                
const studioColor = "#FFFFFF";           
const logoHoverColor = "#FFFFFF";        
const logoTopOffset = "28px";            
const logoLeftOffset = "35px";           
const cLogoWidth = "43px";               
const cLogoHeight = "52px";              
const cThickness = "10px";               
const studioFontSize = "25px";           
const studioOverlap = "-13px";           

const burgerTopOffset = "28px";          
const burgerRightOffset = "35px";        
const menuBlurIntensity = "blur(30px)";  
const menuBgOpacity = "bg-black/80";     
const menuFontSize = "clamp(40px, 8vw, 60px)";  
const menuHoverTextColor = "#404040";    

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

const navLinks = [
  { name: 'خانه', href: '/' },
  { name: 'نمونه کارها', href: '/works' },
  { name: 'درباره ما', href: '/about' },
  { name: 'تماس با ما', href: '/contact' },
  { name: 'پنل مدیریت', href: '/auth' },
];

// 🚀 آپدیت اینترفیس منطبق با دیتابیس جدید
interface Project {
  _id: string;
  companyName: string;
  teaserName: string;
  slug: string;
  description: string;
  bottomText?: string;
  priority?: number;
  videos: string[];
  screenshots?: string[];
  createdAt: string;
}

export default function ProjectDetailsPage() {
  const { slug } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [suggestedProjects, setSuggestedProjects] = useState<Project[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isPreloading, setIsPreloading] = useState(true);
  
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  
  const [windowWidth, setWindowWidth] = useState(1920);
  const isMobile = windowWidth > 0 && windowWidth <= 768;
  const isTabletOrLaptop = windowWidth > 768 && windowWidth <= 1366;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const detailsSectionRef = useRef<HTMLElement>(null);
  const moreWorksSectionRef = useRef<HTMLElement>(null);
  const moreWorksTextRef = useRef<HTMLDivElement>(null);
  const moreWorksCardsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProject = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/slug/${slug}`);
        const dataProject = await resProject.json();

        const resAll = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
        const dataAll = await resAll.json();

        if (dataProject.success) {
          setProject(dataProject.data);

          if (dataAll.success) {
            const others = dataAll.data.filter((p: Project) => p.slug && p.slug !== slug);
            const topSuggested = others.slice(0, 5);
            setSuggestedProjects(topSuggested);
          }
        }
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug]);

  useEffect(() => {
    if (isPreloading || isLoading || !project) return;
    
    const ctx = gsap.context(() => {
      gsap.to(pageRef.current, { opacity: 1, duration: 1.2, ease: "power2.out" });

      ScrollTrigger.create({
        trigger: detailsSectionRef.current,
        start: "top 80px",
        onEnter: () => gsap.to(headerRef.current, { backgroundColor: solidBlackColor, duration: 0.15, overwrite: "auto" }),
        onLeaveBack: () => gsap.to(headerRef.current, { backgroundColor: "rgba(0,0,0,0)", duration: 0.15, overwrite: "auto" }),
      });

      if (moreWorksSectionRef.current && moreWorksTextRef.current && moreWorksCardsRef.current) {
        gsap.fromTo(moreWorksTextRef.current,
          { x: -150, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.5, ease: "power3.out", scrollTrigger: {
            trigger: moreWorksSectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }}
        );

        gsap.fromTo(moreWorksCardsRef.current,
          { x: 250, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.5, ease: "power3.out", scrollTrigger: {
            trigger: moreWorksSectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }}
        );
      }
    });
    return () => ctx.revert();
  }, [isPreloading, isLoading, project, suggestedProjects]);

  const getScrollAmount = () => {
    if (carouselRef.current && carouselRef.current.children.length > 0) {
      const cardWidth = (carouselRef.current.children[0] as HTMLElement).offsetWidth;
      const gap = parseInt(moreWorksCardGap) || 30;
      return cardWidth + gap;
    }
    return 630;
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const index = Math.round(scrollLeft / getScrollAmount());
      setActiveSlideIndex(index);
    }
  };

  const scrollLeftNav = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  };
  const scrollRightNav = () => {
    if (carouselRef.current) carouselRef.current.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  };
    
  const moreWorksPaddingLeft = isMobile ? '20px' : isTabletOrLaptop ? '35px' : moreWorksTitleMarginLeft;
  const moreWorksTitleMargin = isMobile ? '0px' : isTabletOrLaptop ? '60px' : moreWorksTitleMarginRight;
  const moreWorksCardW = isMobile ? '85vw' : isTabletOrLaptop ? '42vw' : moreWorksCardWidth;

  // پوستر پیش‌فرض برای ویدیوها (استفاده از شات اول پروژه)
  const heroPoster = project?.screenshots && project.screenshots.length > 0 ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${project.screenshots[0]}` : '';

  return (
    <>
      <Preloader />

      {isLoading ? (
        <div className="w-full h-screen bg-black flex items-center justify-center" style={{ display: isPreloading ? 'none' : 'flex' }}>
          <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <div ref={pageRef} className="relative w-full overflow-clip opacity-0" style={{ backgroundColor: globalBgColor }}>
          <style jsx global>{`
            @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap');
            @font-face { font-family: 'Outfit'; src: url('/fonts/OutfitSemiBold.ttf') format('truetype'); font-weight: 600; }
            @font-face { font-family: 'AzarMehr'; src: url('/fonts/AzarMehr/Static/woff2/400-AzarMehr-FD-Regular.woff2') format('woff2'); font-weight: 400; }

            .hide-scrollbar::-webkit-scrollbar { display: none; }
            .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

            :root {
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
              --header-menu-size: ${menuFontSize};
            }

            @media (max-width: 768px) {
              :root {
                --header-menu-size: clamp(39px, 8.5vw, 67px) !important;
              }
            }

            @media (min-width: 769px) and (max-width: 1366px) {
              :root {
                --header-logo-top: 24px;
                --header-logo-left: 24px;
                --header-logo-w: 36px;
                --header-logo-h: 43px;
                --header-logo-thick: 8px;
                --header-studio-size: 20px;
                --header-studio-overlap: -10px;

                --header-burger-top: 24px;
                --header-burger-right: 24px;
                --header-burger-w: 32px;
                --header-burger-h: 20px;
                --header-burger-trans: 9px;
              }
            }

            @media (min-width: 1367px) {
              :root {
                --header-logo-top: ${logoTopOffset};
                --header-logo-left: ${logoLeftOffset};
                --header-logo-w: ${cLogoWidth};
                --header-logo-h: ${cLogoHeight};
                --header-logo-thick: ${cThickness};
                --header-studio-size: ${studioFontSize};
                --header-studio-overlap: ${studioOverlap};

                --header-burger-top: ${burgerTopOffset};
                --header-burger-right: ${burgerRightOffset};
                --header-burger-w: 40px;
                --header-burger-h: 24px;
                --header-burger-trans: 11px;
                --header-menu-size: ${menuFontSize};
              }
            }

            .burger-line { display: block; height: 2px; width: 100%; background-color: white; transition: all 0.5s cubic-bezier(0.76, 0, 0.24, 1); }
            .burger-line-1.open { transform: translateY(var(--header-burger-trans)) rotate(45deg); }
            .burger-line-2.open { opacity: 0; }
            .burger-line-3.open { transform: translateY(calc(var(--header-burger-trans) * -1)) rotate(-45deg); }

            /* 🚀 فیکس شدن بیرون‌زدگی ویدیوها در موبایل */
            .player-wrapper {
              width: 100%;
              max-width: ${playerMaxWidth};
              aspect-ratio: ${playerAspectRatio};
              margin: 0 auto;
              position: relative;
              overflow: hidden;
            }

            @media (max-width: 768px) {
              .player-wrapper {
                width: 100% !important; 
                max-width: 450px !important; 
                height: auto !important; 
                aspect-ratio: 1/1 !important;
              }
            }
          `}</style>

          <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 h-[80px] md:h-[100px] bg-transparent pointer-events-none" dir="ltr">
            <div className="w-full relative h-full">
              <div className={`absolute inset-0 transition-all duration-500 pointer-events-none ${mobileMenuOpen ? 'backdrop-blur-md bg-black/30' : ''}`} />
              
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

          {/* 🎯 منو موبایل و دسکتاپ دقیقاً سینک شده با هوم‌پیج */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                variants={menuVariants} initial="initial" animate="animate" exit="exit"
                className={`fixed inset-0 z-40 ${menuBgOpacity} flex justify-center`}
                style={{ backdropFilter: menuBlurIntensity, WebkitBackdropFilter: menuBlurIntensity }}
                dir="rtl"
              >
                <div className="relative w-full h-full max-w-[1920px] mx-auto pointer-events-auto flex flex-col md:block px-[30px] md:px-[100px] pt-[25vh] md:pt-[120px] pb-10">
                  
                  <motion.div 
                    variants={containerVariants} 
                    initial="initial" 
                    animate="animate" 
                    exit="initial" 
                    className="flex-1 flex flex-col justify-start items-start md:absolute md:right-[100px] md:bottom-[51px] md:h-auto md:items-start" 
                    dir="rtl"
                  >
                    {navLinks.map((link) => (
                      <div key={link.name} className="h-[55px] md:h-[80px] mb-1 md:mb-0 overflow-hidden flex items-center justify-start w-full">
                        <motion.div variants={linkVariants}>
                          {link.href === '/contact' ? (
                            <button 
                              onClick={() => { setMobileMenuOpen(false); setContactDrawerOpen(true); }}
                              className="group relative inline-block font-bold text-white transition-colors duration-300 tracking-tight text-right focus:outline-none"
                              style={{ fontFamily: persianFontFamily, fontSize: "var(--header-menu-size)" }}
                              onMouseEnter={(e) => e.currentTarget.style.color = menuHoverTextColor}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}
                            >
                              {link.name}
                            </button>
                          ) : (
                            <Link 
                              href={link.href} onClick={() => setMobileMenuOpen(false)}
                              className="group relative inline-block font-bold text-white transition-colors duration-300 tracking-tight text-right"
                              style={{ fontFamily: persianFontFamily, fontSize: "var(--header-menu-size)" }}
                              onMouseEnter={(e) => e.currentTarget.style.color = menuHoverTextColor}
                              onMouseLeave={(e) => e.currentTarget.style.color = '#FFFFFF'}
                            >
                              {link.name}
                            </Link>
                          )}
                        </motion.div>
                      </div>
                    ))}
                  </motion.div>

                  <div className="md:hidden flex-1" />
                  <div className="md:hidden w-full h-[1px] bg-zinc-800 mb-6" />

                  <motion.div 
                    initial={{ opacity: 0, x: 30 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-end md:items-start w-full md:w-auto text-white md:absolute md:left-[100px] md:bottom-[51px]"
                    dir="ltr"
                  >
                    <div className="font-bold leading-none text-[22px] md:text-[30px] mb-2 uppercase" style={{ fontFamily: englishFontFamily }}>
                      PHONE
                    </div>
                    <a 
                      href="tel:+989376303872" 
                      className="text-zinc-400 font-light leading-relaxed text-sm md:text-lg mb-6 md:mb-8 hover:text-white transition-colors" 
                      style={{ fontFamily: englishFontFamily }}
                    >
                      +98 937 630 3872
                    </a>

                    <div className="font-bold leading-none text-[22px] md:text-[30px] mb-4 uppercase" style={{ fontFamily: englishFontFamily }}>
                      SOCIAL
                    </div>
                    <div className="flex gap-4">
                      <a 
                        href="https://www.instagram.com/c.studio.adv?igsh=OTIyMmR6MzduNHBk" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                        aria-label="Instagram"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>

                      <a 
                        href="https://t.me/+989376303872" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-zinc-700 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                        aria-label="Telegram"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="22" y1="2" x2="11" y2="13"></line>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                      </a>
                    </div>
                  </motion.div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <section ref={detailsSectionRef} className="w-full bg-black relative z-10 pt-[150px] md:pt-[200px] pb-32" dir="rtl" style={{ fontFamily: persianFontFamily }}>
            <div className="max-w-[1700px] mx-auto px-6 md:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                <div className="lg:col-span-4">
                  {/* 🚀 اضافه شدن break-words برای جلوگیری از بیرون زدن متن */}
                  <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-bold text-white tracking-tight sticky top-32 break-words" style={{ wordBreak: 'break-word' }}>
                    {project.companyName}
                  </motion.h2>
                </div>
                <div className="lg:col-span-8 flex flex-col w-full overflow-hidden">
                  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter break-words" style={{ wordBreak: 'break-word' }}>
                      {project.teaserName}
                    </h1>
                    <p className="text-zinc-300 text-lg md:text-2xl leading-loose text-justify font-light break-words" style={{ wordBreak: 'break-word' }}>
                      {project.description}
                    </p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-24 mb-10 border-t border-zinc-800/80 pt-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-widest" dir="ltr" style={{ textAlign: 'left', fontFamily: englishFontFamily }}>
                      
                    </h3>
                  </motion.div>

                  <div className="flex flex-col w-full" style={{ gap: videoGap }}>
                    {project.videos.map((vid, idx) => {
                      const vidPoster = project.screenshots && project.screenshots[idx] 
                        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${project.screenshots[idx]}` 
                        : heroPoster;

                      return (
                        <div key={idx} className="player-wrapper">
                          <Mp4Player src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${vid}`} poster={vidPoster} className="!max-w-none !w-full !h-full !aspect-auto" />
                        </div>
                      );
                    })}
                  </div>

                  {project.bottomText && (
                    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ marginTop: spaceUnderLastVideo }}>
                      <h2 className="break-words" style={{ fontSize: bottomTextFontSize, color: bottomTextColor, fontWeight: bottomTextFontWeight, lineHeight: bottomTextLineHeight, textAlign: "right", wordBreak: 'break-word' }}>
                        {project.bottomText}
                      </h2>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {suggestedProjects.length > 0 && (
            <section
              ref={moreWorksSectionRef}
              className="w-full relative z-20 py-16 md:py-32 flex items-center overflow-hidden"
              dir="ltr"
              style={{ backgroundColor: moreWorksBgColor }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-stretch w-full max-w-[1920px] mx-auto" style={{ paddingLeft: moreWorksPaddingLeft }}>

                <div
                  ref={moreWorksTextRef}
                  className="w-full md:w-[150px] flex-shrink-0 flex opacity-0 mb-8 md:mb-0"
                  style={{ marginRight: moreWorksTitleMargin }}
                >
                  <div
                    className="flex flex-row md:flex-col items-start md:items-end justify-start md:justify-end w-full"
                    style={{
                      writingMode: isMobile || isTabletOrLaptop ? 'horizontal-tb' : 'vertical-rl',
                      transform: isMobile || isTabletOrLaptop ? 'none' : 'rotate(180deg)'
                    }}
                  >
                    <span className="font-black leading-[0.85] whitespace-nowrap" style={{ fontFamily: englishFontFamily, fontSize: moreWorksTitleFontSize, color: moreWorksTitleColor, letterSpacing: '0.05em' }}>
                      MORE
                    </span>
                    <span className="font-black leading-[0.85] whitespace-nowrap ml-4 md:ml-0 md:mt-2" style={{ fontFamily: englishFontFamily, fontSize: moreWorksTitleFontSize, color: moreWorksTitleColor, letterSpacing: '0.05em' }}>
                      WORK
                    </span>
                  </div>
                </div>

                <div ref={moreWorksCardsRef} className="flex-1 overflow-hidden relative opacity-0 w-full pt-1">
                  <div
                    ref={carouselRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory scroll-smooth"
                    style={{ gap: moreWorksCardGap, paddingBottom: '20px' }}
                  >
                    {suggestedProjects.map((p) => {
                      return (
                        <Link
                          href={`/works/${p.slug}`}
                          key={p._id}
                          className="flex-shrink-0 group cursor-pointer snap-start flex flex-col"
                          style={{ width: moreWorksCardW }}
                        >
                          <div
                            className="w-full bg-zinc-900 rounded-[20px] overflow-hidden"
                            style={{ aspectRatio: moreWorksCardAspectRatio }}
                          >
                            <video 
                              src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${p.videos[0]}`}
                              muted 
                              loop 
                              playsInline
                              onMouseEnter={(e) => {
                                e.currentTarget.currentTime = 0;
                                e.currentTarget.play().catch(() => {});
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.pause();
                                e.currentTarget.currentTime = 0;
                              }}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>

                          <div className="flex items-center gap-4 mt-6 text-white" style={{ fontFamily: englishFontFamily }}>
                            <h4 className="font-bold text-xl md:text-2xl tracking-wide uppercase whitespace-nowrap">
                              {p.companyName || p.slug.replace(/-/g, ' ')}
                            </h4>

                            <div
                              className="h-[2px] bg-white/40 group-hover:bg-white transition-colors"
                              style={{ width: moreWorksLineLength }}
                            />

                            <span className="text-sm font-light text-zinc-300 whitespace-nowrap truncate" style={{ fontFamily: persianFontFamily }}>
                              {p.teaserName}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between mt-10 pr-6 md:pr-12">
                    <div className="flex items-center gap-6">
                      <button onClick={scrollLeftNav} className="w-12 h-12 flex items-center justify-center text-white hover:text-zinc-400 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                      </button>
                      <button onClick={scrollRightNav} className="w-12 h-12 flex items-center justify-center text-white hover:text-zinc-400 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                      {[0, 1, 2, 3].map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-[4px] md:h-[5px] w-[20px] md:w-[35px] transition-colors duration-500 ${Math.min(activeSlideIndex, 3) >= idx ? 'bg-white' : 'bg-zinc-700'}`}
                          style={{ transform: 'skewX(-30deg)' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </section>
          )}

          {/* =====================================================================
              فوتر
          ===================================================================== */}
          <section dir="ltr" className="w-full bg-[#111111] relative z-10">
            <footer className="flex flex-col md:flex-row min-h-[100px] items-center justify-between px-[4vw] py-10 gap-8 md:gap-0 border-t border-white/5">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
                <div className="text-[18px] md:text-[22px] font-bold tracking-[0.38em] text-[#f2f2f2]" style={{ fontFamily: englishFontFamily }}>
                  C STUDIO
                </div>
                <div className="hidden text-[11px] md:text-[12px] tracking-[0.12em] text-zinc-500 md:block font-medium" style={{ fontFamily: englishFontFamily }}>
                  © 2026 C STUDIO. ALL RIGHTS RESERVED.
                </div>
              </div>
              <nav className="flex flex-wrap justify-center gap-8 md:gap-12 text-[11px] md:text-[13px] tracking-[0.15em] text-zinc-400 font-medium" style={{ fontFamily: englishFontFamily }}>
                <Link href="/works" className="hover:text-white transition-colors">WORK</Link>
                <Link href="/auth" className="hover:text-white transition-colors">DASHBOARD</Link>
                <Link href="/about" className="hover:text-white transition-colors">ABOUT US</Link>
                <button 
                  onClick={() => {
                    setMobileMenuOpen(true);
                    setTimeout(() => setContactDrawerOpen(true), 600);
                  }} 
                  className="hover:text-white transition-colors cursor-pointer uppercase"
                >
                  CONTACT
                </button>
              </nav>
              <div className="about-footer-anim flex gap-6 md:gap-8 text-[11px] md:text-[13px] tracking-[0.2em] text-zinc-500 font-bold" style={{ fontFamily: englishFontFamily }}>
                <a 
                  href="https://www.instagram.com/c.studio.adv?igsh=OTIyMmR6MzduNHBk" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  IG
                </a>
                <a 
                  href="https://t.me/+989376303872" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  TG
                </a>
                <a 
                  href="https://wa.me/989376303872" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white cursor-pointer transition-colors"
                >
                  WA
                </a>
              </div>
              <div className="text-[10px] tracking-[0.12em] text-zinc-500 md:hidden mt-4 font-medium text-center" style={{ fontFamily: englishFontFamily }}>
                © 2026 C STUDIO. ALL RIGHTS RESERVED.
              </div>
            </footer>
          </section>

          {/* 🚀 فرم تماس کشویی */}
          <ContactDrawer 
            isOpen={contactDrawerOpen} 
            onClose={() => setContactDrawerOpen(false)} 
            onOpenMenu={() => setMobileMenuOpen(true)} 
          />
        </div>
      )}
    </>
  );
}