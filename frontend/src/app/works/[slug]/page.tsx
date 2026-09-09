"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

const premiumEase = [0.76, 0, 0.24, 1];
const preloaderDurationMs = 2700;

// 🎛️ تنظیمات هدر و منو
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
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();

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

  // استیت‌های دراور سفارش
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [orderStep, setOrderStep] = useState(1);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [isOrderSending, setIsOrderSending] = useState(false);
  const orderScrollContainerRef = useRef<HTMLDivElement>(null);

  const [orderForm, setOrderForm] = useState({ name: '', brand: '', phone: '', email: '', message: '' });
  
  const isOrderNameValid = orderForm.name.trim().length >= 3;
  const isOrderPhoneValid = /^09[0-9]{9}$/.test(orderForm.phone.replace(/\s/g, ''));
  const isOrderEmailValid = orderForm.email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderForm.email);

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
    if (isPreloading || mobileMenuOpen || contactDrawerOpen || isOrderModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isPreloading, mobileMenuOpen, contactDrawerOpen, isOrderModalOpen]);

  useEffect(() => {
    if (isOrderModalOpen) {
      setOrderStep(1);
      setIsOrderSubmitted(false);
      setIsOrderSending(false);
      setOrderForm({ name: '', brand: '', phone: '', email: '', message: '' });
    }
  }, [isOrderModalOpen]);

  useEffect(() => {
    if (isOrderModalOpen && orderScrollContainerRef.current) {
      setTimeout(() => {
        orderScrollContainerRef.current?.scrollTo({
          top: orderScrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [orderStep, isOrderModalOpen]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 🚀 واکشی هوشمند با پشتیبانی همزمان از slug و _id
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        let matchedProject: Project | null = null;

        // گام ۱: تلاش برای دریافت با slug
        const resSlug = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/slug/${slug}`);
        const dataSlug = await resSlug.json();

        if (dataSlug.success && dataSlug.data) {
          matchedProject = dataSlug.data;
        } else if (/^[0-9a-fA-F]{24}$/.test(slug)) {
          // گام ۲: در صورت نبود slug و معتبر بودن ساختار MongoDB ID
          const resId = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${slug}`);
          const dataId = await resId.json();
          if (dataId.success && dataId.data) {
            matchedProject = dataId.data;
          }
        }

        if (matchedProject) {
          setProject(matchedProject);

          // دریافت پروژه‌های پیشنهادی
          const resAll = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
          const dataAll = await resAll.json();
          if (dataAll.success && Array.isArray(dataAll.data)) {
            const others = dataAll.data.filter((p: Project) => p._id !== matchedProject?._id && p.slug !== matchedProject?.slug);
            setSuggestedProjects(others.slice(0, 5));
          }
        } else {
          setProject(null);
        }
      } catch (err) {
        console.error('خطا در دریافت اطلاعات:', err);
        setProject(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
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

  const heroPoster = project?.screenshots && project.screenshots.length > 0 ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${project.screenshots[0]}` : '';

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });
  };

  const nextOrderStep = (targetStep: number) => {
    setOrderStep(targetStep);
  };

  const handleOrderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, targetStep: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (orderStep === 1 && !isOrderNameValid) return;
      if (orderStep === 2 && (!isOrderPhoneValid || !isOrderEmailValid)) return;
      nextOrderStep(targetStep);
    }
  };

  const handleOrderSubmit = async () => {
    if (!isOrderNameValid || !isOrderPhoneValid || !isOrderEmailValid) return;
    setIsOrderSending(true);

    const payload = {
      projectId: project?._id,
      projectSlug: project?.slug,
      projectVideo: project?.videos && project.videos.length > 0 ? project.videos[0] : null,
      projectName: project?.teaserName,
      companyName: project?.companyName,
      customerName: orderForm.name,
      customerBrand: orderForm.brand,
      customerPhone: orderForm.phone,
      customerEmail: orderForm.email,
      description: orderForm.message
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsOrderSubmitted(true);
      } else {
        alert(data.message || 'خطا در ثبت سفارش.');
      }
    } catch (error) {
      console.error(error);
      alert('خطا در برقراری ارتباط با سرور.');
    } finally {
      setIsOrderSending(false);
    }
  };

  return (
    <>
      <Preloader />

      {isLoading ? (
        <div className="w-full h-screen bg-black flex items-center justify-center" style={{ display: isPreloading ? 'none' : 'flex' }}>
          <div className="w-12 h-12 border-2 border-zinc-800 border-t-white rounded-full animate-spin" />
        </div>
      ) : !project ? (
        /* 🚀 گارد محافظتی: نمایش پیام تمیز به جای کرش صفحه */
        <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center text-center px-4" style={{ fontFamily: persianFontFamily }}>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">پروژه مورد نظر یافت نشد</h2>
          <p className="text-zinc-500 text-sm md:text-base mb-8">ممکن است این نمونه‌کار حذف شده یا آدرس آن تغییر کرده باشد.</p>
          <Link href="/works" className="px-8 py-3.5 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors text-sm">
            مشاهده تمام نمونه‌کارها
          </Link>
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

          <section ref={detailsSectionRef} className="w-full bg-black relative z-10 pt-[150px] md:pt-[200px] pb-16 md:pb-32" dir="rtl" style={{ fontFamily: persianFontFamily }}>
            <div className="max-w-[1700px] mx-auto px-6 md:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                <div className="lg:col-span-4">
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

                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-24 mb-10 border-t border-zinc-800/80 pt-10" />

                  <div className="flex flex-col w-full" style={{ gap: videoGap }}>
                    {project.videos && project.videos.map((vid, idx) => {
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
                  
                  {/* سکشن CTA ایستا */}
                  <div className="w-full mt-24 md:mt-32 pt-16 border-t border-zinc-800/50 flex flex-col items-center justify-center text-center relative">
                    <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight">
                      تجربه‌ای مشابه برای برند شما؟
                    </h3>
                    <p className="text-zinc-400 text-base md:text-lg lg:text-xl mb-8 md:mb-10 font-light max-w-2xl px-4 leading-relaxed">
                      اگر این سبک از روایت و تصویرسازی مورد توجه شما قرار گرفته، ما آماده‌ایم تا ایده شما را به واقعیتی چشم‌گیر تبدیل کنیم.
                    </p>
                    
                    <div className="relative group cursor-pointer" onClick={() => setIsOrderModalOpen(true)}>
                      <div className="absolute -inset-2 bg-gradient-to-r from-zinc-500 to-zinc-700 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-500 group-hover:duration-200"></div>
                      <button className="relative flex items-center gap-4 px-8 py-4 md:px-10 md:py-5 bg-white text-black rounded-full font-bold text-base md:text-xl hover:scale-[1.02] transition-transform duration-300">
                        <span>سفارش این محصول</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" dir="ltr"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </button>
                    </div>
                  </div>

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
                    {suggestedProjects.map((p) => (
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
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-10 pr-6 md:pr-12">
                    <div className="flex items-center gap-6">
                      <button onClick={scrollLeftNav} className="w-12 h-12 flex items-center justify-center text-white hover:text-zinc-400 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                      </button>
                      <button onClick={scrollRightNav} className="w-12 h-12 flex items-center justify-center text-white hover:text-zinc-400 transition-colors">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 19"></polyline></svg>
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

          {/* فوتر */}
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
                <a href="https://www.instagram.com/c.studio.adv?igsh=OTIyMmR6MzduNHBk" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">IG</a>
                <a href="https://t.me/+989376303872" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">TG</a>
                <a href="https://wa.me/989376303872" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer transition-colors">WA</a>
              </div>
              <div className="text-[10px] tracking-[0.12em] text-zinc-500 md:hidden mt-4 font-medium text-center" style={{ fontFamily: englishFontFamily }}>
                © 2026 C STUDIO. ALL RIGHTS RESERVED.
              </div>
            </footer>
          </section>

          <ContactDrawer 
            isOpen={contactDrawerOpen} 
            onClose={() => setContactDrawerOpen(false)} 
            onOpenMenu={() => setMobileMenuOpen(true)} 
          />

          {/* دراور سفارش */}
          <AnimatePresence>
            {isOrderModalOpen && (
              <div className="fixed inset-0 z-[100] flex w-full h-full text-white bg-transparent overflow-hidden" dir="ltr" style={{ fontFamily: englishFontFamily }}>
                <motion.div
                  initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                  exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                  transition={{ duration: 0.8, ease: premiumEase }}
                  className="fixed inset-0 bg-black/70 cursor-pointer z-10"
                  onClick={() => setIsOrderModalOpen(false)}
                />

                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ duration: 0.8, ease: premiumEase }}
                  className="relative w-full md:w-[60%] lg:w-[42%] h-full bg-[#030303] shadow-[30px_0_100px_rgba(0,0,0,0.9)] flex flex-col z-20 border-r border-white/10"
                >
                  <div className="w-full flex items-center justify-between py-6 px-6 md:px-10 shrink-0 border-b border-white/5">
                    <button 
                      onClick={() => setIsOrderModalOpen(false)}
                      className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transform transition-transform group-hover:-translate-x-1.5">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      <span className="font-semibold tracking-[0.3em] text-[10px] uppercase">Close</span>
                    </button>
                    <div className="text-zinc-100 font-black tracking-[0.15em] text-xl md:text-2xl uppercase" style={{ fontFamily: englishFontFamily }}>
                      ORDER PROJECT
                    </div>
                  </div>

                  <div ref={orderScrollContainerRef} className="flex-1 w-full overflow-y-auto hide-scrollbar px-6 md:px-12 py-8 md:py-10" dir="rtl" style={{ fontFamily: persianFontFamily }}>
                    <AnimatePresence mode="wait">
                      {isOrderSubmitted ? (
                        <motion.div 
                          key="order-success"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.8, ease: premiumEase }}
                          className="flex flex-col items-center justify-center h-full text-center mt-20"
                          dir="ltr"
                        >
                          <div className="relative mb-10">
                            <motion.div 
                              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, ease: premiumEase }}
                              className="w-24 h-24 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/20 backdrop-blur-md"
                            >
                              <svg viewBox="0 0 50 50" className="w-12 h-12">
                                <motion.path
                                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: premiumEase, delay: 0.3 }}
                                  d="M15 26l7 7 14-14" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                />
                              </svg>
                            </motion.div>
                          </div>
                          <motion.h2 
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: premiumEase }}
                            className="text-[32px] md:text-[45px] font-black tracking-tight leading-none mb-4 text-white"
                          >
                            REQUEST RECEIVED.
                          </motion.h2>
                          <motion.p 
                            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: premiumEase }}
                            className="text-zinc-400 text-sm md:text-base font-light mb-12 tracking-wide" dir="rtl" style={{ fontFamily: persianFontFamily }}
                          >
                            درخواست سفارش شما با موفقیت ثبت شد.<br/>به زودی برای مشاوره با شما تماس می‌گیریم.
                          </motion.p>
                          <motion.button 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                            onClick={() => setIsOrderModalOpen(false)} 
                            className="px-8 py-3 bg-white text-black rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all hover:bg-zinc-200"
                          >
                            Close
                          </motion.button>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col gap-12 pb-16">
                          
                          {/* کارت محصول */}
                          <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 mb-2 relative overflow-hidden shadow-inner">
                            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                            
                            <div className="w-[84px] h-[60px] bg-black border border-white/5 rounded-lg overflow-hidden relative flex-shrink-0 shadow-inner">
                              <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="2" y="2" width="20" height="20" rx="2.5" ry="2.5"></rect>
                                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                                </svg>
                              </div>
                              
                              {project.videos && project.videos[0] ? (
                                <video 
                                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${project.videos[0]}#t=0.1`} 
                                  preload="metadata" 
                                  muted 
                                  playsInline 
                                  className="absolute inset-0 w-full h-full object-cover z-10" 
                                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                              ) : heroPoster ? (
                                <img src={heroPoster} alt={project.teaserName} className="absolute inset-0 w-full h-full object-cover z-10" />
                              ) : null}
                            </div>
                            
                            <div className="flex flex-col overflow-hidden z-10">
                              <span className="text-[11px] text-zinc-500 mb-1 tracking-wider">پروژه درخواستی شما:</span>
                              <span className="text-sm md:text-base text-white font-bold truncate">{project.teaserName}</span>
                            </div>
                          </div>

                          {/* مرحله ۱ */}
                          <div className={`flex flex-col gap-5 transition-opacity duration-300 focus-within:opacity-100 ${orderStep > 1 ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}>
                            <div className="flex items-center gap-3">
                              <span className="text-zinc-600 font-mono text-sm">01</span>
                              <h3 className="text-zinc-200 text-lg md:text-xl font-medium tracking-wide">نام و نشان شما</h3>
                            </div>
                            <div className="flex flex-col md:flex-row gap-5">
                              <input 
                                type="text" name="name" value={orderForm.name} onChange={handleOrderChange} onKeyDown={(e) => handleOrderKeyDown(e, 2)}
                                className="flex-1 bg-transparent border-b border-zinc-800 focus:border-white text-white text-base md:text-lg py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors font-light"
                                placeholder="نام و نام خانوادگی *"
                              />
                              <input 
                                type="text" name="brand" value={orderForm.brand} onChange={handleOrderChange} onKeyDown={(e) => handleOrderKeyDown(e, 2)}
                                className="flex-1 bg-transparent border-b border-zinc-800 focus:border-white text-white text-base md:text-lg py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors font-light"
                                placeholder="نام برند یا شرکت"
                              />
                            </div>
                            {orderStep === 1 && (
                              <button 
                                onClick={() => nextOrderStep(2)} disabled={!isOrderNameValid}
                                className="self-end px-6 py-2.5 bg-white text-black rounded-full font-semibold text-xs tracking-wider uppercase disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-zinc-200"
                              >
                                تایید و ادامه
                              </button>
                            )}
                          </div>

                          {/* مرحله ۲ */}
                          {orderStep >= 2 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: premiumEase }} className={`flex flex-col gap-5 transition-opacity duration-300 focus-within:opacity-100 ${orderStep > 2 ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}>
                              <div className="flex items-center gap-3">
                                <span className="text-zinc-600 font-mono text-sm">02</span>
                                <h3 className="text-zinc-200 text-lg md:text-xl font-medium tracking-wide">راه‌های ارتباطی</h3>
                              </div>
                              <div className="flex flex-col md:flex-row gap-5">
                                <div className="flex-1">
                                  <input 
                                    type="tel" name="phone" dir="ltr" value={orderForm.phone} onChange={handleOrderChange} onKeyDown={(e) => handleOrderKeyDown(e, 3)}
                                    className={`w-full bg-transparent border-b ${orderForm.phone.trim() !== '' && !isOrderPhoneValid ? 'border-red-500/50' : 'border-zinc-800'} focus:border-white text-white text-base md:text-lg py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors text-right font-light`}
                                    placeholder="شماره موبایل *"
                                  />
                                  {orderForm.phone.trim() !== '' && !isOrderPhoneValid && (
                                    <p className="text-red-500/70 text-xs mt-1">فرمت موبایل صحیح نیست (مثال: 09120000000)</p>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <input 
                                    type="email" name="email" dir="ltr" value={orderForm.email} onChange={handleOrderChange} onKeyDown={(e) => handleOrderKeyDown(e, 3)}
                                    className={`w-full bg-transparent border-b ${orderForm.email.trim() !== '' && !isOrderEmailValid ? 'border-red-500/50' : 'border-zinc-800'} focus:border-white text-white text-base md:text-lg py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors text-right font-light`}
                                    placeholder="آدرس ایمیل"
                                  />
                                  {orderForm.email.trim() !== '' && !isOrderEmailValid && (
                                    <p className="text-red-500/70 text-xs mt-1">فرمت ایمیل صحیح نیست</p>
                                  )}
                                </div>
                              </div>
                              {orderStep === 2 && (
                                <button 
                                  onClick={() => nextOrderStep(3)} disabled={!isOrderPhoneValid || !isOrderEmailValid}
                                  className="self-end px-6 py-2.5 bg-white text-black rounded-full font-semibold text-xs tracking-wider uppercase disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-zinc-200"
                                >
                                  مرحله آخر
                                </button>
                              )}
                            </motion.div>
                          )}

                          {/* مرحله ۳ */}
                          {orderStep >= 3 && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: premiumEase }} className="flex flex-col gap-5">
                              <div className="flex items-center gap-3">
                                <span className="text-zinc-600 font-mono text-sm">03</span>
                                <h3 className="text-zinc-200 text-lg md:text-xl font-medium tracking-wide">توضیحات تکمیلی</h3>
                              </div>
                              <textarea 
                                name="message" value={orderForm.message} onChange={handleOrderChange}
                                rows={3}
                                className="w-full bg-transparent border-b border-zinc-800 focus:border-white text-white text-base py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors resize-none font-light leading-relaxed"
                                placeholder="نیازهای خاص برند خود را بنویسید..."
                              />
                              
                              <div className="flex justify-end pt-4">
                                <button 
                                  onClick={handleOrderSubmit} 
                                  disabled={!isOrderNameValid || !isOrderPhoneValid || !isOrderEmailValid || isOrderSending}
                                  className="px-8 py-3.5 bg-white text-black rounded-full font-bold text-sm tracking-wider uppercase disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-2.5 hover:bg-zinc-200 shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                                >
                                  {isOrderSending ? (
                                    <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span> در حال ارسال</>
                                  ) : (
                                    'ثبت نهایی سفارش'
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          )}

                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

        </div>
      )}
    </>
  );
}