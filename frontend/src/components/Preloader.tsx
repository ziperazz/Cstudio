"use client";

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

// 🎛️===================================================================🎛️
//          پنل تنظیمات و داشبورد ویدیوی پرلودر (Blur & Transparent Video)
// 🎛️===================================================================🎛️

// 🎨 تنظیمات پس‌زمینه
const preloaderBgColor = "rgba(0, 0, 0, 0.1)";
const preloaderBlurIntensity = "blur(40px)";

// 🎚️ تنظیمات ویدیو دسکتاپ
const desktopVideoWidth = "480px";
const desktopVideoScale = 4.5;
const desktopVideoSrc = "/PRELOAD.mp4";

// 📱 تنظیمات ویدیو موبایل
const mobileVideoWidth = "100vw";
const mobileVideoScale = 1.8;
const mobileVideoSrc = "/preload2.mp4";

// 🎯 سرعت پخش
const videoPlaybackRate = 0.8;
const videoBlendMode = "screen";

// ⏱️ خروج
const exitDuration = 1.2;

// ↔️ جابجایی افقی
const videoOffsetX = 17;

export default function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);

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

    const video = videoRef.current;
    video.playbackRate = videoPlaybackRate;
    video.muted = true;

    const ctx = gsap.context(() => {
      const handleVideoEnded = () => {
        gsap.to(preloaderRef.current, {
          yPercent: 100,
          duration: exitDuration,
          ease: "power4.inOut"
        });
      };

      video.addEventListener('ended', handleVideoEnded);

      // 🎯 تایمر امن - اگه ویدیو لود نشد، بعد ۴ ثانیه محو شه
      const safetyTimer = setTimeout(() => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            yPercent: 100,
            duration: exitDuration,
            ease: "power4.inOut"
          });
        }
      }, 4000);

      return () => {
        clearTimeout(safetyTimer);
        video.removeEventListener('ended', handleVideoEnded);
      };
    }, preloaderRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none"
      style={{ backgroundColor: '#000000' }}
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: preloaderBgColor,
          backdropFilter: preloaderBlurIntensity,
          WebkitBackdropFilter: preloaderBlurIntensity,
        }}
      />

      <div
        className="relative z-10 flex items-center justify-center pointer-events-none"
        style={{
          width: isMobile ? mobileVideoWidth : desktopVideoWidth,
          transform: `translateX(${videoOffsetX}px) scale(${isMobile ? mobileVideoScale : desktopVideoScale})`,
          transformOrigin: 'center center',
          backgroundColor: '#000000',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
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
          <source src={isMobile ? mobileVideoSrc : desktopVideoSrc} type="video/mp4" />
          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
        </video>
      </div>
    </div>
  );
}