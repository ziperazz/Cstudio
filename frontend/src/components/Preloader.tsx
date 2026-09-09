"use client";

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';

// 🎛️===================================================================🎛️
//          پنل تنظیمات و داشبورد ویدیوی پرلودر (بدون باگ Scale سافاری)
// 🎛️===================================================================🎛️

const preloaderBgColor = "rgba(0, 0, 0, 0.1)";
const preloaderBlurIntensity = "blur(40px)";

// 🎚️ ویدیو دسکتاپ
const desktopVideoSrc = "/PRELOAD.mp4";
const desktopActualWidth = "2160px"; // معادل همون عرض 480 با اسکیل 4.5

// 📱 ویدیو موبایل
const mobileVideoSrc = "/preload2.mp4";
const mobileActualWidth = "180vw";   // معادل همون 100vw با اسکیل 1.8

const videoPlaybackRate = 0.8;
const videoBlendMode = "screen";
const videoOffsetX = 17;
const exitDuration = 1.2;

export default function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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
          delay: 1, 
          ease: "power4.inOut"
        });
      };

      video.addEventListener('ended', handleVideoEnded);

      const safetyTimer = setTimeout(() => {
        if (preloaderRef.current) {
          gsap.to(preloaderRef.current, {
            yPercent: 100,
            duration: exitDuration,
            ease: "power4.inOut"
          });
        }
      }, 6000);

      return () => {
        clearTimeout(safetyTimer);
        video.removeEventListener('ended', handleVideoEnded);
      };
    }, preloaderRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none bg-black"
    >
      {/* 🚀 استایل‌های خالص CSS بدون استفاده از transform: scale */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .preload-wrapper {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${desktopActualWidth};
            transform: translateX(${videoOffsetX}px) translate3d(0,0,0);
            will-change: transform;
          }
          .preload-video {
            width: 100%;
            height: auto;
            object-fit: contain;
          }
          
          @media (max-width: 768px) {
            .preload-wrapper {
              width: ${mobileActualWidth};
              height: 100dvh;
            }
            .preload-video {
              height: 100dvh;
            }
          }
        `
      }} />

      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: preloaderBgColor,
          backdropFilter: preloaderBlurIntensity,
          WebkitBackdropFilter: preloaderBlurIntensity,
          transform: 'translate3d(0,0,0)',
        }}
      />

      <div className="relative z-10 preload-wrapper pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="preload-video"
          style={{ mixBlendMode: videoBlendMode as any, backgroundColor: '#000000' }}
        >
          {/* 🚀 هندل کردن مدیا کوئری نیتیو */}
          <source src={mobileVideoSrc} media="(max-width: 768px)" type="video/mp4" />
          <source src={desktopVideoSrc} type="video/mp4" />
          مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
        </video>
      </div>
    </div>
  );
}