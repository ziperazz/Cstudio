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
//                   داشبورد تنظیمات اصلی سایت
// 🎛️===================================================================🎛️

const globalBgColor = "#050505";         
const solidBlackColor = "#000000";       
const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif'; 
const englishFontFamily = '"Outfit", sans-serif'; 

// 🎛️ تنظیماتِ هدر و منوی همبرگری
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

// 🎛️ هندسه‌ی ماسک هیرو 
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
const preloaderDuration = 2;             
const waitAfterPreload = 1;            
const startDelay = preloaderDuration + waitAfterPreload; 

// 🎚️ پنل تنظیم زنده 
const ENABLE_HERO_TUNER = false;

type HeroTune = {
  frame: number; sep: number; armH: number; armW: number; boneW: number; boneH: number; iGap: number; iBodyH: number; radius: number; align: number; sideFlex: number; iFlex: number; dotOvalness: number; wordSize: number; wordInset: number; wordBottom: number;   
};

const MOBILE_HERO_TUNE: HeroTune = { frame: 13, sep: 6, armH: 6, armW: 52, boneW: 10, boneH: 10, iGap: 8, iBodyH: 39, radius: 13, align: 19, sideFlex: 1.25, iFlex: 0.5, dotOvalness: 1.006, wordSize: 18, wordInset: 19, wordBottom: 12 };
const TABLET_LAPTOP_HERO_TUNE: HeroTune = { frame: 13, sep: 6, armH: 6, armW: 47, boneW: 13, boneH: 14, iGap: 8, iBodyH: 39, radius: 13, align: 27, sideFlex: 1.25, iFlex: 0.32, dotOvalness: 1.006, wordSize: 18, wordInset: 19, wordBottom: 12 };

const TUNER_FIELDS: Array<[keyof HeroTune, string, number, number, number, string]> = [
  ['align', 'ارتفاع خط افقی', 5, 50, 0.5, '%'], ['iFlex', 'عرض ستون وسط', 0.2, 1.2, 0.01, ''], ['sideFlex', 'عرض ستون‌های کناری', 0.8, 2.0, 0.01, ''], ['boneH', 'طول استخوان عمودی', 3, 30, 0.5, 'svh'], ['iBodyH', 'طول بدنه‌ی i', 5, 90, 0.5, 'svh'], ['boneW', 'کلفتی استخوان عمودی', 4, 30, 1, 'px'], ['armW', 'طول بازوی افقی', 20, 80, 1, '%'], ['armH', 'کلفتی بازوی افقی', 2, 20, 1, 'px'], ['sep', 'عرض خط جداکننده', 2, 25, 1, 'px'], ['frame', 'ضخامت قاب', 0, 40, 1, 'px'], ['radius', 'گردی گوشه‌ها', 0, 50, 1, 'px'], ['iGap', 'فاصله نقطه i', 0, 40, 1, 'px'], ['dotOvalness', 'بیضی‌بودن نقطه', 0.8, 1.4, 0.002, ''], ['wordSize', 'سایز متون', 10, 48, 1, 'px'], ['wordInset', 'فاصله افقی متون', 0, 60, 1, 'px'], ['wordBottom', 'فاصله عمودی متون', 0, 60, 1, 'px']
];

const tuneToVars = (t: HeroTune): React.CSSProperties => ({
  ['--frame' as string]: `${t.frame}px`, ['--sep' as string]: `${t.sep}px`, ['--arm-h' as string]: `${t.armH}px`, ['--arm-w' as string]: `${t.armW}%`, ['--bone-w' as string]: `${t.boneW}px`, ['--bone-h' as string]: `${t.boneH}svh`, ['--i-gap' as string]: `${t.iGap}px`, ['--i-body-h' as string]: `${t.iBodyH}svh`, ['--r' as string]: `${t.radius}px`, ['--align' as string]: `${t.align}%`, ['--side-flex' as string]: `${t.sideFlex}`, ['--i-flex' as string]: `${t.iFlex}`, ['--dot-ovalness' as string]: `${t.dotOvalness}`, ['--word-size' as string]: `${t.wordSize}px`, ['--word-inset' as string]: `${t.wordInset}px`, ['--word-bottom' as string]: `${t.wordBottom}px`,
});

const tuneToCode = (t: HeroTune, isTabletOrLaptop: boolean = false) =>
  `const ${isTabletOrLaptop ? 'TABLET_LAPTOP' : 'MOBILE'}_HERO_TUNE: HeroTune = {\n` + (Object.keys(t) as Array<keyof HeroTune>).map((k) => `  ${k}: ${t[k]},`).join('\n') + `\n};`;

// 🎛️ تنظیماتِ بخش دوم (CSTD)
const cstdAnimStart = "top 30%";         
const cstdAnimDuration = 0.7;            
const blockWidthX = "clamp(560px, 49.5vw, 950px)";             
const blockHeightY = "clamp(380px, 33.85vw, 650px)";            
const cstdSmallTextFontSize = "clamp(15px, 1.3vw, 25px)";    
const cstdSmallTextWidth = "clamp(280px, 20.8vw, 400px)";      

const cstdFontFamily = '"Outfit", sans-serif'; 
const cstdFontWeight = 600;              
const cstdMainFontSize = "clamp(82px, 8.59vw, 165px)";        
const cstdLineHeight = "clamp(92px, 9.58vw, 184px)";          
const cstdFontColor = "rgb(250, 250, 250)"; 

const cstdWordGap = "clamp(11px, 1.04vw, 20px)";              
const cstdVideoWordGap = "clamp(5px, 0.52vw, 10px)";         

const cstdVideoWidth1 = "clamp(165px, 15.63vw, 300px)";         
const cstdVideoWidth2 = "clamp(248px, 23.44vw, 450px)";         
const cstdVideoWidth3 = "clamp(193px, 18.23vw, 350px)";         
const cstdVideoHeight = "clamp(66px, 6.25vw, 120px)";         
const cstdVideoRadius = "16px";          

const mobCstdMainFontSize = "42px";        
const mobCstdVideoHeight = "32px";         
const mobCstdVideoWidth1 = "75px";         
const mobCstdVideoWidth2 = "100px";        
const mobCstdVideoWidth3 = "70px";         
const mobCstdVideoRadius = "8px";         

// 🎛️ تنظیماتِ بخش خدمات
const bentoRevealStart = "top 50%";      
const bentoPaddingY = "clamp(90px, 14vh, 220px)";            
const bentoAnimDuration = 1.7;           
const bentoEntranceDistance = 300;       
const servicesTextFontSize = "clamp(80px, 7vw, 135px)";    
const servicesTitleOffsetX = "clamp(16px, 2.1vw, 40px)";     
const servicesGridGap = "clamp(16px, 1.56vw, 30px)";          
const servicesBoxBaseHeight = "clamp(175px, 13.5vw, 285px)";   
const servicesGridScale = 1.0;          
const bentoVideoHoverScale = 1.20;       
const servicesOverlayOpacity = 0.1;      
const servicesOverlayHoverOpacity = 0.1; 

const mobServiceBoxWidth = "340px";          
const mobServiceBoxHeight = "400px";         
const mobServiceGapY = "4vh";                
const mobServiceWallOffset = -30;            
const mobServiceTextWord = "SERVICES";       
const mobServiceTextFontSize = "55px";       
const mobServiceTextColor = "#d1d1d1";       
const mobServiceTextLetterSpacing = "0.1em"; 
const mobServiceTextGap = 0;                 
const mobServiceTextTop = "44%";             
const mobServiceTextYPercent = -50;          
const mobServiceTextOffsetX = -7;            
const mobServiceTextOffsetY = 0;             
const mobServiceTextMoveX = 300;             
const mobServiceTextFadeTarget = 1;          
const mobServiceBoxEase = "power3.out";      
const mobServiceTextEase = "power2.inOut";   
const mobServiceScrollStart = "top 35%";     
const mobServiceScrollEnd = "top 10%";       
const mobServiceScrub = 1;                   
const mobServiceTextSpeed = 0.7;             
const mobServiceBoxSpeed = 1.3;              
const mobServiceRestStartX = -80;            
const mobServiceRestStartOpacity = 0;        
const mobServiceRestScrollStart = "top 50%"; 
const mobServiceRestScrollEnd = "top 30%";   
const mobServiceRestScrub = 1.5;             
const mobServiceRestEase = "power2.out";     

// 🎛️ تنظیماتِ بخش نمونه کارها 
const worksAnimStart = "top 70%";        
const worksAnimDuration = 1.7;           
const worksAnimEase = "power3.out";      
const worksWordEntranceDist = 250;       
const worksBoxesEntranceDist = -300;     
const worksAnimToggleActions = "play none none reverse"; 
const worksImageHoverScale = 1.08;       
const worksImageHoverSpeed = "0.7s";     
const worksBgColor = "#000000";          
const worksWordText = " WORK";           
const worksWordColor = "#FFFFFF";        
const worksPaddingY = "clamp(120px, calc(-51.4px + 16.74vw), 270px)";
const worksColGap = "clamp(14px, calc(7.1px + 0.67vw), 20px)";
const worksRowGap = "clamp(30px, calc(7.1px + 2.23vw), 50px)";
const worksWordSize = "clamp(120px, calc(28.6px + 8.93vw), 200px)";
const worksWordGap = "clamp(40px, calc(-17.1px + 5.58vw), 90px)";
const worksBoxGlobalScale = 1.00;
const worksTitleOffsetX = "0px";
const worksTitleOffsetY = "0px";  
const worksOverlayOpacity = 0;         
const worksOverlayHoverOpacity = 0.0;    
const worksTextMarginTop = "clamp(14px, 1.3vw, 25px)";       
const worksTitleFontSize = "clamp(20px, 1.82vw, 35px)";       
const worksSubFontSize = "clamp(12px, 1.04vw, 20px)";         
const worksBtnText = "مشاهده همه نمونه کارها"; 
const worksBtnWidth = "280px";           
const worksBtnHeight = "70px";           
const worksBtnMarginTop = "clamp(5px, 1.5vw, 15px)";        
const worksBtnOffsetX = "0px";           
const worksBtnOffsetY = "0px";           
const worksBtnFontSize = "18px";         
const worksFooterText = "DO BIG THINGS"; 
const worksFooterFontSize = "clamp(120px, 13vw, 250px)";     
const worksFooterLetterSpacing = "-2px"; 
const worksFooterGap = "clamp(-40px, -2.1vw, -20px)";          
const worksFooterMarginTop = "clamp(40px, 4.2vw, 80px)";     
const worksFooterStrokeColor = "#FFFFFF";
const worksFooterAnimStart = "top 90%";  
const worksFooterAnimEnd = "bottom 55%"; 
const worksFooterScrub = 2;              
const worksFooterText1StartX = -500;     
const worksFooterText1EndX = 40;        
const worksFooterText2StartX = 250;      
const worksFooterText2EndX = -250; 

// 🎯 مقادیر دقیقاً برگشت به تنظیمات اورجینال
const mobWorksFooterFontSize = "105px";              
const mobWorksFooterLetterSpacing = "-1px";         
const mobWorksFooterGap = "-15px";                  
const mobWorksFooterMarginTop = "100px";             
const mobWorksFooterText1StartX = -10;             
const mobWorksFooterText1EndX = 170;                 
const mobWorksFooterText2StartX = 10;              
const mobWorksFooterText2EndX = -160;                
const mobWorksFooterAnimStart = "top 90%";          
const mobWorksFooterAnimEnd = "bottom 60%";         
const mobWorksFooterScrub = 1.5;                    

const mobWorksBox1Width = "340px";          
const mobWorksBox1Height = "480px";         
const mobWorksOtherBoxWidth = "340px";      
const mobWorksOtherBoxHeight = "380px";     
const mobWorksGapY = "0vh";                 
const mobWorksWallVisible = 300;            
const mobWorksTextWord = "WORK";            
const mobWorksTextFontSize = "80px";       
const mobWorksTextColor = "#FFFFFF";        
const mobWorksTextLetterSpacing = "0.1em";  
const mobWorksTextGap = 120;                 
const mobWorksTextOffsetX = 120;            
const mobWorksTextTop = "30%";              
const mobWorksTextYPercent = -50;           
const mobWorksTextOffsetY = 40;             
const mobWorksTextMoveX = -180;             
const mobWorksTextFadeTarget = 0;           
const mobWorksBoxEase = "power3.out";       
const mobWorksTextEase = "power2.inOut";    
const mobWorksScrollStart = "top 20%";      
const mobWorksScrollEnd = "top 10%";        
const mobWorksScrub = 0.8;                  
const mobWorksTextSpeed = 0.8;              
const mobWorksBoxSpeed = 1.3;               
const mobWorksRestWallVisible = 0;          
const mobWorksRestStartOpacity = 0;         
const mobWorksRestScrollStart = "top 70%";  
const mobWorksRestScrollEnd = "top 30%";    
const mobWorksRestScrub = 2;              
const mobWorksRestEase = "power2.out";      

// 🎛️ تنظیماتِ بخش درباره ما
const aboutLabel_Text = "ABOUT US";
const aboutLabel_FontSize_Desk = "clamp(20px, 1.8vw, 30px)";
const aboutLabel_X_Desk = "0px";
const aboutLabel_Y_Desk = "0px";
const aboutLabel_FontSize_Mob = "0px";
const aboutLabel_X_Mob = "0px";
const aboutLabel_Y_Mob = "0px";

const aboutC_Color = "#FFFFFF";
const aboutC_FontSize_Desk = "clamp(180px, 18vw, 380px)";
const aboutC_X_Desk = "clamp(10px, 2.3vw, 45px)";                
const aboutC_Y_Desk = "0px";
const aboutC_FontSize_Mob = "180px";
const aboutC_X_Mob = "-12px";    
const aboutC_Y_Mob = "0px";

const aboutTitle1_FontSize_Desk = "clamp(45px, 6vw, 85px)";
const aboutTitle1_X_Desk = "0px";
const aboutTitle1_Y_Desk = "0px";
const aboutTitle1_FontSize_Mob = "55px"; // 🎯 سایز WE ARE تو موبایل بزرگ شد
const aboutTitle1_X_Mob = "0px"; 
const aboutTitle1_Y_Mob = "0px";

const aboutTitle2_FontSize_Desk = "clamp(50px, 7vw, 100px)";
const aboutTitle2_X_Desk = "0px";
const aboutTitle2_Y_Desk = "0px";
const aboutTitle2_FontSize_Mob = "55px"; // 🎯 سایز STUDIO تو موبایل بزرگ شد
const aboutTitle2_X_Mob = "0px"; 
const aboutTitle2_Y_Mob = "0px";

const stmt1_FontSize_Desk = "clamp(34px, 6vw, 90px)";
const stmt1_MarginLeft_Desk = "clamp(2vw, 8vw, 8vw)"; 
const stmt1_X_Desk = "clamp(-50px, -5.2vw, -20px)";       
const stmt1_Y_Desk = "0px";          
const stmt1_FontSize_Mob = "42px"; // 🎯 برگشت به 42px
const stmt1_MarginLeft_Mob = "0vw"; 
const stmt1_X_Mob = "0px";           
const stmt1_Y_Mob = "0px";           

const stmtPersian_FontSize_Desk = "clamp(11px, 1.2vw, 15px)";
const stmtPersian_X_Desk = "clamp(0px, 1vw, 20px)";   
const stmtPersian_Y_Desk = "-15px";  
const stmtPersian_FontSize_Mob = "13px";
const stmtPersian_X_Mob = "0px";     
const stmtPersian_Y_Mob = "0px";     

const stmt2_FontSize_Desk = "clamp(28px, 5.5vw, 85px)";
const stmt2_X_Desk = "clamp(-50px, -5.2vw, -20px)";        
const stmt2_Y_Desk = "0px";          
const stmt2_FontSize_Mob = "38px"; // 🎯 برگشت به 38px
const stmt2_X_Mob = "0px";           
const stmt2_Y_Mob = "0px";           

const worksBoxesConfig = [
  { aspectRatio: "720/1027" },
  { aspectRatio: "720/460" },
  { aspectRatio: "720/460" },
  { aspectRatio: "900/580" },
  { aspectRatio: "900/580" },
];

const servicesBentoData = [
  { num: "01", fa: "تیزر تبلیغاتی", en: "COMMERCIAL", col: "md:col-span-2", row: "md:row-span-2", video: "/k1.mp4", poster: "/poster1.jpg", desc: "خلق ویدیوهای سینمایی و مفهومی با کیفیت تصویر فوق‌العاده" },
  { num: "02", fa: "تولید محتوا", en: "CONTENT", col: "md:col-span-1", row: "md:row-span-1", video: "/k2.mp4", poster: "/poster2.jpg", desc: "استراتژی محتوای وایرال" }, 
  { num: "03", fa: "معرفی محصول", en: "PRODUCT", col: "md:col-span-1", row: "md:row-span-2", video: "/k3.mp4", poster: "/poster3.jpg", desc: "نمایش ۳ بعدی استودیویی" }, 
  { num: "04", fa: "معرفی خدمات", en: "SERVICE", col: "md:col-span-1", row: "md:row-span-1", video: "/k4.mp4", poster: "/poster4.jpg", desc: "روایت جذاب داستان برند شما" }, 
  { num: "05", fa: "اجرای کمپین", en: "CAMPAIGN", col: "md:col-span-2", row: "md:row-span-1", video: "/k5.mp4", poster: "/poster5.jpg", desc: "طراحی کمپین‌های تبلیغاتی ۳۶۰ درجه برای انفجار فروش" },
  { num: "06", fa: "طراحی سایت", en: "WEB DESIGN", col: "md:col-span-2", row: "md:row-span-1", video: "/k6.mp4", poster: "/poster6.jpg", desc: "توسعه وب‌سایت‌های سفارشی با تعاملات مشابه Awwwards" },
];

function HeroTunerPanel({
  tune, setTune, applyOnDesktop, setApplyOnDesktop, isTabletOrLaptop
}: {
  tune: HeroTune; setTune: React.Dispatch<React.SetStateAction<HeroTune>>; applyOnDesktop: boolean; setApplyOnDesktop: (v: boolean) => void; isTabletOrLaptop: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const update = (key: keyof HeroTune, value: number) => setTune((prev) => ({ ...prev, [key]: value }));
  const handleCopy = async () => {
    const code = tuneToCode(tune, isTabletOrLaptop);
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { console.log(code); alert('کپی نشد.'); }
  };
  return (
    <>
      <button onClick={() => setOpen((o) => !o)} className="hero-tuner__fab" aria-label="پنل تنظیم هیرو">{open ? '✕' : '🎚️'}</button>
      {open && (
        <div className="hero-tuner" dir="rtl" style={{ fontFamily: persianFontFamily }}>
          <div className="hero-tuner__head">
            <span>تنظیم هندسه‌ی هیرو ({isTabletOrLaptop ? 'تبلت' : 'موبایل'})</span>
            <div className="hero-tuner__head-actions">
              <button onClick={() => setTune(isTabletOrLaptop ? TABLET_LAPTOP_HERO_TUNE : MOBILE_HERO_TUNE)}>ریست</button>
              <button onClick={handleCopy}>{copied ? '✓ کپی شد' : 'کپی'}</button>
            </div>
          </div>
          <label className="hero-tuner__check">
            <input type="checkbox" checked={applyOnDesktop} onChange={(e) => setApplyOnDesktop(e.target.checked)} />
            <span>اعمال روی دسکتاپ هم</span>
          </label>
          <div className="hero-tuner__body">
            {TUNER_FIELDS.map(([key, label, min, max, step, unit]) => (
              <div className="hero-tuner__row" key={key}>
                <div className="hero-tuner__label">
                  <span>{label}</span>
                  <input type="number" value={tune[key]} min={min} max={max} step={step} onChange={(e) => update(key, parseFloat(e.target.value) || 0)} />
                  <em>{unit}</em>
                </div>
                <input type="range" min={min} max={max} step={step} value={tune[key]} onChange={(e) => update(key, parseFloat(e.target.value))} />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default function Page() {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  
  const headerRef = useRef<HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactDrawerOpen, setContactDrawerOpen] = useState(false);

  const [windowWidth, setWindowWidth] = useState(1920);
  const isMobile = windowWidth > 0 && windowWidth <= 768;
  const isTabletOrLaptop = windowWidth > 768 && windowWidth <= 1366;
  const [tune, setTune] = useState<HeroTune>(MOBILE_HERO_TUNE);
  const [applyOnDesktop, setApplyOnDesktop] = useState(false);
  const [projectsData, setProjectsData] = useState<any[]>([]);

  const heroRef = useRef<HTMLElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const cRef = useRef<HTMLDivElement>(null);
  const iDotRef = useRef<HTMLDivElement>(null);
  const iBodyRef = useRef<HTMLDivElement>(null);
  const c2Ref = useRef<HTMLDivElement>(null);
  const doRef = useRef<HTMLSpanElement>(null);
  const thingsRef = useRef<HTMLSpanElement>(null);
  const blackOverlayRef = useRef<HTMLDivElement>(null); 

  const bbdoSectionRef = useRef<HTMLElement>(null);
  const mainTextRef = useRef<HTMLDivElement>(null); 
  const textRevealRef = useRef<HTMLDivElement>(null);
  const mobileCstdRef = useRef<HTMLDivElement>(null);

  const bentoSectionRef = useRef<HTMLElement>(null);
  const verticalTextParentRef = useRef<HTMLDivElement>(null);
  const [hoveredBento, setHoveredBento] = useState<number | null>(null);

  const worksSectionRef = useRef<HTMLElement>(null);
  const worksTextRef = useRef<HTMLDivElement>(null);
  const worksBoxesWrapperRef = useRef<HTMLDivElement>(null);
  const footerText1Ref = useRef<HTMLDivElement>(null); 
  const footerText2Ref = useRef<HTMLDivElement>(null); 
  const [hoveredWork, setHoveredWork] = useState<number | null>(null);

  const aboutNewSectionRef = useRef<HTMLElement>(null);

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
    if (mobileMenuOpen || contactDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen, contactDrawerOpen]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`https://cstudio.ir/api/projects`)
        const data = await res.json();
        if (data.success && data.data) {
          setProjectsData(data.data.slice(0, 5)); 
        }
      } catch (err) {
        console.error('خطا در دریافت پروژه‌ها:', err);
      }
    };
    fetchProjects();
  }, []);

  // 🎯 گرفتن دیتای واقعی با مدیریت ایمن
  const getProjectData = (index: number) => {
    const p = projectsData[index];
    
    if (!p) {
      return { title: "", sub: "", video: null, slug: "#" };
    }
    
    const videoUrl = p.videos && p.videos.length > 0 
      ? `https://cstudio.ir${p.videos[0]}`
      : null;

    return {
      title: p.teaserName || "",
      sub: p.companyName || "",
      video: videoUrl,
      slug: p.slug ? `/works/${p.slug}` : '#'
    };
  };

  useEffect(() => {
    if (!mainContainerRef.current) return;

    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        
        if (!heroRef.current || !bbdoSectionRef.current || !aboutNewSectionRef.current) return;

        ScrollTrigger.create({
          trigger: "#cstd-section", start: "top 80px", end: "bottom 80px",
          onEnter: () => gsap.to(headerRef.current, { backgroundColor: solidBlackColor, duration: 0.15, overwrite: "auto" }),
          onLeaveBack: () => gsap.to(headerRef.current, { backgroundColor: "rgba(0,0,0,0)", duration: 0.15, overwrite: "auto" }),
        });

        ScrollTrigger.create({
          trigger: "#services-section", start: "top 80px", end: "bottom top",
          onEnter: () => gsap.to(headerRef.current, { backgroundColor: "#111111", duration: 0.15, overwrite: "auto" }),
          onLeaveBack: () => gsap.to(headerRef.current, { backgroundColor: solidBlackColor, duration: 0.15, overwrite: "auto" }),
        });

        ScrollTrigger.create({
          trigger: "#works-section", start: "top 80px", end: "bottom top",
          onEnter: () => gsap.to(headerRef.current, { backgroundColor: worksBgColor, duration: 0.15, overwrite: "auto" }),
          onLeaveBack: () => gsap.to(headerRef.current, { backgroundColor: "#111111", duration: 0.15, overwrite: "auto" }), 
        });

        ScrollTrigger.create({
          trigger: aboutNewSectionRef.current, start: "top 80px", end: "bottom top",
          onEnter: () => gsap.to(headerRef.current, { backgroundColor: "#111111", duration: 0.15, overwrite: "auto" }), 
          onLeaveBack: () => gsap.to(headerRef.current, { backgroundColor: worksBgColor, duration: 0.15, overwrite: "auto" }), 
        });

        // همون 1.01 به 1 رو جایگزین کن
gsap.fromTo(maskRef.current, { scale: 1.01 }, { scale: 1, duration: 1.4, ease: "power3.out", delay: startDelay - 0.2 });

        const tlHero = gsap.timeline({ delay: startDelay });
        tlHero.to(blackOverlayRef.current, { opacity: 0, duration: 0.4, ease: "power2.out" }, 0)
          .fromTo(cRef.current, { xPercent: -50 }, { xPercent: 0, duration: animDuration, ease: "power2.inOut" }, 0)
          .fromTo(iDotRef.current, { yPercent: -50 }, { yPercent: 0, duration: animDuration, ease: "power2.inOut" }, ">")
          .fromTo(iBodyRef.current, { yPercent: 0 }, { yPercent: -50, duration: animDuration, ease: "power2.inOut" }, "<")
          .fromTo(c2Ref.current, { xPercent: 0 }, { xPercent: -50, duration: animDuration, ease: "power2.inOut" }, ">");

        gsap.fromTo([doRef.current, thingsRef.current], { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power4.out", delay: startDelay + 1 });

        let mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
          if (bbdoSectionRef.current && mainTextRef.current && textRevealRef.current) {
            gsap.set(mainTextRef.current, { left: "50%", xPercent: -50, top: "50%", yPercent: -50 });
            gsap.set(textRevealRef.current, { right: "0%", xPercent: 100, top: "50%", yPercent: -50, opacity: 0 });

            ScrollTrigger.create({
              trigger: bbdoSectionRef.current,
              start: cstdAnimStart, 
              toggleActions: "play none none reverse", 
              animation: gsap.timeline()
                .to(mainTextRef.current, { left: "4vw", xPercent: 0, duration: cstdAnimDuration, ease: "power3.inOut" }, 0) 
                .to(textRevealRef.current, { right: "4vw", xPercent: 0, opacity: 1, duration: cstdAnimDuration, ease: "power3.inOut" }, 0) 
            });
          }
          if (bentoSectionRef.current && verticalTextParentRef.current) {
            gsap.fromTo(verticalTextParentRef.current, { x: -250, opacity: 0 }, { x: 0, opacity: 1, duration: bentoAnimDuration, ease: "power3.out", scrollTrigger: { trigger: bentoSectionRef.current, start: bentoRevealStart, toggleActions: "play none none reverse" } });
            gsap.fromTo(".bento-grid-wrapper", { x: bentoEntranceDistance, opacity: 0 }, { x: 0, opacity: 1, duration: bentoAnimDuration, ease: "power3.out", scrollTrigger: { trigger: bentoSectionRef.current, start: bentoRevealStart, toggleActions: "play none none reverse" } });
          }
          if (worksSectionRef.current && worksTextRef.current && worksBoxesWrapperRef.current && footerText1Ref.current && footerText2Ref.current) {
            gsap.fromTo(worksTextRef.current, { x: worksWordEntranceDist, opacity: 0 }, { x: 0, opacity: 1, duration: worksAnimDuration, ease: worksAnimEase, scrollTrigger: { trigger: worksSectionRef.current, start: worksAnimStart, toggleActions: worksAnimToggleActions } });
            gsap.fromTo(worksBoxesWrapperRef.current, { x: worksBoxesEntranceDist, opacity: 0 }, { x: 0, opacity: 1, duration: worksAnimDuration, ease: worksAnimEase, scrollTrigger: { trigger: worksSectionRef.current, start: worksAnimStart, toggleActions: worksAnimToggleActions } });
            
            const worksFooterScale = Math.min(1, window.innerWidth / 1920);
            gsap.fromTo(footerText1Ref.current, { x: worksFooterText1StartX * worksFooterScale, opacity: 0 }, { x: worksFooterText1EndX * worksFooterScale, opacity: 1, ease: "none", scrollTrigger: { trigger: footerText1Ref.current, start: worksFooterAnimStart, end: worksFooterAnimEnd, scrub: worksFooterScrub } });
            gsap.fromTo(footerText2Ref.current, { x: worksFooterText2StartX * worksFooterScale, opacity: 0 }, { x: worksFooterText2EndX * worksFooterScale, opacity: 1, ease: "none", scrollTrigger: { trigger: footerText2Ref.current, start: worksFooterAnimStart, end: worksFooterAnimEnd, scrub: worksFooterScrub } });
          }
        });

        mm.add("(max-width: 767px)", () => {
          gsap.fromTo(".bbdo-mob-anim",
            { y: 50, opacity: 0 },
            { 
              y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out", 
              scrollTrigger: { trigger: "#cstd-section", start: "top 60%", toggleActions: "play none none reverse" }
            }
          );
          
          gsap.fromTo(".bbdo-mob-text-anim",
            { opacity: 0, y: 30 },
            { 
              opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power2.out", 
              scrollTrigger: { trigger: ".bbdo-mob-text-wrapper", start: "top 80%", toggleActions: "play none none reverse" }
            }
          );

          const srvWrappers = gsap.utils.toArray('.mobile-service-wrapper') as HTMLElement[];
          srvWrappers.forEach((wrapper, i) => {
            const elements = wrapper.querySelector('.mobile-service-elements') as HTMLElement;
            const text = wrapper.querySelector('.mobile-services-text') as HTMLElement;
            const boxWidth = parseInt(mobServiceBoxWidth); 
            
            if (i === 0 && text) {
              const startX = - (window.innerWidth / 2) + mobServiceWallOffset + (boxWidth / 2);
              gsap.set(elements, { xPercent: -50, x: startX });
              gsap.set(text, { x: mobServiceTextOffsetX, y: mobServiceTextOffsetY, yPercent: mobServiceTextYPercent, opacity: 1 });

              const tl = gsap.timeline({ scrollTrigger: { trigger: wrapper, start: mobServiceScrollStart, end: mobServiceScrollEnd, scrub: mobServiceScrub } });
              
              tl.to(elements, { x: 0, xPercent: -50, duration: mobServiceBoxSpeed, ease: mobServiceBoxEase }, 0)
                .to(text, { x: mobServiceTextOffsetX + mobServiceTextMoveX, opacity: mobServiceTextFadeTarget, duration: mobServiceTextSpeed, ease: mobServiceTextEase }, 0); 
                
            } else {
              const startX = - (window.innerWidth / 2) + mobServiceRestStartX + (boxWidth / 2);
              gsap.set(elements, { xPercent: -50, x: startX, opacity: mobServiceRestStartOpacity });

              gsap.to(elements, {
                x: 0, xPercent: -50, opacity: 1, ease: mobServiceRestEase,
                scrollTrigger: { trigger: wrapper, start: mobServiceRestScrollStart, end: mobServiceRestScrollEnd, scrub: mobServiceRestScrub }
              });
            }
          });

          const workWrappers = gsap.utils.toArray('.mobile-work-wrapper') as HTMLElement[];
          workWrappers.forEach((wrapper, i) => {
            const elements = wrapper.querySelector('.mobile-work-elements') as HTMLElement;
            const text = wrapper.querySelector('.mobile-works-text') as HTMLElement;
            const boxWidth = i === 0 ? parseInt(mobWorksBox1Width) : parseInt(mobWorksOtherBoxWidth);
            
            if (i === 0 && text) {
              const startX = (window.innerWidth / 2) - mobWorksWallVisible + (boxWidth / 2);
              gsap.set(elements, { xPercent: -50, x: startX });
              gsap.set(text, { x: mobWorksTextOffsetX, y: mobWorksTextOffsetY, yPercent: mobWorksTextYPercent, opacity: 1 });

              const tl = gsap.timeline({ scrollTrigger: { trigger: wrapper, start: mobWorksScrollStart, end: mobWorksScrollEnd, scrub: mobWorksScrub } });

              tl.to(elements, { x: 0, xPercent: -50, duration: mobWorksBoxSpeed, ease: mobWorksBoxEase }, 0)
                .to(text, { x: mobWorksTextOffsetX + mobWorksTextMoveX, opacity: mobWorksTextFadeTarget, duration: mobWorksTextSpeed, ease: mobWorksTextEase }, 0); 
                
            } else {
              const startXRest = (window.innerWidth / 2) - mobWorksRestWallVisible + (boxWidth / 2);
              gsap.set(elements, { xPercent: -50, x: startXRest, opacity: mobWorksRestStartOpacity });

              gsap.to(elements, {
                x: 0, xPercent: -50, opacity: 1, ease: mobWorksRestEase,
                scrollTrigger: { trigger: wrapper, start: mobWorksRestScrollStart, end: mobWorksRestScrollEnd, scrub: mobWorksRestScrub }
              });
            }
          });

          if (footerText1Ref.current && footerText2Ref.current) {
            gsap.fromTo(footerText1Ref.current, { x: mobWorksFooterText1StartX, opacity: 0 }, { x: mobWorksFooterText1EndX, opacity: 1, ease: "none", scrollTrigger: { trigger: footerText1Ref.current, start: mobWorksFooterAnimStart, end: mobWorksFooterAnimEnd, scrub: mobWorksFooterScrub } });
            gsap.fromTo(footerText2Ref.current, { x: mobWorksFooterText2StartX, opacity: 0 }, { x: mobWorksFooterText2EndX, opacity: 1, ease: "none", scrollTrigger: { trigger: footerText2Ref.current, start: mobWorksFooterAnimStart, end: mobWorksFooterAnimEnd, scrub: mobWorksFooterScrub } });
          }
        });

        if (aboutNewSectionRef.current) {
          // 🎯 اضافه کردن انیمیشنِ مرحله‌ای (stagger) به C و بقیه متون
          gsap.fromTo(gsap.utils.toArray('.about-top-anim', aboutNewSectionRef.current), { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.25, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: ".about-top-wrapper", start: "top 75%" } });
          gsap.fromTo(".about-anim-line", { scaleY: 0 }, { scaleY: 1, duration: 1.4, ease: "power4.inOut", transformOrigin: "top", scrollTrigger: { trigger: ".about-top-wrapper", start: "top 75%" } });
          
          gsap.fromTo(gsap.utils.toArray('.about-stmt-gsap', aboutNewSectionRef.current), { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 1.3, stagger: 0.08, ease: "power4.out", scrollTrigger: { trigger: ".about-statement-wrapper", start: "top 78%" } });
          gsap.fromTo(".about-scrub-line-inner", { scaleX: 0 }, { scaleX: 1, ease: "none", transformOrigin: "left center", scrollTrigger: { trigger: ".about-scrub-wrapper", start: "top 90%", end: "bottom 40%", scrub: 1 } });
          gsap.fromTo(".about-anim-line2", { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power4.inOut", transformOrigin: "right", scrollTrigger: { trigger: ".about-statement-wrapper", start: "top 80%" } });
          gsap.fromTo(".about-anim-img", { opacity: 0, y: 100 }, { opacity: 1, y: 0, duration: 1.5, ease: "power4.out", scrollTrigger: { trigger: ".about-statement-wrapper", start: "top 75%" } });
          gsap.fromTo(".about-anim-img img", { scale: 1.25, filter: "blur(12px)" }, { scale: 1, filter: "blur(0px)", duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: ".about-statement-wrapper", start: "top 75%" } });
          gsap.to(".about-anim-img img", { yPercent: 15, ease: "none", scrollTrigger: { trigger: ".about-anim-img", start: "top bottom", end: "bottom top", scrub: true } });
          gsap.fromTo(".about-footer-anim", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".about-footer-wrapper", start: "top 95%" } });
        }

      }, mainContainerRef); 

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const liveHeroVars = ENABLE_HERO_TUNER && (isMobile || isTabletOrLaptop || applyOnDesktop) ? tuneToVars(tune) : undefined;
  
  const p0 = getProjectData(0);
  const p1 = getProjectData(1);
  const p2 = getProjectData(2);
  const p3 = getProjectData(3);
  const p4 = getProjectData(4);

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

        .burger-line { display: block; height: 2px; width: 100%; background-color: white; transition: all 0.5s cubic-bezier(0.76, 0, 0.24, 1); }
        .burger-line-1.open { transform: translateY(var(--header-burger-trans)) rotate(45deg); }
        .burger-line-2.open { opacity: 0; }
        .burger-line-3.open { transform: translateY(calc(var(--header-burger-trans) * -1)) rotate(-45deg); }

        .hero {
  --mask: ${maskColorHex}; --frame: ${frameBorderWidth}; --sep: ${separatorLineWidth}; --arm-h: ${horizontalLineWidth}; --arm-w: ${cArmWidth}; --bone-w: ${cBoneWidth}; --bone-h: ${cBoneHeight}; --i-gap: ${iGapSize}; --align: ${horizontalAlignment}; --i-body-h: calc(100% - var(--align)); --r: ${innerRoundness}; --side-flex: ${sideColumnFlex}; --i-flex: ${iColumnFlex}; --dot-ovalness: ${iDotOvalness}; --word-size: ${heroWordsFontSize}; --word-inset: ${heroWordsInset}; --word-bottom: ${heroWordsBottom};
  position: sticky; top: -1px; width: 100%; height: calc(100vh + 2px); height: calc(100svh + 2px); overflow: hidden; background: ${globalBgColor}; color: #fff; user-select: none; transform: translateZ(0); z-index: 10;
}

        @media (max-width: 768px) {
          .hero { --frame: clamp(9px, 2.8vw, 14px); --sep: clamp(5px, 1.8vw, 9px); --arm-h: clamp(4px, 1.5vw, 7px); --arm-w: 52%; --bone-w: clamp(9px, 3.2vw, 15px); --bone-h: clamp(46px, 10svh, 90px); --i-gap: clamp(7px, 2.5vw, 12px); --i-body-h: 60svh; --r: clamp(10px, 3.5vw, 18px); --align: 19%; --side-flex: 1.25; --i-flex: 0.5; --word-size: clamp(15px, 4.4vw, 22px); --word-inset: clamp(14px, 4.5vw, 26px); --word-bottom: clamp(12px, 3.5vw, 22px); }
        }
        @media (max-width: 900px) and (orientation: landscape) { .hero { --align: 26%; --bone-h: clamp(38px, 16svh, 80px); } }

        .hero__media { position: absolute; inset: 0; z-index: 0; }
        .hero__media video { width: 100%; height: 100%; object-fit: cover; display: block; transform: scale(1.15); }
        
        @media (max-width: 768px) { .hero__media video { transform: scale(1.45); } }

        .hero__blackout { position: absolute; inset: 0; z-index: 20; background: ${solidBlackColor}; pointer-events: none; }
        .hero__mask { position: absolute; inset: 0; z-index: 10; display: flex; overflow: hidden; pointer-events: none; border: var(--frame) solid var(--mask); }

        .col { position: relative; height: 100%; overflow: hidden; }
        .col--side { flex: var(--side-flex); }
        .col--i { flex: var(--i-flex); }
        
        .sep { flex: 0 0 var(--sep); height: 100%; background: var(--mask); position: relative; z-index: 5; box-shadow: 0 0 1px 1px var(--mask); }
        .fill { position: absolute; inset: 0; pointer-events: none; box-shadow: 0 0 0 2000px var(--mask); }
.cut-top .fill { bottom: -2px; }
.cut-bottom .fill { top: -2px; }
        .slider-x { position: absolute; top: 0; left: 0; width: 200%; height: 100%; display: flex; }
        .slider-y { position: absolute; top: 0; left: 0; width: 100%; height: 200%; display: flex; flex-direction: column; }
        .half-x { width: 50%; height: 100%; position: relative; }
        .half-y { width: 100%; height: 50%; position: relative; }
        .solid { background: var(--mask); position: relative; z-index: 5; box-shadow: 0 0 1px 1px var(--mask); }

        .cut-top { position: absolute; top: 0; left: 0; right: 0; bottom: calc(100% - var(--align) + var(--arm-h) / 2 - 0.5px); overflow: hidden; }
        .cut-bottom { position: absolute; top: calc(var(--align) + var(--arm-h) / 2 - 0.5px); left: 0; right: 0; bottom: 0; overflow: hidden; }

        .arm { position: absolute; right: 0; top: var(--align); transform: translateY(-50%); width: var(--arm-w); height: var(--arm-h); background: var(--mask); z-index: 5; box-shadow: 0 0 1px 1px var(--mask); }
        .bone { position: absolute; top: 50%; left: calc(var(--bone-w) / -2); transform: translateY(-50%); width: var(--bone-w); height: var(--bone-h); background: var(--mask); border-radius: var(--r); z-index: 5; box-shadow: 0 0 1px 1px var(--mask); }

        .i-dot-zone { position: absolute; top: 0; left: 0; width: 100%; height: calc(var(--align) - var(--i-gap)); overflow: hidden; }
        .i-dot { position: absolute; bottom: 0; left: 50%; width: calc(100% - 1px); aspect-ratio: 1 / 1; border-radius: 50%; transform: translateX(-50%) scaleX(var(--dot-ovalness)); box-shadow: 0 0 0 2000px var(--mask); }
        
        .i-gap { position: absolute; left: 0; width: 100%; top: calc(var(--align) - var(--i-gap)); height: var(--i-gap); background: var(--mask); z-index: 5; box-shadow: 0 0 1px 1px var(--mask); }
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

        .hero-tuner__fab { position: fixed; z-index: 9999; right: 12px; bottom: 12px; width: 46px; height: 46px; border-radius: 50%; background: #1b1b1b; color: #fff; border: 1px solid #3a3a3a; font-size: 18px; line-height: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,.6); cursor: pointer; }
        .hero-tuner { position: fixed; z-index: 9998; left: 0; right: 0; bottom: 0; max-height: 62svh; display: flex; flex-direction: column; background: rgba(14,14,14,.96); backdrop-filter: blur(14px); border-top: 1px solid #333; color: #eee; font-size: 12px; padding-bottom: env(safe-area-inset-bottom); }
        @media (min-width: 769px) { .hero-tuner { left: auto; right: 12px; bottom: 70px; width: 330px; border-radius: 12px; border: 1px solid #333; max-height: 76vh; } }
        .hero-tuner__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px; border-bottom: 1px solid #2a2a2a; font-weight: 700; font-size: 13px; }
        .hero-tuner__head-actions { display: flex; gap: 6px; }
        .hero-tuner__head-actions button { background: #262626; border: 1px solid #3a3a3a; color: #ddd; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; }
        .hero-tuner__head-actions button:hover { background: #333; }
        .hero-tuner__check { display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-bottom: 1px solid #2a2a2a; color: #aaa; }
        .hero-tuner__body { overflow-y: auto; padding: 8px 12px 16px; -webkit-overflow-scrolling: touch; }
        .hero-tuner__row { padding: 6px 0; border-bottom: 1px solid #1f1f1f; }
        .hero-tuner__label { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
        .hero-tuner__label > span { flex: 1; color: #ccc; }
        .hero-tuner__label > em { color: #777; font-style: normal; font-size: 10px; min-width: 22px; }
        .hero-tuner__label input[type="number"] { width: 64px; background: #1c1c1c; border: 1px solid #3a3a3a; color: #fff; border-radius: 5px; padding: 2px 6px; font-size: 11px; text-align: center; direction: ltr; }
        .hero-tuner__row input[type="range"] { width: 100%; accent-color: #fff; direction: ltr; }

        .works-footer-container { margin-top: ${mobWorksFooterMarginTop}; margin-bottom: clamp(150px, 20vh, 250px); }
        .works-footer-text { font-size: ${mobWorksFooterFontSize}; letter-spacing: ${mobWorksFooterLetterSpacing}; }
        .works-footer-gap { margin-top: ${mobWorksFooterGap}; }

        @media (min-width: 768px) {
          .works-footer-container { margin-top: ${worksFooterMarginTop}; margin-bottom: 20vh; }
          .works-footer-text { font-size: ${worksFooterFontSize}; letter-spacing: ${worksFooterLetterSpacing}; }
          .works-footer-gap { margin-top: ${worksFooterGap}; }
          .works-boxes-wrap { max-width: clamp(900px, calc(-14.3px + 89.29vw), 1700px); }
        }

        #new-about-section {
          --r-c-fz: var(--c-fz-m); --r-c-x: var(--c-x-m); --r-c-y: var(--c-y-m); --r-t1-fz: var(--t1-fz-m); --r-t1-x: var(--t1-x-m); --r-t1-y: var(--t1-y-m); --r-t2-fz: var(--t2-fz-m); --r-t2-x: var(--t2-x-m); --r-t2-y: var(--t2-y-m); --r-st1-fz: var(--st1-fz-m); --r-st1-ml: var(--st1-ml-m); --r-st1-x: var(--st1-x-m); --r-st1-y: var(--st1-y-m); --r-stp-fz: var(--stp-fz-m); --r-stp-x: var(--stp-x-m); --r-stp-y: var(--stp-y-m); --r-st2-fz: var(--st2-fz-m); --r-st2-x: var(--st2-x-m); --r-st2-y: var(--st2-y-m);
        }

        @media (min-width: 768px) {
          #new-about-section {
            --r-c-fz: var(--c-fz-d); --r-c-x: var(--c-x-d); --r-c-y: var(--c-y-d); --r-t1-fz: var(--t1-fz-d); --r-t1-x: var(--t1-x-d); --r-t1-y: var(--t1-y-d); --r-t2-fz: var(--t2-fz-d); --r-t2-x: var(--t2-x-d); --r-t2-y: var(--t2-y-d); --r-st1-fz: var(--st1-fz-d); --r-st1-ml: var(--st1-ml-d); --r-st1-x: var(--st1-x-d); --r-st1-y: var(--st1-y-d); --r-stp-fz: var(--stp-fz-d); --r-stp-x: var(--stp-x-d); --r-stp-y: var(--stp-y-d); --r-st2-fz: var(--st2-fz-d); --r-st2-x: var(--st2-x-d); --r-st2-y: var(--st2-y-d);
          }
        }

        .about-c-custom { font-size: var(--r-c-fz); transform: translate(var(--r-c-x), var(--r-c-y)); display: inline-block; }
        .about-t1-custom { font-size: var(--r-t1-fz); transform: translate(var(--r-t1-x), var(--r-t1-y)); display: inline-block; }
        .about-t2-custom { font-size: var(--r-t2-fz); transform: translate(var(--r-t2-x), var(--r-t2-y)); display: inline-block; }
        .stmt1-custom { font-size: var(--r-st1-fz); margin-left: var(--r-st1-ml); transform: translate(var(--r-st1-x), var(--r-st1-y)); display: inline-block; }
        .stmt-p-custom { font-size: var(--r-stp-fz); transform: translate(var(--r-stp-x), var(--r-stp-y)); display: inline-block; }
        .stmt2-custom { font-size: var(--r-st2-fz); margin-left: var(--r-st1-ml); transform: translate(var(--r-st2-x), var(--r-st2-y)); display: inline-block; }
      `}</style>

      {ENABLE_HERO_TUNER && (
        <HeroTunerPanel tune={tune} setTune={setTune} applyOnDesktop={applyOnDesktop} setApplyOnDesktop={setApplyOnDesktop} isTabletOrLaptop={isTabletOrLaptop} />
      )}

       <Preloader />

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
          <video autoPlay loop muted playsInline poster="/poster.jpg">
            <source src="/hero.mp4" type="video/mp4" />
          </video>
        </div>
        <div ref={blackOverlayRef} className="hero__blackout" />
        <div ref={maskRef} className="hero__mask">
          <div className="col col--side">
            <div ref={cRef} className="slider-x">
              <div className="half-x"><div className="cut-top"><div className="fill" style={{ borderRadius: "0 var(--r) var(--r) 0" }} /></div><div className="cut-bottom"><div className="fill" style={{ borderRadius: "0 var(--r) 0 0" }} /></div><div className="arm"><div className="bone" /></div></div>
              <div className="half-x solid" />
            </div>
          </div>
          <div className="sep" />
          <div className="col col--i">
            <div className="i-dot-zone"><div ref={iDotRef} className="slider-y"><div className="half-y"><div className="i-dot" /></div><div className="half-y solid" /></div></div>
            <div className="i-gap" />
            <div className="i-body-zone"><div ref={iBodyRef} className="slider-y"><div className="half-y solid" /><div className="half-y" style={{ overflow: "hidden" }}><div className="fill" style={{ borderRadius: "var(--r) var(--r) 0 0" }} /></div></div></div>
          </div>
          <div className="sep" />
          <div className="col col--side">
            <div ref={c2Ref} className="slider-x">
              <div className="half-x solid" />
              <div className="half-x"><div className="cut-top"><div className="fill" style={{ borderRadius: "var(--r) 0 var(--r) 0" }} /></div><div className="cut-bottom"><div className="fill" style={{ borderRadius: "0 var(--r) 0 0" }} /></div><div className="arm"><div className="bone" /></div></div>
            </div>
          </div>
        </div>
        <div className="hero__words">
          <div className="hero__word hero__word--left"><span ref={doRef}>DO</span></div>
          <div className="hero__word hero__word--right"><span ref={thingsRef}>THINGS</span></div>
        </div>
      </section>

      <section id="cstd-section" ref={bbdoSectionRef} className="relative w-full text-white overflow-hidden z-20 transform-gpu -mt-[1px]" style={{ backgroundColor: solidBlackColor }} dir="ltr">
        <div className="hidden md:flex w-full min-h-screen max-w-[1920px] mx-auto items-center relative overflow-hidden">
          <div ref={textRevealRef} className="absolute z-20 flex flex-col gap-8 opacity-0" style={{ fontFamily: persianFontFamily, width: cstdSmallTextWidth }} dir="rtl">
            <p className="leading-relaxed font-light text-zinc-300 text-justify" style={{ fontSize: cstdSmallTextFontSize }}>
              ما برای ساختن برندهایی خلق می‌کنیم که فراموش نشوند. <br /><br />
              ما با کسب‌وکارها و برندهایی همکاری می‌کنیم که به دنبال رشد، تفاوت و تأثیرگذاری هستند. <br /><br />
              برای ما، طراحی فقط زیبایی نیست؛ حل مسئله است. <br /><br />
              باور داریم بهترین نتیجه، حاصل همکاری نزدیک با مشتری است.
            </p>
            <p className="leading-snug font-medium text-white" style={{ fontSize: `calc(${cstdSmallTextFontSize} * 0.8)` }}>آماده خلق یک تجربه ماندگار هستید؟</p>
            <button 
              onClick={() => {
                setMobileMenuOpen(true);
                setTimeout(() => {
                  setContactDrawerOpen(true);
                }, 600); 
              }}
              className="self-start px-9 py-3 rounded-full border border-white text-white font-medium hover:bg-white hover:text-black transition-colors duration-300 tracking-wide text-sm"
            >
              شروع همکاری
            </button>
          </div>

          <div ref={mainTextRef} className="absolute z-10 flex flex-col justify-between whitespace-nowrap uppercase tracking-tighter" style={{ width: blockWidthX, height: blockHeightY, fontSize: cstdMainFontSize, fontWeight: cstdFontWeight, lineHeight: cstdLineHeight, color: cstdFontColor, letterSpacing: '-0.02em', fontFamily: cstdFontFamily }}>
            <div className="flex items-center justify-between w-full" style={{ gap: cstdVideoWordGap }}>
              <div className="flex items-center" style={{ gap: cstdWordGap }}><span className="leading-none">WE</span><span className="leading-none">ARE</span></div>
              <div className="overflow-hidden bg-zinc-800" style={{ width: cstdVideoWidth1, height: cstdVideoHeight, borderRadius: cstdVideoRadius }}><video autoPlay loop muted playsInline poster="/c1-poster.jpg" className="w-full h-full object-cover"><source src="/c1.mp4" type="video/mp4" /></video></div>
            </div>
            <div className="flex items-center justify-between w-full" style={{ gap: cstdVideoWordGap }}>
              <div className="overflow-hidden bg-zinc-800" style={{ width: cstdVideoWidth2, height: cstdVideoHeight, borderRadius: cstdVideoRadius }}><video autoPlay loop muted playsInline poster="/c3-poster.jpg" className="w-full h-full object-cover"><source src="/c3.mp4" type="video/mp4" /></video></div>
              <span className="leading-none">C studio</span>
            </div>
            <div className="flex items-center justify-between w-full" style={{ gap: cstdVideoWordGap }}>
              <span className="leading-none">WE</span>
              <div className="overflow-hidden bg-zinc-800" style={{ width: cstdVideoWidth3, height: cstdVideoHeight, borderRadius: cstdVideoRadius }}><video autoPlay loop muted playsInline poster="/c2-poster.jpg" className="w-full h-full object-cover"><source src="/c2.mp4" type="video/mp4" /></video></div>
              <span className="leading-none">DO</span>
            </div>
            <div className="flex items-center justify-between w-full"><span className="leading-none">BIG</span><span className="leading-none">THINGS</span></div>
          </div>
        </div>

        <div ref={mobileCstdRef} className="flex md:hidden flex-col items-center justify-center w-full min-h-screen px-4 py-24 relative overflow-hidden z-30">
          <div className="flex flex-col items-center w-full uppercase tracking-tighter" style={{ fontSize: mobCstdMainFontSize, fontWeight: cstdFontWeight, lineHeight: "1.15", color: cstdFontColor, letterSpacing: '-0.02em', fontFamily: cstdFontFamily }}>
            <div className="flex justify-center items-center gap-3 w-full whitespace-nowrap">
              <span>WE ARE</span>
              <div className="overflow-hidden bg-zinc-800" style={{ width: mobCstdVideoWidth1, height: mobCstdVideoHeight, borderRadius: mobCstdVideoRadius }}><video autoPlay loop muted playsInline poster="/c1-poster.jpg" className="w-full h-full object-cover"><source src="/c1.mp4" type="video/mp4" /></video></div>
            </div>
            <div className="flex justify-center items-center gap-3 w-full whitespace-nowrap mt-1">
              <div className="overflow-hidden bg-zinc-800" style={{ width: mobCstdVideoWidth2, height: mobCstdVideoHeight, borderRadius: mobCstdVideoRadius }}><video autoPlay loop muted playsInline poster="/c3-poster.jpg" className="w-full h-full object-cover"><source src="/c3.mp4" type="video/mp4" /></video></div>
              <span>C STUDIO</span>
            </div>
            <div className="flex justify-center items-center gap-3 w-full whitespace-nowrap mt-1">
              <div className="overflow-hidden bg-zinc-800" style={{ width: mobCstdVideoWidth3, height: mobCstdVideoHeight, borderRadius: mobCstdVideoRadius }}><video autoPlay loop muted playsInline poster="/c2-poster.jpg" className="w-full h-full object-cover"><source src="/c2.mp4" type="video/mp4" /></video></div>
              <span>WE DO BIG</span>
            </div>
            <div className="flex justify-center items-center w-full whitespace-nowrap mt-1"><span>THINGS</span></div>
          </div>
          
          <div className="mob-cstd-drawer-anim flex flex-col items-center gap-5 mt-16 w-full max-w-[450px]" style={{ fontFamily: persianFontFamily }} dir="rtl">
            <p className="leading-relaxed font-light text-zinc-300 text-center text-[15px] px-2">ما برای ساختن برندهایی خلق می‌کنیم که فراموش نشوند. ما با کسب‌وکارها و برندهایی همکاری می‌کنیم که به دنبال رشد، تفاوت و تأثیرگذاری هستند.</p>
            <p className="leading-relaxed font-light text-zinc-300 text-center text-[15px] px-2">برای ما، طراحی فقط زیبایی نیست؛ حل مسئله است. باور داریم بهترین نتیجه، حاصل همکاری نزدیک با مشتری است.</p>
            <p className="text-[16px] leading-snug font-medium text-white text-center mt-3">آماده خلق یک تجربه ماندگار هستید؟</p>
            <button 
              onClick={() => {
                setMobileMenuOpen(true);
                setTimeout(() => {
                  setContactDrawerOpen(true);
                }, 600); 
              }}
              className="w-[85%] max-w-[320px] py-4 rounded-full border border-white text-white font-bold hover:bg-white hover:text-black transition-colors duration-300 tracking-wide text-[16px] mt-4 shadow-lg shadow-black/20"
            >
              شروع همکاری
            </button>
          </div>
        </div>
      </section>

      <section id="services-section" ref={bentoSectionRef} className="relative w-full text-white overflow-hidden z-20 transform-gpu" dir="rtl" style={{ backgroundColor: "#111111", fontFamily: persianFontFamily }}>
        <div className="hidden md:flex flex-col items-center justify-center w-full min-h-screen" style={{ paddingTop: bentoPaddingY, paddingBottom: bentoPaddingY }}>
          <div ref={verticalTextParentRef} className="absolute pointer-events-none z-0 opacity-0" style={{ left: servicesTitleOffsetX }}>
            <span className="block font-black tracking-widest uppercase select-none drop-shadow-lg" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: '#d1d1d1', fontSize: servicesTextFontSize, fontFamily: englishFontFamily }}>SERVICES</span>
          </div>
          <div className="bento-grid-wrapper relative z-10 mx-auto px-6 md:pr-12 w-full opacity-0" style={{ transform: `scale(${servicesGridScale})`, paddingLeft: 'clamp(64px, 6.25vw, 120px)', maxWidth: 'min(1600px, 82vw)' }}>
            <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: servicesGridGap, gridAutoRows: servicesBoxBaseHeight }}>
              {servicesBentoData.map((item, idx) => (
                <div key={idx} onMouseEnter={() => setHoveredBento(idx)} onMouseLeave={() => setHoveredBento(null)} className={`relative group overflow-hidden rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/10 transition-colors duration-500 hover:border-white/20 cursor-pointer ${item.col} ${item.row}`}>
                  <video src={item.video} poster={item.poster} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" style={{ transform: hoveredBento === idx ? `scale(${bentoVideoHoverScale})` : 'scale(1)', transition: 'transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)', opacity: 0.8 }} />
                  <div className="absolute inset-0 transition-all duration-500" style={{ backgroundColor: hoveredBento === idx ? `rgba(0,0,0,${servicesOverlayHoverOpacity})` : `rgba(0,0,0,${servicesOverlayOpacity})`, backdropFilter: hoveredBento === idx ? 'blur(0px)' : 'blur(2px)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                  <div className="relative z-10 flex flex-col justify-between h-full p-6 md:p-8 pointer-events-none">
                    <div className="flex justify-between items-start w-full"><span className="text-xl md:text-2xl text-white/50 group-hover:text-white transition-colors duration-500" dir="ltr" style={{ fontFamily: englishFontFamily }}>{item.num}</span></div>
                    <div className="relative w-full overflow-hidden pt-8">
                      <h3 className="text-2xl md:text-3xl font-bold text-white/90 group-hover:text-white transform group-hover:-translate-y-8 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]">{item.fa}</h3>
                      <p className="absolute left-0 right-0 bottom-0 text-zinc-300 font-light text-sm md:text-base opacity-0 translate-y-8 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex md:hidden flex-col w-full relative overflow-hidden py-[15vh]" style={{ gap: mobServiceGapY }} dir="ltr">
          {servicesBentoData.map((item, idx) => (
            <div key={`mob-srv-${idx}`} className="mobile-service-wrapper relative w-full flex items-center" style={{ height: mobServiceBoxHeight }}>
              <div className="mobile-service-elements absolute top-0 left-1/2 z-10 flex flex-col items-center" style={{ width: mobServiceBoxWidth }}>
                {idx === 0 && (
                  <div className="mobile-services-text absolute z-20 select-none whitespace-nowrap opacity-0" style={{ left: '100%', top: mobServiceTextTop, marginLeft: mobServiceTextGap }} >
                    <span className="block font-black uppercase select-none drop-shadow-2xl" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: mobServiceTextColor, fontSize: mobServiceTextFontSize, letterSpacing: mobServiceTextLetterSpacing, fontFamily: englishFontFamily }}>{mobServiceTextWord}</span>
                  </div>
                )}
                <div className="w-full relative overflow-hidden rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl" style={{ height: mobServiceBoxHeight }}>
                  <video src={item.video} poster={item.poster} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <div className="absolute inset-0 bg-black/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80" />
                  <div className="relative z-10 flex flex-col justify-between h-full p-8 pointer-events-none" dir="rtl">
                    <div className="flex justify-between items-start w-full"><span className="text-xl text-white font-mono" dir="ltr">{item.num}</span></div>
                    <div className="w-full"><h3 className="text-2xl font-bold text-white mb-2">{item.fa}</h3><p className="text-zinc-300 font-light text-sm leading-relaxed">{item.desc}</p></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="works-section" ref={worksSectionRef} className="relative w-full min-h-screen text-white overflow-hidden z-20 flex flex-col items-center" dir="rtl" style={{ backgroundColor: worksBgColor, fontFamily: persianFontFamily }}>
        <div className="works-desktop-shell hidden md:flex relative w-full items-start justify-center" style={{ paddingTop: worksPaddingY, paddingBottom: worksPaddingY, paddingLeft: 'clamp(40px, 5vw, 100px)', paddingRight: 'clamp(40px, 5vw, 100px)' }}>
          <div className="works-boxes-wrap relative flex-1 flex flex-col w-full" style={{ maxWidth: '1700px' }}>
              <div ref={worksTextRef} className="absolute top-0 right-0 flex items-start select-none z-10 opacity-0" style={{ width: worksWordSize, transform: `translate(${worksTitleOffsetX}, ${worksTitleOffsetY})` }}>
                  <span className="block font-black uppercase tracking-widest drop-shadow-2xl" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: worksWordColor, fontSize: worksWordSize, lineHeight: '1', fontFamily: englishFontFamily }}>{worksWordText}</span>
              </div>
              <div ref={worksBoxesWrapperRef} className="flex flex-col w-full opacity-0 origin-top" style={{ transform: `scale(${worksBoxGlobalScale})` }}>
                  <div className="flex w-full justify-end">
                      <div className="flex flex-row" style={{ width: `calc(100% - ${worksWordSize} - ${worksWordGap})`, gap: worksColGap }}>
                          
                          {/* 🌟 کارت ۱ دسکتاپ */}
                          <Link href={p0.slug} className="flex-1 flex flex-col relative group" onMouseEnter={() => setHoveredWork(1)} onMouseLeave={() => setHoveredWork(null)}>
                              <div className="bg-zinc-800 rounded-[24px] overflow-hidden relative w-full" style={{ aspectRatio: worksBoxesConfig[0].aspectRatio }}>
                                  {p0.video ? (
                                    <video 
                                      src={`${p0.video}#t=0.1`} 
                                      muted 
                                      playsInline 
                                      className="absolute inset-0 w-full h-full object-cover" 
                                      style={{ transition: `transform ${worksImageHoverSpeed} cubic-bezier(0.25, 1, 0.5, 1)`, transform: hoveredWork === 1 ? `scale(${worksImageHoverScale})` : 'scale(1)' }} 
                                    />
                                  ) : (
                                    <div className="absolute inset-0 w-full h-full bg-zinc-900" />
                                  )}
                                  <div className="absolute inset-0 transition-colors duration-500 pointer-events-none" style={{ backgroundColor: hoveredWork === 1 ? `rgba(0,0,0,${worksOverlayHoverOpacity})` : `rgba(0,0,0,${worksOverlayOpacity})` }} />
                              </div>
                              <div className="flex items-center gap-[clamp(10px,1.25vw,24px)]" style={{ marginTop: worksTextMarginTop }}>
                                  <h4 className="font-black uppercase tracking-widest leading-none" style={{ fontSize: worksTitleFontSize }}>{p0.title}</h4>
                                  <div className="h-[2px] w-[clamp(28px,2.6vw,50px)] bg-zinc-600 group-hover:bg-white transition-colors" />
                                  <span className="font-light text-zinc-400" style={{ fontSize: worksSubFontSize }}>{p0.sub}</span>
                              </div>
                          </Link>

                          <div className="flex-1 flex flex-col h-full" style={{ gap: worksRowGap }}>
                              
                              {/* 🌟 کارت ۲ دسکتاپ */}
                              <Link href={p1.slug} className="flex flex-col relative group" onMouseEnter={() => setHoveredWork(2)} onMouseLeave={() => setHoveredWork(null)}>
                                  <div className="bg-zinc-800 rounded-[24px] overflow-hidden relative w-full" style={{ aspectRatio: worksBoxesConfig[1].aspectRatio }}>
                                      {p1.video ? (
                                        <video 
                                          src={`${p1.video}#t=0.1`} 
                                          muted 
                                          playsInline 
                                          className="absolute inset-0 w-full h-full object-cover" 
                                          style={{ transition: `transform ${worksImageHoverSpeed} cubic-bezier(0.25, 1, 0.5, 1)`, transform: hoveredWork === 2 ? `scale(${worksImageHoverScale})` : 'scale(1)' }} 
                                        />
                                      ) : (
                                        <div className="absolute inset-0 w-full h-full bg-zinc-900" />
                                      )}
                                      <div className="absolute inset-0 transition-colors duration-500 pointer-events-none" style={{ backgroundColor: hoveredWork === 2 ? `rgba(0,0,0,${worksOverlayHoverOpacity})` : `rgba(0,0,0,${worksOverlayOpacity})` }} />
                                  </div>
                                  <div className="flex items-center gap-[clamp(10px,1.25vw,24px)]" style={{ marginTop: worksTextMarginTop }}>
                                      <h4 className="font-black uppercase tracking-widest leading-none" style={{ fontSize: worksTitleFontSize }}>{p1.title}</h4>
                                      <div className="h-[2px] w-[clamp(28px,2.6vw,50px)] bg-zinc-600 group-hover:bg-white transition-colors" />
                                      <span className="font-light text-zinc-400" style={{ fontSize: worksSubFontSize }}>{p1.sub}</span>
                                  </div>
                              </Link>
                              
                              {/* 🌟 کارت ۳ دسکتاپ */}
                              <Link href={p2.slug} className="flex flex-col relative group" onMouseEnter={() => setHoveredWork(3)} onMouseLeave={() => setHoveredWork(null)}>
                                  <div className="bg-zinc-800 rounded-[24px] overflow-hidden relative w-full" style={{ aspectRatio: worksBoxesConfig[2].aspectRatio }}>
                                      {p2.video ? (
                                        <video 
                                          src={`${p2.video}#t=0.1`} 
                                          muted 
                                          playsInline 
                                          className="absolute inset-0 w-full h-full object-cover" 
                                          style={{ transition: `transform ${worksImageHoverSpeed} cubic-bezier(0.25, 1, 0.5, 1)`, transform: hoveredWork === 3 ? `scale(${worksImageHoverScale})` : 'scale(1)' }} 
                                        />
                                      ) : (
                                        <div className="absolute inset-0 w-full h-full bg-zinc-900" />
                                      )}
                                      <div className="absolute inset-0 transition-colors duration-500 pointer-events-none" style={{ backgroundColor: hoveredWork === 3 ? `rgba(0,0,0,${worksOverlayHoverOpacity})` : `rgba(0,0,0,${worksOverlayOpacity})` }} />
                                  </div>
                                  <div className="flex items-center gap-[clamp(10px,1.25vw,24px)]" style={{ marginTop: worksTextMarginTop }}>
                                      <h4 className="font-black uppercase tracking-widest leading-none" style={{ fontSize: worksTitleFontSize }}>{p2.title}</h4>
                                      <div className="h-[2px] w-[clamp(28px,2.6vw,50px)] bg-zinc-600 group-hover:bg-white transition-colors" />
                                      <span className="font-light text-zinc-400" style={{ fontSize: worksSubFontSize }}>{p2.sub}</span>
                                  </div>
                              </Link>

                          </div>
                      </div>
                  </div>

                  <div className="flex flex-row w-full" style={{ gap: worksColGap, marginTop: worksRowGap }}>
                      
                      {/* 🌟 کارت ۴ دسکتاپ */}
                      <Link href={p3.slug} className="flex-1 flex flex-col relative group" onMouseEnter={() => setHoveredWork(4)} onMouseLeave={() => setHoveredWork(null)}>
                          <div className="bg-zinc-800 rounded-[24px] overflow-hidden relative w-full" style={{ aspectRatio: worksBoxesConfig[3].aspectRatio }}>
                              {p3.video ? (
                                <video 
                                  src={`${p3.video}#t=0.1`} 
                                  muted 
                                  playsInline 
                                  className="absolute inset-0 w-full h-full object-cover" 
                                  style={{ transition: `transform ${worksImageHoverSpeed} cubic-bezier(0.25, 1, 0.5, 1)`, transform: hoveredWork === 4 ? `scale(${worksImageHoverScale})` : 'scale(1)' }} 
                                />
                              ) : (
                                <div className="absolute inset-0 w-full h-full bg-zinc-900" />
                              )}
                              <div className="absolute inset-0 transition-colors duration-500 pointer-events-none" style={{ backgroundColor: hoveredWork === 4 ? `rgba(0,0,0,${worksOverlayHoverOpacity})` : `rgba(0,0,0,${worksOverlayOpacity})` }} />
                          </div>
                          <div className="flex items-center gap-[clamp(10px,1.25vw,24px)]" style={{ marginTop: worksTextMarginTop }}>
                              <h4 className="font-black uppercase tracking-widest leading-none" style={{ fontSize: worksTitleFontSize }}>{p3.title}</h4>
                              <div className="h-[2px] w-[clamp(28px,2.6vw,50px)] bg-zinc-600 group-hover:bg-white transition-colors" />
                              <span className="font-light text-zinc-400" style={{ fontSize: worksSubFontSize }}>{p3.sub}</span>
                          </div>
                      </Link>

                      {/* 🌟 کارت ۵ دسکتاپ */}
                      <Link href={p4.slug} className="flex-1 flex flex-col relative group" onMouseEnter={() => setHoveredWork(5)} onMouseLeave={() => setHoveredWork(null)}>
                          <div className="bg-zinc-800 rounded-[24px] overflow-hidden relative w-full" style={{ aspectRatio: worksBoxesConfig[4].aspectRatio }}>
                              {p4.video ? (
                                <video 
                                  src={`${p4.video}#t=0.1`} 
                                  muted 
                                  playsInline 
                                  className="absolute inset-0 w-full h-full object-cover" 
                                  style={{ transition: `transform ${worksImageHoverSpeed} cubic-bezier(0.25, 1, 0.5, 1)`, transform: hoveredWork === 5 ? `scale(${worksImageHoverScale})` : 'scale(1)' }} 
                                />
                              ) : (
                                <div className="absolute inset-0 w-full h-full bg-zinc-900" />
                              )}
                              <div className="absolute inset-0 transition-colors duration-500 pointer-events-none" style={{ backgroundColor: hoveredWork === 5 ? `rgba(0,0,0,${worksOverlayHoverOpacity})` : `rgba(0,0,0,${worksOverlayOpacity})` }} />
                          </div>
                          <div className="flex items-center gap-[clamp(10px,1.25vw,24px)]" style={{ marginTop: worksTextMarginTop }}>
                              <h4 className="font-black uppercase tracking-widest leading-none" style={{ fontSize: worksTitleFontSize }}>{p4.title}</h4>
                              <div className="h-[2px] w-[clamp(28px,2.6vw,50px)] bg-zinc-600 group-hover:bg-white transition-colors" />
                              <span className="font-light text-zinc-400" style={{ fontSize: worksSubFontSize }}>{p4.sub}</span>
                          </div>
                      </Link>

                  </div>
              </div>
          </div>
        </div>

        {/* 🌟 بخش موبایل */}
        <div className="flex md:hidden flex-col w-full relative pt-[15vh] pb-0" style={{ gap: mobWorksGapY }} dir="ltr">
          {[0, 1, 2, 3, 4].map((idx) => {
            const p = getProjectData(idx);

            return (
              <div key={`mob-work-${idx}`} className="mobile-work-wrapper relative w-full" style={{ height: `calc(${idx === 0 ? mobWorksBox1Height : mobWorksOtherBoxHeight} + 100px)` }}>
                <Link href={p.slug} className="mobile-work-elements absolute left-1/2 top-0 z-10 flex flex-col items-center group" style={{ width: idx === 0 ? mobWorksBox1Width : mobWorksOtherBoxWidth }}>
                  {idx === 0 && (
                    <div className="mobile-works-text absolute z-20 select-none whitespace-nowrap opacity-0" style={{ right: '100%', top: mobWorksTextTop, marginRight: mobWorksTextGap }} >
                      <span className="block font-black uppercase select-none drop-shadow-2xl" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', color: mobWorksTextColor, fontSize: mobWorksTextFontSize, letterSpacing: mobWorksTextLetterSpacing, fontFamily: englishFontFamily }}>{mobWorksTextWord}</span>
                    </div>
                  )}
                  <div className="w-full relative overflow-hidden rounded-[24px] bg-zinc-800 shadow-2xl" style={{ height: idx === 0 ? mobWorksBox1Height : mobWorksOtherBoxHeight }}>
                    {p.video ? (
                      <video 
                        src={`${p.video}#t=0.1`} 
                        muted 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.05]" 
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full bg-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-80" />
                  </div>
                  <div className="flex items-center gap-4 mt-6 w-full px-2" dir="rtl">
                    <h4 className="font-black uppercase tracking-widest leading-none text-white text-[18px]">{p.title}</h4>
                    <div className="h-[2px] w-[30px] bg-zinc-600 group-hover:bg-white transition-colors" />
                    <span className="font-light text-zinc-400 text-[14px]">{p.sub}</span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <div className="w-full flex flex-col items-center relative z-10" style={{ marginTop: worksBtnMarginTop }}>
          <div style={{ transform: `translate(${worksBtnOffsetX}, ${worksBtnOffsetY})` }}>
            <Link href="/works" className="flex items-center justify-center rounded-full border border-white text-white transition-all duration-300 hover:bg-white hover:text-black font-medium tracking-widest cursor-pointer" style={{ width: worksBtnWidth, height: worksBtnHeight, fontSize: worksBtnFontSize }}>
              {worksBtnText}
            </Link>
          </div>
        </div>

        <div className="works-footer-container w-full flex flex-col items-center overflow-hidden relative z-10">
          <div ref={footerText1Ref} className="works-footer-text font-black whitespace-nowrap uppercase leading-none text-white opacity-0 text-center select-none" style={{ fontFamily: englishFontFamily }}>{worksFooterText}</div>
          <div ref={footerText2Ref} className="works-footer-text works-footer-gap font-black whitespace-nowrap uppercase leading-none opacity-0 text-center select-none" style={{ fontFamily: englishFontFamily, color: "#000000", mixBlendMode: "screen", textShadow: `-2px -2px 0 ${worksFooterStrokeColor}, 2px -2px 0 ${worksFooterStrokeColor}, -2px  2px 0 ${worksFooterStrokeColor}, 2px  2px 0 ${worksFooterStrokeColor}, 0px -2px 0 ${worksFooterStrokeColor}, 0px  2px 0 ${worksFooterStrokeColor}, -2px  0px 0 ${worksFooterStrokeColor}, 2px  0px 0 ${worksFooterStrokeColor}` }}>{worksFooterText}</div>
        </div>
      </section>

      <section id="new-about-section" ref={aboutNewSectionRef} dir="ltr" className="w-full overflow-hidden relative z-20" style={{ 
          backgroundColor: "#111111",
          '--c-fz-d': aboutC_FontSize_Desk, '--c-x-d': aboutC_X_Desk, '--c-y-d': aboutC_Y_Desk,
          '--c-fz-m': aboutC_FontSize_Mob, '--c-x-m': aboutC_X_Mob, '--c-y-m': aboutC_Y_Mob,
          '--t1-fz-d': aboutTitle1_FontSize_Desk, '--t1-x-d': aboutTitle1_X_Desk, '--t1-y-d': aboutTitle1_Y_Desk,
          '--t1-fz-m': aboutTitle1_FontSize_Mob, '--t1-x-m': aboutTitle1_X_Mob, '--t1-y-m': aboutTitle1_Y_Mob,
          '--t2-fz-d': aboutTitle2_FontSize_Desk, '--t2-x-d': aboutTitle2_X_Desk, '--t2-y-d': aboutTitle2_Y_Desk,
          '--t2-fz-m': aboutTitle2_FontSize_Mob, '--t2-x-m': aboutTitle2_X_Mob, '--t2-y-m': aboutTitle2_Y_Mob,
          '--st1-fz-d': stmt1_FontSize_Desk, '--st1-ml-d': stmt1_MarginLeft_Desk, '--st1-x-d': stmt1_X_Desk, '--st1-y-d': stmt1_Y_Desk,
          '--st1-fz-m': stmt1_FontSize_Mob, '--st1-ml-m': stmt1_MarginLeft_Mob, '--st1-x-m': stmt1_X_Mob, '--st1-y-m': stmt1_Y_Mob,
          '--stp-fz-d': stmtPersian_FontSize_Desk, '--stp-x-d': stmtPersian_X_Desk, '--stp-y-d': stmtPersian_Y_Desk,
          '--stp-fz-m': stmtPersian_FontSize_Mob, '--stp-x-m': stmtPersian_X_Mob, '--stp-y-m': stmtPersian_Y_Mob,
          '--st2-fz-d': stmt2_FontSize_Desk, '--st2-x-d': stmt2_X_Desk, '--st2-y-d': stmt2_Y_Desk,
          '--st2-fz-m': stmt2_FontSize_Mob, '--st2-x-m': stmt2_X_Mob, '--st2-y-m': stmt2_Y_Mob,
        } as React.CSSProperties} >
        <div className="about-top-wrapper relative min-h-[690px] px-[5vw] py-16">
          
          <div className="absolute left-[5vw] top-[10.5vw] hidden lg:block">
            <div className="about-anim-line ml-1 h-[90px] w-px bg-zinc-600" />
            <div className="about-top-anim mt-7 -ml-[5px] [writing-mode:vertical-rl] rotate-180 text-[10px] tracking-[0.3em] text-zinc-500 font-medium" style={{ fontFamily: englishFontFamily }}>CREATIVE STUDIO</div>
          </div>

          <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-8 md:gap-12 pt-[80px] lg:grid-cols-[45%_55%]">
            <div className="flex flex-col items-center md:items-start w-full text-center md:text-left gap-2 md:gap-4">
              <h2 className="about-top-anim font-bold tracking-[0.22em] leading-none text-[#f2f2f2]" style={{ fontFamily: englishFontFamily }}><span className="about-t1-custom">WE ARE</span></h2>
              <div className="w-full flex justify-center md:justify-start"><div className="about-top-anim about-c-custom font-black leading-[0.72] tracking-[-0.1em]" style={{ fontFamily: cstdFontFamily, color: aboutC_Color }}>C</div></div>
              <h3 className="about-top-anim font-bold leading-none tracking-[0.1em] text-[#f2f2f2]" style={{ fontFamily: englishFontFamily }}><span className="about-t2-custom">STUDIO</span></h3>
            </div>
            
            <div dir="rtl" className="flex flex-col justify-start mt-10 lg:mt-0 text-right">
              <div className="about-top-anim w-full mb-4 md:mb-8" dir="ltr" style={{ textAlign: 'right' }}>
                <span className="tracking-[0.3em] text-zinc-400 font-medium text-[clamp(28px,3.5vw,50px)]" style={{ fontFamily: englishFontFamily }}>
                  ABOUT US
                </span>
              </div>
              
              <h3 className="about-top-anim text-[26px] font-bold leading-[1.8] md:text-[clamp(24px,1.9vw,32px)] text-[#f2f2f2]" style={{ fontFamily: persianFontFamily }}>ما یک استودیوی خلاق هستیم.</h3>
              <p className="about-top-anim mt-5 max-w-[550px] text-[16px] leading-[2.3] text-zinc-400 md:text-[clamp(15px,1.2vw,18px)]" style={{ fontFamily: persianFontFamily }}>
                استراتژی، طراحی و تکنولوژی را در کنار هم قرار می‌دهیم تا برندها را به تجربه‌هایی ماندگار و تأثیرگذار تبدیل کنیم.<br />
                ما به جزئیات فکر می‌کنیم، به ایده‌ها جان می‌دهیم و برای خلق چیزی فراتر از انتظار تلاش می‌کنیم.
              </p>
              <a href="/about" className="about-top-anim group mt-10 flex w-fit items-center gap-5 text-[15px] md:text-[clamp(14px,1.05vw,16px)] text-white font-bold tracking-wide" style={{ fontFamily: persianFontFamily }}>
                <span>درباره ما بیشتر بدانید</span><span dir="ltr" className="text-[28px] md:text-[clamp(24px,1.9vw,32px)] leading-none transition-transform duration-300 group-hover:translate-x-2" style={{ fontFamily: englishFontFamily }}>→</span>
              </a>
            </div>
          </div>
        </div>

        <div className="about-scrub-wrapper w-full px-[5vw] py-8">
          <div className="h-[2px] md:h-[3px] w-full bg-zinc-800 relative overflow-hidden rounded-full"><div className="about-scrub-line-inner absolute inset-0 bg-zinc-400 origin-left" /></div>
        </div>

        <div className="about-statement-wrapper relative min-h-[auto] px-[5vw] py-[80px] pb-[120px] border-b border-[#292929]">
          <div className="flex flex-col lg:flex-row justify-between items-end gap-12 lg:gap-8">
            <div className="flex flex-col w-full lg:w-[65%]">
              <div className="stmt1-custom">
                <h2 className="about-stmt-gsap font-bold leading-[1.12] tracking-[-0.04em] text-[#f2f2f2]" style={{ fontFamily: englishFontFamily }}>WE DON’T JUST<br />MAKE THINGS<br />LOOK GOOD.</h2>
              </div>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mt-12 md:mt-20 gap-8 md:gap-0 w-full">
                
                <div className="stmt2-custom">
                  <div className="about-stmt-gsap font-bold leading-[1.15] tracking-[-0.03em] text-zinc-500 text-left" style={{ fontFamily: englishFontFamily }}>
                    WE MAKE<br />MATTER
                  </div>
                </div>

                <div dir="rtl" className="w-full md:w-[220px] stmt-p-custom text-right md:text-right">
                  <div className="about-anim-line2 mb-5 h-[2px] w-[130px] bg-zinc-500" />
                  <p className="about-stmt-gsap leading-[2.2] text-zinc-400" style={{ fontFamily: persianFontFamily }}>
                    ما فقط ظاهر زیبا نمی‌سازیم.<br />ما باعث ارزشمند شدن آن‌ها می‌شویم.
                  </p>
                </div>

              </div>

            </div>
            <div className="about-anim-img w-full sm:w-[80%] md:w-[60%] lg:w-[32vw] max-w-[550px] h-[400px] lg:h-[480px] overflow-hidden self-center lg:self-end mt-12 lg:mt-0 relative rounded-md cursor-pointer group">
              <div className="absolute inset-0 w-full h-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]">
                <img src="/AB.jpg" alt="C Studio" className="absolute inset-0 h-full w-full object-cover scale-110" style={{ filter: 'grayscale(100%)' }} />
              </div>
            </div>
          </div>
        </div>

        <footer className="about-footer-wrapper flex flex-col md:flex-row min-h-[100px] items-center justify-between px-[4vw] py-10 gap-8 md:gap-0">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
            <div className="about-footer-anim text-[18px] md:text-[22px] font-bold tracking-[0.38em] text-[#f2f2f2]" style={{ fontFamily: englishFontFamily }}>C STUDIO</div>
            <div className="about-footer-anim hidden text-[11px] md:text-[12px] tracking-[0.12em] text-zinc-500 md:block font-medium" style={{ fontFamily: englishFontFamily }}>© 2026 C STUDIO. ALL RIGHTS RESERVED.</div>
          </div>
          <nav className="about-footer-anim flex flex-wrap justify-center gap-8 md:gap-12 text-[11px] md:text-[13px] tracking-[0.15em] text-zinc-400 font-medium" style={{ fontFamily: englishFontFamily }}>
            <Link href="/works" className="hover:text-white transition-colors">WORK</Link>
            <Link href="/auth" className="hover:text-white transition-colors">DASHBOARD</Link>
            <Link href="/about" className="hover:text-white transition-colors">ABOUT US</Link>
            <button 
              onClick={() => setContactDrawerOpen(true)} 
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
          <div className="about-footer-anim text-[10px] tracking-[0.12em] text-zinc-500 md:hidden mt-4 font-medium text-center" style={{ fontFamily: englishFontFamily }}>© 2026 C STUDIO. ALL RIGHTS RESERVED.</div>
        </footer>
      </section>

      <ContactDrawer 
        isOpen={contactDrawerOpen} 
        onClose={() => setContactDrawerOpen(false)} 
        onOpenMenu={() => setMobileMenuOpen(true)} 
      />

    </div>
  );
}