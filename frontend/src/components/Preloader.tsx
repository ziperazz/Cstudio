"use client";

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';

// 🎛️===================================================================🎛️
//          پنل تنظیمات و داشبورد ویدیوی پرلودر (Blur & Transparent Video)
// 🎛️===================================================================🎛️

// 🎨 تنظیمات پس‌زمینه (حالت شیشه‌ای خالص)
const preloaderBgColor = "rgba(0, 0, 0, 0.1)"; 
const preloaderBlurIntensity = "blur(40px)";   

// 🎚️ تنظیمات ویدیو و سرعت پخش آن
const videoWidth = "480px";       
const videoScale = 4.5;           
const videoBlendMode = "screen";  
const videoPlaybackRate = 0.8;    // 🎯 سرعت پخش ویدیو

// ⏱️ تنظیمات زمان‌بندی
const initialDelay = 1;           // ⏳ ۱ ثانیه مکث اولیه قبل از شروع پخش ویدیو
const exitDuration = 1.2;         // ⏱️ مدت‌زمان کنار رفتن پرده
const homeExtraDelay = 1;         // ⏳ مکث پس از اتمام ویدیو در هوم‌پیج

// 📱 تنظیمات موبایل
const mobileVideoWidth = "100vw";  
const mobileVideoScale = 1.8;      

// ↔️ تنظیم جابجایی افقی ویدیو
const videoOffsetX = 17;           

export default function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!preloaderRef.current || !videoRef.current) return;

    const ctx = gsap.context(() => {
      // اگر کاربر در صفحه‌ای غیر از هوم‌پیج است، پرلودر را فوراً ببند
      if (pathname !== '/') {
        gsap.set(preloaderRef.current, { yPercent: 100 });
        return;
      }

      const video = videoRef.current;
      video.playbackRate = videoPlaybackRate;
      video.muted = true;
      
      let isFinished = false;

      const handleVideoEnded = () => {
        if (isFinished) return;
        isFinished = true;

        gsap.to(preloaderRef.current, {
          yPercent: 100,
          duration: exitDuration,
          delay: homeExtraDelay,
          ease: "power4.inOut"
        });
      };

      video.addEventListener('ended', handleVideoEnded);

      // 🚀 اجرای ویدیو با ۱ ثانیه تاخیر اولیه
      const startTimer = setTimeout(() => {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            handleVideoEnded(); 
          });
        }
      }, initialDelay * 1000);

      // تایمر نجات در صورت گیر کردن اینترنت
      const fallbackTimer = setTimeout(handleVideoEnded, (initialDelay + 8) * 1000);

      return () => {
        video.removeEventListener('ended', handleVideoEnded);
        clearTimeout(startTimer);
        clearTimeout(fallbackTimer);
      };
    }, preloaderRef);

    return () => ctx.revert();
  }, [pathname]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none transform-gpu"
      style={{ backgroundColor: '#000000' }}
    >
      <div 
        className="absolute inset-0 z-0 transform-gpu"
        style={{
          backgroundColor: preloaderBgColor,
          backdropFilter: preloaderBlurIntensity,
          WebkitBackdropFilter: preloaderBlurIntensity, 
        }}
      />

      <div
        className="relative z-10 flex items-center justify-center pointer-events-none transform-gpu"
        style={{
          width: isMobile ? mobileVideoWidth : videoWidth,
          transform: `translateX(${videoOffsetX}px) scale(${isMobile ? mobileVideoScale : videoScale})`,
          transformOrigin: 'center center',
          backgroundColor: '#000000',
        }}
      >
        <video
          ref={videoRef}
          muted
          playsInline
          className="w-full h-full object-contain"
          style={{
            mixBlendMode: videoBlendMode,
            backgroundColor: '#000000',
            width: '100%',
            height: isMobile ? '100vh' : 'auto',
            objectFit: 'contain',
          }}
        >
          <source src="/preload.mp4" type="video/mp4" />
          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
        </video>
      </div>
    </div>
  );
}