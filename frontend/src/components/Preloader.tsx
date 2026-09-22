"use client";

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ensureMutedAutoplay } from '@/utils/autoplay';

// 🎛️===================================================================🎛️
//          پنل تنظیمات و داشبورد ویدیوی پرلودر 
// 🎛️===================================================================🎛️

const preloaderBgColor = "rgba(0, 0, 0, 0.1)";
const preloaderBlurIntensity = "blur(40px)";

// 🎚️ تنظیمات دسکتاپ
const desktopVideoSrc = "/PRELOAD.mp4";
const desktopVideoWidth = "480px";
const desktopVideoScale = 4.5;

// 📱 تنظیمات موبایل
const mobileVideoSrc = "/preload2.mp4";
const mobileVideoWidth = "100vw";
const mobileVideoScale = 0.72; // 📉 کوچک‌تر شده برای موبایل (قبلاً 1.15 → 0.9 → 0.72)

const videoPlaybackRate = 0.8;
const videoBlendMode = "screen";
const videoOffsetX = 17;
const exitDuration = 1.2;

export default function Preloader() {
  const preloaderRef = useRef<HTMLDivElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!preloaderRef.current) return;

    const dVideo = desktopVideoRef.current;
    const mVideo = mobileVideoRef.current;

    // رفع باگ سافاری آیفون: اتوپلی اولیه‌ی HTML به‌خاطر نبود اتریبیوت muted بلاک می‌شود،
    // پس خودمان muted را ست کرده و play() را صریحاً صدا می‌زنیم
    if (dVideo) { dVideo.playbackRate = videoPlaybackRate; ensureMutedAutoplay(dVideo); }
    if (mVideo) { mVideo.playbackRate = videoPlaybackRate; ensureMutedAutoplay(mVideo); }

    const ctx = gsap.context(() => {
      let exited = false;

      // فریز شدن روی فریم آخر: ویدیو بعد از پایان نباید از اول شروع شود
      const freeze = (v: HTMLVideoElement | null) => { if (v) v.pause(); };
      const onEnded = () => { freeze(dVideo); freeze(mVideo); triggerExit(); };
      const onPlayAfterEnd = (e: Event) => { if (exited) (e.target as HTMLVideoElement).pause(); };

      const triggerExit = () => {
        if (exited) return;
        exited = true;
        gsap.to(preloaderRef.current, {
          yPercent: 100,
          duration: exitDuration,
          delay: 1, 
          ease: "power4.inOut"
        });
      };

      if (dVideo) { dVideo.addEventListener('ended', onEnded); dVideo.addEventListener('play', onPlayAfterEnd); }
      if (mVideo) { mVideo.addEventListener('ended', onEnded); mVideo.addEventListener('play', onPlayAfterEnd); }

      const safetyTimer = setTimeout(() => {
        triggerExit();
      }, 6000);

      return () => {
        clearTimeout(safetyTimer);
        if (dVideo) { dVideo.removeEventListener('ended', onEnded); dVideo.removeEventListener('play', onPlayAfterEnd); }
        if (mVideo) { mVideo.removeEventListener('ended', onEnded); mVideo.removeEventListener('play', onPlayAfterEnd); }
      };
    }, preloaderRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden select-none bg-black"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: preloaderBgColor,
          backdropFilter: preloaderBlurIntensity,
          WebkitBackdropFilter: preloaderBlurIntensity,
          transform: 'translate3d(0,0,0)',
        }}
      />

      {/* 💻 نسخه دسکتاپ */}
      <div
        className="hidden md:flex relative z-10 pointer-events-none items-center justify-center"
        style={{ 
          width: desktopVideoWidth, 
          transform: `translateX(${videoOffsetX}px) scale(${desktopVideoScale})`,
          transformOrigin: 'center center'
        }}
      >
        <video
          ref={desktopVideoRef}
          src={desktopVideoSrc}
          autoPlay
          muted
          playsInline
          className="w-full h-auto object-contain"
          style={{ mixBlendMode: videoBlendMode as any, backgroundColor: '#000000' }}
        />
      </div>

      {/* 📱 نسخه موبایل */}
      <div
        className="flex md:hidden relative z-10 pointer-events-none items-center justify-center"
        style={{ 
          width: mobileVideoWidth, 
          height: '100dvh', 
          transform: `translateX(${videoOffsetX}px) scale(${mobileVideoScale})`,
          transformOrigin: 'center center'
        }}
      >
        <video
          ref={mobileVideoRef}
          src={mobileVideoSrc}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-contain"
          style={{ mixBlendMode: videoBlendMode as any, backgroundColor: '#000000' }}
        />
      </div>

    </div>
  );
}