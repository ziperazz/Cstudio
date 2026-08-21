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

// 🎛️ هندسه‌ی ماسک هیرو (سینک شده با هوم پیج + رفع باگ‌های ۱ پیکسلی)
const maskColorHex = "#000000ff";
const frameBorderWidth = "clamp(12px, 1.2vw, 17px)";
const horizontalAlignment = "calc(((100vw - (var(--frame) * 2) - (var(--sep) * 2)) * 0.38 / 3.18) + var(--i-gap))";

const iColumnFlex = "0.38";
const sideColumnFlex = "1.4";
const iDotOvalness = "1.006";
const horizontalLineWidth = "clamp(5px, 0.5vw, 8px)";
const separatorLineWidth = "clamp(6px, 0.6vw, 10px)";

const cBoneWidth = "clamp(8px, 1.1vw, 16px)";
const cBoneHeight = "clamp(75px, 7.5vw, 135px)";
const cArmWidth = "45%";
const iGapSize = "clamp(8px, 1vw, 14px)";
const innerRoundness = "20px";

const heroWordsFontFamily = englishFontFamily;
const heroWordsFontWeight = 300;
const heroWordsFontSize = "clamp(24px, 1.88vw, 36px)";
const heroWordsLetterSpacing = "0.2em";
const heroWordsColor = "#888888";
const heroWordsHoverColor = "#ffffff";
const heroWordsInset = "clamp(28px, 2.5vw, 48px)";
const heroWordsBottom = "clamp(28px, 2.24vw, 43px)";
const heroWordsTransitionSpeed = "0.5s";

const animDuration = 0.8;
const startDelay = 0.5;

const ENABLE_HERO_TUNER = false;

type HeroTune = {
  frame: number; sep: number; armH: number; armW: number; boneW: number; boneH: number; iGap: number; iBodyH: number; radius: number; align: number; sideFlex: number; iFlex: number; dotOvalness: number; wordSize: number; wordInset: number; wordBottom: number;   
};

const MOBILE_HERO_TUNE: HeroTune = {
  frame: 13, sep: 6, armH: 6, armW: 52, boneW: 10, boneH: 10, iGap: 8, iBodyH: 39, radius: 13, align: 19, sideFlex: 1.25, iFlex: 0.5, dotOvalness: 1.006, wordSize: 18, wordInset: 19, wordBottom: 12,
};

const TABLET_LAPTOP_HERO_TUNE: HeroTune = {
  frame: 13, sep: 6, armH: 6, armW: 47, boneW: 13, boneH: 14, iGap: 8, iBodyH: 39, radius: 13, align: 27, sideFlex: 1.25, iFlex: 0.32, dotOvalness: 1.006, wordSize: 18, wordInset: 19, wordBottom: 12,
};

const tuneToVars = (t: HeroTune): React.CSSProperties => ({
  ['--frame' as string]: `${t.frame}px`, ['--sep' as string]: `${t.sep}px`, ['--arm-h' as string]: `${t.armH}px`, ['--arm-w' as string]: `${t.armW}%`, ['--bone-w' as string]: `${t.boneW}px`, ['--bone-h' as string]: `${t.boneH}svh`, ['--i-gap' as string]: `${t.iGap}px`, ['--i-body-h' as string]: `${t.iBodyH}svh`, ['--r' as string]: `${t.radius}px`, ['--align' as string]: `${t.align}%`, ['--side-flex' as string]: `${t.sideFlex}`, ['--i-flex' as string]: `${t.iFlex}`, ['--dot-ovalness' as string]: `${t.dotOvalness}`, ['--word-size' as string]: `${t.wordSize}px`, ['--word-inset' as string]: `${t.wordInset}px`, ['--word-bottom' as string]: `${t.wordBottom}px`,
});

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

  const [tune, setTune] = useState<HeroTune>(MOBILE_HERO_TUNE);
  const [applyOnDesktop, setApplyOnDesktop] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);
  
  const headerRef = useRef<HTMLElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const heroRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const cRef = useRef<HTMLDivElement>(null);
  const iDotRef = useRef<HTMLDivElement>(null);
  const iBodyRef = useRef<HTMLDivElement>(null);
  const c2Ref = useRef<HTMLDivElement>(null);
  const doRef = useRef<HTMLSpanElement>(null);
  const thingsRef = useRef<HTMLSpanElement>(null);
  const blackOverlayRef = useRef<HTMLDivElement>(null);
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
    if (!ENABLE_HERO_TUNER) return;
    setTune(isTabletOrLaptop ? TABLET_LAPTOP_HERO_TUNE : MOBILE_HERO_TUNE);
  }, [isTabletOrLaptop]);

  useEffect(() => {
    try { localStorage.removeItem('heroTune'); } catch { /* ignore */ }
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

      // 🎯 انیمیشن ماسک دقیقاً با scale 1
      gsap.fromTo(maskRef.current, { scale: 1.01 }, { scale: 1, duration: 1.4, ease: "power3.out", delay: startDelay - 0.2 });

      const tlHero = gsap.timeline({ delay: startDelay });
      tlHero.to(blackOverlayRef.current, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0)
        .fromTo(cRef.current, { xPercent: -50 }, { xPercent: 0, duration: animDuration, ease: "power2.inOut" }, 0)
        .fromTo(iDotRef.current, { yPercent: -50 }, { yPercent: 0, duration: animDuration, ease: "power2.inOut" }, ">")
        .fromTo(iBodyRef.current, { yPercent: 0 }, { yPercent: -50, duration: animDuration, ease: "power2.inOut" }, "<")
        .fromTo(c2Ref.current, { xPercent: 0 }, { xPercent: -50, duration: animDuration, ease: "power2.inOut" }, ">");

      gsap.fromTo([doRef.current, thingsRef.current], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power4.out", delay: startDelay + 1 });

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

  const liveHeroVars = ENABLE_HERO_TUNER && (isMobile || isTabletOrLaptop || applyOnDesktop) ? tuneToVars(tune) : undefined;
    
  const moreWorksPaddingLeft = isMobile ? '20px' : isTabletOrLaptop ? '35px' : moreWorksTitleMarginLeft;
  const moreWorksTitleMargin = isMobile ? '0px' : isTabletOrLaptop ? '60px' : moreWorksTitleMarginRight;
  const moreWorksCardW = isMobile ? '85vw' : isTabletOrLaptop ? '42vw' : moreWorksCardWidth;

  const heroVideoUrl = project?.videos.length && project.videos.length > 0 ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${project.videos[0]}` : '';
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

            /* 🚀 هیرو دقیقاً سینک شده با هوم پیج (بدون خط یک پیکسلی) */
            .hero {
              --mask: ${maskColorHex}; --frame: ${frameBorderWidth}; --sep: ${separatorLineWidth}; --arm-h: ${horizontalLineWidth}; --arm-w: ${cArmWidth}; --bone-w: ${cBoneWidth}; --bone-h: ${cBoneHeight}; --i-gap: ${iGapSize}; --align: ${horizontalAlignment}; --i-body-h: calc(100% - var(--align)); --r: ${innerRoundness}; --side-flex: ${sideColumnFlex}; --i-flex: ${iColumnFlex}; --dot-ovalness: ${iDotOvalness}; --word-size: ${heroWordsFontSize}; --word-inset: ${heroWordsInset}; --word-bottom: ${heroWordsBottom};
              position: sticky; top: 0; width: 100%; height: 100vh; height: 100svh; overflow: hidden; background: ${globalBgColor}; color: #fff; user-select: none; transform: translateZ(0); z-index: 10;
            }

            @media (max-width: 768px) {
              .hero { --frame: clamp(9px, 2.8vw, 14px); --sep: clamp(5px, 1.8vw, 9px); --arm-h: clamp(4px, 1.5vw, 7px); --arm-w: 52%; --bone-w: clamp(9px, 3.2vw, 15px); --bone-h: clamp(46px, 10svh, 90px); --i-gap: clamp(7px, 2.5vw, 12px); --i-body-h: 60svh; --r: clamp(10px, 3.5vw, 18px); --align: 19%; --side-flex: 1.25; --i-flex: 0.5; --word-size: clamp(15px, 4.4vw, 22px); --word-inset: clamp(14px, 4.5vw, 26px); --word-bottom: clamp(12px, 3.5vw, 22px); }
            }

            @media (max-width: 900px) and (orientation: landscape) {
              .hero { --align: 26%; --bone-h: clamp(38px, 16svh, 80px); }
            }

            .hero__media { position: absolute; inset: 0; z-index: 0; }
            .hero__media video { width: 100%; height: 100%; object-fit: cover; display: block; transform: scale(1.15); }
            @media (max-width: 768px) { .hero__media video { transform: scale(1.45); } }

            .hero__blackout { position: absolute; inset: 0; z-index: 20; background: ${solidBlackColor}; pointer-events: none; }
            
            /* 🎯 حاشیه امن برای دور صفحه */
            .hero__mask { position: absolute; inset: -2px; z-index: 10; display: flex; overflow: hidden; pointer-events: none; border: calc(var(--frame) + 2px) solid var(--mask); }

            .col { position: relative; height: 100%; overflow: hidden; }
            .col--side { flex: var(--side-flex); }
            .col--i { flex: var(--i-flex); }
            
            /* 🎯 سایه های 2 پیکسلی برای پوشوندن خطای دید وسط C */
.sep { flex: 0 0 var(--sep); height: 100%; background: var(--mask); position: relative; z-index: 5; box-shadow: 0 0 0 2px var(--mask); }
            .fill { position: absolute; inset: 0; pointer-events: none; box-shadow: 0 0 0 2000px var(--mask); }
            .cut-top .fill { bottom: -2px; }
            .cut-bottom .fill { top: -2px; }

            .slider-x { position: absolute; top: 0; left: 0; width: 200%; height: 100%; display: flex; }
            .slider-y { position: absolute; top: 0; left: 0; width: 100%; height: 200%; display: flex; flex-direction: column; }
            .half-x { width: 50%; height: 100%; position: relative; }
            .half-y { width: 100%; height: 50%; position: relative; }
            .solid { background: var(--mask); position: relative; z-index: 5; box-shadow: 0 0 0 2px var(--mask); }

            .cut-top { position: absolute; top: 0; left: 0; right: 0; bottom: calc(100% - var(--align) + var(--arm-h) / 2 - 0.5px); overflow: hidden; }
            .cut-bottom { position: absolute; top: calc(var(--align) + var(--arm-h) / 2 - 0.5px); left: 0; right: 0; bottom: 0; overflow: hidden; }

            .arm { position: absolute; right: 0; top: var(--align); transform: translateY(-50%); width: var(--arm-w); height: var(--arm-h); background: var(--mask); z-index: 5; box-shadow: 0 0 0 2px var(--mask); }
            .bone { position: absolute; top: 50%; left: calc(var(--bone-w) / -2); transform: translateY(-50%); width: var(--bone-w); height: var(--bone-h); background: var(--mask); border-radius: var(--r); z-index: 5; box-shadow: 0 0 0 2px var(--mask); }

            .i-dot-zone { position: absolute; top: 0; left: 0; width: 100%; height: calc(var(--align) - var(--i-gap)); overflow: hidden; }
            .i-dot { position: absolute; bottom: 0; left: 50%; width: calc(100% - 4px); aspect-ratio: 1 / 1; border-radius: 50%; transform: translateX(-50%) scaleX(var(--dot-ovalness)); box-shadow: 0 0 0 2000px var(--mask); }
            
            .i-gap { position: absolute; left: 0; width: 100%; top: calc(var(--align) - var(--i-gap)); height: var(--i-gap); background: var(--mask); z-index: 5; box-shadow: 0 0 0 2px var(--mask); }
            .i-body-zone { position: absolute; left: 0; right: 0; top: var(--align); height: var(--i-body-h); overflow: hidden; }

            .hero__words { position: absolute; inset: 0; z-index: 30; pointer-events: none; }
            .hero__word { position: absolute; bottom: calc(var(--frame) + var(--word-bottom)); pointer-events: auto; cursor: pointer; }
            .hero__word--left  { left: calc(var(--frame) + var(--word-inset)); }
            .hero__word--right { right: calc(var(--frame) + var(--word-inset)); }
            .hero__word span { display: block; text-transform: uppercase; line-height: 1; font-family: ${heroWordsFontFamily}; font-weight: ${heroWordsFontWeight}; font-size: var(--word-size); letter-spacing: ${heroWordsLetterSpacing}; color: ${heroWordsColor}; transition: color ${heroWordsTransitionSpeed} ease; }
            .hero__word:hover span { color: ${heroWordsHoverColor}; }

            @media (prefers-reduced-motion: reduce) { .hero__word span { transition: none; } }
            @media (max-width: 1024px) {
              .col--i { display: flex; flex-direction: column; }
              .i-dot-zone { position: relative; top: auto; left: auto; width: 100%; height: auto; aspect-ratio: 1 / 1; flex-shrink: 0; }
              .i-dot { top: 0; bottom: auto; }
              .i-gap { position: relative; top: auto; left: auto; width: 100%; flex-shrink: 0; }
              .i-body-zone { position: relative; top: auto; left: auto; right: auto; width: 100%; height: auto; flex-grow: 1; }
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

          <section ref={heroRef} className="hero antialiased" dir="ltr" style={liveHeroVars}>
            <div className="hero__media">
              <video autoPlay loop muted playsInline poster={heroPoster}>
                <source src={heroVideoUrl} type="video/mp4" />
              </video>
            </div>

            <div ref={blackOverlayRef} className="hero__blackout" />

            <div ref={maskRef} className="hero__mask">
              <div className="col col--side">
                <div ref={cRef} className="slider-x">
                  <div className="half-x">
                    <div className="cut-top">
                      <div className="fill" style={{ borderRadius: "0 var(--r) var(--r) 0" }} />
                    </div>
                    <div className="cut-bottom">
                      <div className="fill" style={{ borderRadius: "0 var(--r) 0 0" }} />
                    </div>
                    <div className="arm">
                      <div className="bone" />
                    </div>
                  </div>
                  <div className="half-x solid" />
                </div>
              </div>

              <div className="sep" />

              <div className="col col--i">
                <div className="i-dot-zone">
                  <div ref={iDotRef} className="slider-y">
                    <div className="half-y">
                      <div className="i-dot" />
                    </div>
                    <div className="half-y solid" />
                  </div>
                </div>

                <div className="i-gap" />

                <div className="i-body-zone">
                  <div ref={iBodyRef} className="slider-y">
                    <div className="half-y solid" />
                    <div className="half-y" style={{ overflow: "hidden" }}>
                      <div className="fill" style={{ borderRadius: "var(--r) var(--r) 0 0" }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="sep" />

              <div className="col col--side">
                <div ref={c2Ref} className="slider-x">
                  <div className="half-x solid" />
                  <div className="half-x">
                    <div className="cut-top">
                      <div className="fill" style={{ borderRadius: "var(--r) 0 var(--r) 0" }} />
                    </div>
                    <div className="cut-bottom">
                      <div className="fill" style={{ borderRadius: "0 var(--r) 0 0" }} />
                    </div>
                    <div className="arm">
                      <div className="bone" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero__words">
              <div className="hero__word hero__word--left">
                <span ref={doRef}>DO</span>
              </div>
              <div className="hero__word hero__word--right">
                <span ref={thingsRef}>THINGS</span>
              </div>
            </div>
          </section>

          <section ref={detailsSectionRef} className="w-full bg-black relative z-10 py-32" dir="rtl" style={{ fontFamily: persianFontFamily }}>
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