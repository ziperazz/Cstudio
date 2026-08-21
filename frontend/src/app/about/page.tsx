"use client";

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Preloader from '@/components/Preloader';
import ContactDrawer from '@/components/ContactDrawer';

// 🎯 وارد کردن فونت‌های گوگل
import { orbitronFont, outfitFont } from '@/app/fonts';

gsap.registerPlugin(ScrollTrigger);

// 🎛️===================================================================🎛️
//                   داشبورد تنظیمات پایه
// 🎛️===================================================================🎛️
const globalBgColor = "#050505";         
const solidBlackColor = "#000000";       
const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif'; 
const englishFontFamily = '"Outfit", sans-serif'; 

// 🎛️ تنظیمات هدر و منوی همبرگری - کاملاً سینک با هوم‌پیج
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

// 🎛️===================================================================🎛️
//                   دیتای خدمات برای تونل افقی
// 🎛️===================================================================🎛️
const servicesData = [
  { num: "01", fa: "تیزر تبلیغاتی", en: "TEASTER", video: "/k1.mp4", poster: "/poster1.jpg", desc: "خلق ویدیوهای سینمایی و مفهومی با کیفیت تصویر فوق‌العاده برای نمایش شکوه برند شما." },
  { num: "02", fa: "تولید محتوا", en: "CONTENT", video: "/k2.mp4", poster: "/poster2.jpg", desc: "استراتژی و تولید محتوای وایرال که صدای برند شما را به گوش هزاران نفر می‌رساند." }, 
  { num: "03", fa: "معرفی محصول", en: "PRODUCT", video: "/k3.mp4", poster: "/poster3.jpg", desc: "نمایش ۳ بعدی و استودیویی خیره‌کننده که جزئیات محصولات شما را برجسته می‌کند." }, 
  { num: "04", fa: "معرفی خدمات", en: "SERVICE", video: "/k4.mp4", poster: "/poster4.jpg", desc: "روایت جذاب داستان برند و خدماتی که ارائه می‌دهید با بالاترین استاندارد بصری." }, 
  { num: "05", fa: "اجرای کمپین", en: "CAMPAIGN", video: "/k5.mp4", poster: "/poster5.jpg", desc: "طراحی کمپین‌های تبلیغاتی ۳۶۰ درجه و مهندسی شده برای انفجار فروش و آگاهی از برند." },
  { num: "06", fa: "طراحی سایت", en: "WEB DESIGN", video: "/k6.mp4", poster: "/poster6.jpg", desc: "توسعه وب‌سایت‌های سفارشی با تعاملات مشابه Awwwards برای میخکوب کردن کاربر." },
];

export default function AboutPage() {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);

  const horizontalSectionRef = useRef<HTMLElement>(null);
  const horizontalContainerRef = useRef<HTMLDivElement>(null);

  // 🔒 قفل اسکرول هنگام باز بودن منو یا دراور
  useEffect(() => {
    if (mobileMenuOpen || contactDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen, contactDrawerOpen]);

  useEffect(() => {
    if (!mainContainerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        
        ScrollTrigger.create({
          trigger: "#about-hero",
          start: "bottom 80px", 
          onEnter: () => gsap.to(headerRef.current, { backgroundColor: "#111111", duration: 0.3 }),
          onLeaveBack: () => gsap.to(headerRef.current, { backgroundColor: "rgba(0,0,0,0)", duration: 0.3 }),
        });

        gsap.fromTo(
          ".hero-title-word",
          { yPercent: 120, opacity: 0 },
          { 
            yPercent: 0, 
            opacity: 1, 
            duration: 1.5, 
            stagger: 0.1, 
            ease: "power4.out",
            delay: 2.2 
          }
        );

        gsap.fromTo(
          ".hero-desc-fade",
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1.5, ease: "power3.out", delay: 2.8 }
        );

        gsap.fromTo(
          ".phil-anim",
          { y: 60, opacity: 0 },
          { 
            y: 0, 
            opacity: 1, 
            duration: 1.2, 
            stagger: 0.15, 
            ease: "power3.out", 
            scrollTrigger: { trigger: "#philosophy", start: "top 75%" } 
          }
        );

        gsap.to(".parallax-img", {
          yPercent: 25,
          ease: "none",
          scrollTrigger: {
            trigger: ".parallax-container",
            start: "top bottom",
            end: "bottom top",
            scrub: true
          }
        });

        let mm = gsap.matchMedia();

        // 🎯 انیمیشن اسکرول افقی پین شده فقط برای دسکتاپ
        mm.add("(min-width: 769px)", () => {
          const hzSection = horizontalSectionRef.current;
          const hzContainer = horizontalContainerRef.current;

          if (hzSection && hzContainer) {
            const getScrollAmount = () => -(hzContainer.scrollWidth - window.innerWidth);

            const tween = gsap.to(hzContainer, {
              x: getScrollAmount,
              ease: "none",
              scrollTrigger: {
                trigger: hzSection,
                pin: true,
                scrub: 1,
                end: () => `+=${hzContainer.scrollWidth - window.innerWidth}`,
                invalidateOnRefresh: true,
                anticipatePin: 1,
              }
            });

            const panels = gsap.utils.toArray('.hz-panel-desk');
            panels.forEach((panel: any) => {
              const videoWrapper = panel.querySelector('.hz-video-wrapper');
              if (videoWrapper) {
                gsap.fromTo(videoWrapper, 
                  { scale: 0.85, opacity: 0.5 }, 
                  { 
                    scale: 1, 
                    opacity: 1,
                    ease: "power2.out",
                    scrollTrigger: {
                      trigger: panel,
                      containerAnimation: tween,
                      start: "left center",
                      end: "center center",
                      scrub: true,
                    }
                  }
                );
              }
            });
          }
        });

      }, mainContainerRef); 
      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={mainContainerRef} className="relative w-full overflow-x-clip" style={{ backgroundColor: globalBgColor }}>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&display=swap');
        
        @font-face {
          font-family: 'Outfit';
          src: url('/fonts/OutfitSemiBold.ttf') format('truetype');
          font-weight: 600;
          font-style: normal;
        }

        @font-face {
          font-family: 'AzarMehr';
          src: url('/fonts/AzarMehr/Static/woff2/400-AzarMehr-FD-Regular.woff2') format('woff2'),
               url('/fonts/AzarMehr/Static/ttf/400-AzarMehr-FD-Regular.ttf') format('truetype');
          font-weight: 400;
          font-style: normal;
        }

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
          }
        }

        .burger-line {
          display: block;
          height: 2px;
          width: 100%;
          background-color: white;
          transition: all 0.5s cubic-bezier(0.76, 0, 0.24, 1);
        }
        .burger-line-1.open { transform: translateY(var(--header-burger-trans)) rotate(45deg); }
        .burger-line-2.open { opacity: 0; }
        .burger-line-3.open { transform: translateY(calc(var(--header-burger-trans) * -1)) rotate(-45deg); }
      `}</style>

      <Preloader />

      {/* =====================================================================
          هدر و منوی همبرگری - دقیقاً مثل هوم‌پیج
      ===================================================================== */}
      <header ref={headerRef} className="fixed top-0 left-0 w-full z-50 h-[80px] md:h-[100px] bg-transparent" dir="ltr">
        <div className="w-full relative h-full">
          <div className="absolute transition-all duration-500 z-[60]" style={{ left: "var(--header-logo-left)", top: "var(--header-logo-top)" }}>
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

          <div className="absolute z-[60]" style={{ right: "var(--header-burger-right)", top: "var(--header-burger-top)" }}>
            <button className="group relative flex flex-col justify-between items-end cursor-pointer focus:outline-none" style={{ width: "var(--header-burger-w)", height: "var(--header-burger-h)" }} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <span className={`burger-line burger-line-1 ${mobileMenuOpen ? 'open' : ''}`} />
              <span className={`burger-line burger-line-2 ${mobileMenuOpen ? 'open' : ''}`} />
              <span className={`burger-line burger-line-3 ${mobileMenuOpen ? 'open' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 منوی تمام‌صفحه - سینک شده با هوم‌پیج */}
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
                          className="group relative inline-block font-bold text-white transition-colors duration-300 tracking-tight text-right focus:outline-none cursor-pointer"
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

      <main>
        {/* =====================================================================
            هیرو - ۳ خطی و کاملاً متقارن در موبایل
        ===================================================================== */}
        <section id="about-hero" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#050505] pt-24 pb-20 md:pb-32 px-4 md:px-12">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[50vw] md:h-[50vw] rounded-full bg-zinc-900/30 blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 w-full max-w-[1700px] mx-auto flex flex-col items-center">
            
            <div className="mb-6 md:mb-10 overflow-hidden">
              <p className="hero-desc-fade text-zinc-500 tracking-[0.3em] text-[12px] md:text-[16px] font-bold uppercase" style={{ fontFamily: englishFontFamily }}>
                Who We Are
              </p>
            </div>

            <div className="flex flex-col items-center text-center w-full">
              <div className="overflow-hidden">
                <h1 className="hero-title-word text-[#f2f2f2] font-black uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(46px,11.5vw,220px)] whitespace-nowrap" style={{ fontFamily: englishFontFamily }}>
                  WE BREATHE
                </h1>
              </div>
              <div className="overflow-hidden mt-1 md:mt-0">
                <h1 className="hero-title-word text-[#f2f2f2] font-black uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(46px,11.5vw,220px)] whitespace-nowrap" style={{ fontFamily: englishFontFamily }}>
                  LIFE INTO
                </h1>
              </div>
              <div className="overflow-hidden mt-1 md:mt-0">
                <h1 className="hero-title-word text-zinc-600 font-black uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(46px,11.5vw,220px)] whitespace-nowrap" style={{ fontFamily: englishFontFamily }}>
                  BRANDS
                </h1>
              </div>
            </div>

            <div className="hero-desc-fade mt-10 md:mt-24 mb-6 md:mb-16 w-full max-w-[850px] text-center px-4" dir="rtl">
              <p className="text-zinc-400 text-[clamp(15px,1.4vw,22px)] font-light leading-[2.2]" style={{ fontFamily: persianFontFamily }}>
                طراحی برای ما یک شغل نیست، یک زبان مشترک برای خلق ارزش است. 
                ما در <strong className="text-white font-bold tracking-wider" style={{ fontFamily: englishFontFamily }}>C STUDIO</strong> مرزهای خلاقیت را جابجا می‌کنیم تا تجربه‌های دیجیتالی بسازیم که نه تنها دیده شوند، بلکه در ذهن‌ها حک شوند.
              </p>
            </div>

          </div>
        </section>

        {/* =====================================================================
            پارالاکس - رفع باگ فرمت تصویر
        ===================================================================== */}
        <section className="relative w-full h-[50vh] md:h-[80vh] overflow-hidden bg-[#111111] parallax-container">
          <img 
            src="/AB.jpg" 
            alt="C Studio Office" 
            className="parallax-img absolute top-[-20%] left-0 w-full h-[140%] object-cover grayscale opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
        </section>

        {/* =====================================================================
            فلسفه
        ===================================================================== */}
        <section id="philosophy" className="w-full bg-[#111111] py-24 md:py-40 px-[5vw] relative z-10" dir="ltr">
          <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-24">
            
            <div className="w-full lg:w-[60%] flex flex-col">
              <h2 className="phil-anim font-bold leading-[1.1] tracking-[-0.04em] text-[#f2f2f2] text-[clamp(42px,6vw,110px)]" style={{ fontFamily: englishFontFamily }}>
                WE DON'T JUST<br />
                MAKE THINGS<br />
                LOOK GOOD
              </h2>
              <div className="mt-8 md:mt-16 lg:ml-[10vw]">
                <h2 className="phil-anim font-bold leading-[1.1] tracking-[-0.04em] text-zinc-600 text-[clamp(34px,5vw,90px)]" style={{ fontFamily: englishFontFamily }}>
                  WE MAKE<br />
                  THEM MATTER
                </h2>
              </div>
            </div>

            <div className="w-full lg:w-[40%] flex flex-col pt-4 lg:pt-10" dir="rtl">
              <div className="phil-anim mb-8 h-[2px] w-[80px] bg-zinc-600" />
              <p className="phil-anim text-zinc-300 text-[clamp(15px,1.2vw,18px)] leading-[2.4] font-light text-justify" style={{ fontFamily: persianFontFamily }}>
                در دنیای پرهیاهوی امروز، جلب توجه کافی نیست؛ باید دلیلی برای ماندگاری ارائه داد. ما باور داریم که هر برند، یک داستان ناگفته دارد که منتظر است با استراتژی دقیق و طراحی جسورانه به تصویر کشیده شود. 
                <br /><br />
                تیم ما متشکل از طراحان، توسعه‌دهندگان و استراتژیست‌هایی است که به چیزی کمتر از کمال قانع نمی‌شوند. ما چالش‌های پیچیده را به راهکارهای ساده و زیبا تبدیل می‌کنیم و در هر پروژه، تکه‌ای از روحِ هنر را با تکنولوژی ادغام می‌کنیم.
              </p>

              <div className="phil-anim mt-16 flex gap-16 border-t border-white/10 pt-10">
                <div className="flex flex-col">
                  <span className="text-white font-black text-5xl md:text-6xl mb-2" style={{ fontFamily: englishFontFamily }}>7<span className="text-zinc-500">+</span></span>
                  <span className="text-zinc-500 text-xs md:text-sm tracking-widest uppercase font-bold" style={{ fontFamily: englishFontFamily }}>Years Exp</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-5xl md:text-6xl mb-2" style={{ fontFamily: englishFontFamily }}>90<span className="text-zinc-500">+</span></span>
                  <span className="text-zinc-500 text-xs md:text-sm tracking-widest uppercase font-bold" style={{ fontFamily: englishFontFamily }}>Projects</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =====================================================================
            تونل افقی - دسکتاپ پین شده / موبایل اسکرول لمسی و نیتیو
        ===================================================================== */}
        
        {/* 💻 نسخه دسکتاپ (بدون تغییر) */}
        <section id="horizontal-services" ref={horizontalSectionRef} className="hidden md:block relative w-full h-screen bg-[#111111] overflow-hidden" dir="ltr">
          <div ref={horizontalContainerRef} className="flex h-full w-fit flex-nowrap items-center">
            
            <div className="hz-panel-desk w-screen h-screen flex-shrink-0 flex flex-col items-center justify-center relative px-6">
              <h2 className="text-white font-black text-center text-[clamp(60px,13vw,250px)] uppercase tracking-tighter leading-[1]" style={{ fontFamily: englishFontFamily }}>
                OUR EXPERTISE
              </h2>
              <p className="text-zinc-500 mt-10 tracking-[0.4em] uppercase text-lg font-bold text-center" style={{ fontFamily: englishFontFamily }}>
                Scroll to explore
              </p>
            </div>

            {servicesData.map((item, index) => (
              <div key={index} className="hz-panel-desk w-screen h-screen flex-shrink-0 relative flex items-center justify-center overflow-hidden">
                
                <div className="hz-video-wrapper relative w-[60vw] lg:w-[45vw] h-[65vh] overflow-hidden rounded-[40px] shadow-2xl shadow-black">
                  <video 
                    src={item.video} 
                    poster={item.poster}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                </div>

                <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white mix-blend-difference z-20 font-black uppercase text-[8vw] pointer-events-none whitespace-nowrap tracking-tighter" style={{ fontFamily: englishFontFamily }}>
                  {item.en}
                </h2>

                <div className="absolute bottom-[10vh] right-[10vw] w-[350px] z-30 flex flex-col items-end text-right" dir="rtl">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="text-zinc-400 font-light text-2xl" style={{ fontFamily: englishFontFamily }}>{item.num}</span>
                    <div className="h-[2px] w-[50px] bg-zinc-600" />
                    <h3 className="text-white font-bold text-3xl" style={{ fontFamily: persianFontFamily }}>{item.fa}</h3>
                  </div>
                  <p className="text-zinc-400 font-light leading-[2] text-base border-r-2 border-white/20 pr-4" style={{ fontFamily: persianFontFamily }}>
                    {item.desc}
                  </p>
                </div>

              </div>
            ))}

          </div>
        </section>

        {/* 📱 نسخه موبایل - اسکرول لمسی و ارگونومیک بدون قفل شدن صفحه */}
        <section className="block md:hidden w-full bg-[#111111] py-16 overflow-hidden" dir="ltr">
          <div className="px-6 mb-8 text-center">
            <h2 className="text-white font-black text-4xl uppercase tracking-tighter" style={{ fontFamily: englishFontFamily }}>
              OUR EXPERTISE
            </h2>
            <p className="text-zinc-500 mt-2 tracking-[0.2em] uppercase text-[11px] font-bold" style={{ fontFamily: englishFontFamily }}>
              Swipe to explore
            </p>
          </div>

          <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory px-6 gap-6 scroll-smooth pb-4">
            {servicesData.map((item, index) => (
              <div key={`mob-hz-${index}`} className="w-[85vw] flex-shrink-0 snap-center relative flex flex-col">
                <div className="relative w-full h-[360px] overflow-hidden rounded-2xl shadow-xl shadow-black bg-zinc-900">
                  <video 
                    src={item.video} 
                    poster={item.poster}
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute bottom-4 left-4 right-4 z-20" dir="rtl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-zinc-400 font-mono text-sm" dir="ltr">{item.num}</span>
                      <div className="h-[2px] w-[20px] bg-zinc-600" />
                      <h3 className="text-white font-bold text-xl" style={{ fontFamily: persianFontFamily }}>{item.fa}</h3>
                    </div>
                    <p className="text-zinc-300 font-light leading-relaxed text-xs" style={{ fontFamily: persianFontFamily }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

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
          <div className="flex gap-6 md:gap-8 text-[11px] md:text-[13px] tracking-[0.2em] text-zinc-500 font-bold" style={{ fontFamily: englishFontFamily }}>
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
  );
}