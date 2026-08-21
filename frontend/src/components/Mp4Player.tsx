"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface Mp4PlayerProps {
  src: string;
  poster?: string;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

export default function Mp4Player({ 
  src, 
  poster, 
  className = "", 
  autoPlay = false,
  loop = false,
  muted = false
}: Mp4PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false); // 🎯 جدید
  const [mounted, setMounted] = useState(false); // 🎯 جدید
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🎯 Mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🎯 Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 🎯 Handle play/pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      setShowControls(true);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
      hideControlsAfterDelay();
    }
  }, [isPlaying]);

  // 🎯 Handle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted) {
      videoRef.current.volume = 0;
    } else {
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // 🎯 Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 🎯 Open Lightbox
  const openLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLightboxOpen(true);
    document.body.style.overflow = 'hidden';
    
    // پخش ویدیو
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          setHasStarted(true);
        }).catch(() => {});
      }
    }, 300);
  };

  // 🎯 Close Lightbox
  const closeLightbox = () => {
    setIsLightboxOpen(false);
    document.body.style.overflow = '';
    
    // توقف ویدیو
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 🎯 Handle progress click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  // 🎯 Handle volume change
  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, pos));
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // 🎯 Auto-hide controls
  const hideControlsAfterDelay = () => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    hideControlsAfterDelay();
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setShowControls(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 1000);
  };

  // 🎯 Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => setDuration(video.duration);
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('ended', onEnded);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    if (autoPlay) {
      video.play().then(() => {
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(() => {});
    }

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('ended', onEnded);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [autoPlay]);

  // 🎯 Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
        return;
      }
      
      if (!videoRef.current) return;
      
      switch(e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const newVolUp = Math.min(1, volume + 0.1);
          videoRef.current.volume = newVolUp;
          setVolume(newVolUp);
          break;
        case 'ArrowDown':
          e.preventDefault();
          const newVolDown = Math.max(0, volume - 0.1);
          videoRef.current.volume = newVolDown;
          setVolume(newVolDown);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, isFullscreen, volume, duration, togglePlay, toggleMute, toggleFullscreen, isLightboxOpen]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const videoElement = (
    <video 
      ref={videoRef}
      src={src}
      poster={poster}
      playsInline
      loop={loop}
      className="w-full h-full object-cover"
    />
  );

  return (
    <>
      {/* 🎬 Video Player Container */}
      <motion.div 
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={togglePlay}
        className={`relative w-full max-w-[1274px] mx-auto aspect-video bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-white/[0.06] group cursor-pointer ${className}`}
      >
        {videoElement}

        {/* ⏳ Buffering Indicator */}
        <AnimatePresence>
          {isBuffering && isPlaying && !isLightboxOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <div className="w-14 h-14 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ▶️ Play Button Overlay */}
        <AnimatePresence>
          {!hasStarted && !isPlaying && !isLightboxOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center z-20"
            >
              <motion.div 
                whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10 text-white ml-1 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🔄 Replay Button */}
        <AnimatePresence>
          {!isPlaying && hasStarted && !isLightboxOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="absolute inset-0 bg-black/40 flex items-center justify-center z-20"
            >
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl"
              >
                <svg className="w-7 h-7 md:w-9 md:h-9 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎮 Custom Controls Bar */}
        <AnimatePresence>
          {(showControls || !isPlaying) && hasStarted && !isLightboxOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 z-30"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent -top-20 pointer-events-none" />
              
              <div className="relative px-4 md:px-6 pb-3 md:pb-4 pt-8">
                {/* Progress Bar */}
                <div 
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="relative w-full h-1 bg-white/20 rounded-full mb-3 md:mb-4 cursor-pointer group/progress hover:h-2 transition-all duration-200"
                >
                  <div 
                    className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100"
                    style={{ width: `${progressPercent}%` }}
                  />
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-all duration-200 shadow-lg"
                    style={{ left: `${progressPercent}%`, transform: `translate(-50%, -50%)` }}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 md:gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlay}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors"
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 md:w-6 md:h-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </motion.button>

                    <div className="hidden sm:flex items-center gap-2 group/vol">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMute}
                        className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors"
                      >
                        {isMuted || volume === 0 ? (
                          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </motion.button>
                      
                      <div 
                        onClick={handleVolumeChange}
                        className="w-0 group-hover/vol:w-20 md:group-hover/vol:w-24 h-1 bg-white/20 rounded-full overflow-hidden transition-all duration-300 cursor-pointer hover:h-2"
                      >
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${isMuted ? 0 : volume * 100}%` }}
                        />
                      </div>
                    </div>

                    <span className="text-white/70 text-xs md:text-sm font-medium tabular-nums ml-1 md:ml-2">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={toggleFullscreen}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors"
                    >
                      {isFullscreen ? (
                        <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                        </svg>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 🎯 Lightbox Modal */}
      {mounted && createPortal(
        <AnimatePresence>
          {isLightboxOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
              {/* Backdrop Blur */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/70 backdrop-blur-xl cursor-pointer"
                onClick={closeLightbox}
              />
              
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </motion.button>

              {/* Video Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
                style={{ zIndex: 10 }}
                onClick={(e) => e.stopPropagation()}
              >
                {videoElement}
                
                {/* Lightbox Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={togglePlay}
                      className="w-10 h-10 flex items-center justify-center text-white hover:text-white/80 transition-colors"
                    >
                      {isPlaying ? (
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>
                    
                    <span className="text-white/70 text-xs font-medium tabular-nums">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}