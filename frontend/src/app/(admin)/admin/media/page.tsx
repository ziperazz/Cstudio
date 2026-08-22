"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/api';
import { outfitFont } from '@/app/fonts';

const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';
const englishFontFamily = '"Outfit", sans-serif';

interface MediaFile {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  sizeMB: string;
  createdAt: string;
  isUsed: boolean;
  isDuplicate: boolean; // 👈 استیت تکراری بودن اضافه شد
}

export default function MediaManagerPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth('/media');
      const data = await res.json();
      if (data.success) {
        setMediaFiles(data.data || []);
      }
    } catch (err) {
      console.error('خطا در دریافت فایل‌های مدیا', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDelete = async (filename: string) => {
    if (!confirm(`آیا از حذف فایل ${filename} اطمینان دارید؟ این عمل غیرقابل بازگشت است!`)) return;
    
    try {
      setDeletingId(filename);
      const res = await fetchWithAuth(`/media/${filename}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMediaFiles(prev => prev.filter(f => f.name !== filename));
      } else {
        alert(data.message || 'خطا در حذف فایل');
      }
    } catch (err) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setDeletingId(null);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.currentTarget.play().catch(() => {});
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    e.currentTarget.pause();
    e.currentTarget.currentTime = 0; 
  };

  const totalSizeMB = mediaFiles.reduce((acc, file) => acc + parseFloat(file.sizeMB), 0);
  const totalSizeDisplay = totalSizeMB > 1024 
    ? `${(totalSizeMB / 1024).toFixed(2)} GB` 
    : `${totalSizeMB.toFixed(2)} MB`;

  return (
    <div className="w-full flex flex-col gap-8 pb-20 px-4 md:px-8 mt-6" style={{ fontFamily: persianFontFamily }} dir="rtl">
      
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-white/10 pb-8 relative z-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">فضای ذخیره‌سازی</h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light">
            مدیریت هوشمند فایل‌های ویدیویی آپلود شده. <br className="md:hidden" />
            <span className="text-emerald-400">فایل‌های در حال استفاده محافظت شده‌اند.</span>
          </p>
        </div>
        
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 flex items-center gap-6 min-w-[300px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-white to-zinc-600 rounded-l-full"></div>
          <div className="w-14 h-14 bg-[#050505] rounded-full flex items-center justify-center border border-white/10 text-white shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily: englishFontFamily }}>Total Storage Used</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black text-white leading-none ${outfitFont.className}`} dir="ltr">
                {isLoading ? '...' : totalSizeDisplay}
              </span>
            </div>
            <span className="text-zinc-400 text-xs mt-2">{mediaFiles.length} فایل ویدیویی شناسایی شد</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
        </div>
      ) : mediaFiles.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#111111] border border-white/5 rounded-[32px] p-16 flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          <div className="w-24 h-24 bg-[#050505] border border-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-600">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <p className="text-white text-xl font-bold">پوشه آپلود سرور شما خالی است!</p>
          <p className="text-zinc-500 mt-2 text-sm">هیچ ویدیویی در سرور یافت نشد.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {mediaFiles.map((file, idx) => (
              <motion.div 
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-[#111111] border border-white/5 hover:border-white/20 rounded-[24px] overflow-hidden flex flex-col justify-between group transition-colors shadow-xl relative"
              >
                
                {/* 🏷️ لیبل‌های وضعیت (استفاده شده + هشدار تکراری) */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {file.isUsed ? (
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide backdrop-blur-md shadow-lg flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      در حال استفاده
                    </span>
                  ) : (
                    <span className="bg-zinc-500/20 border border-zinc-500/40 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide backdrop-blur-md shadow-lg flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                      آزاد (قابل حذف)
                    </span>
                  )}

                  {/* 🚀 لیبل جدید: هشدار فایل تکراری */}
                  {file.isDuplicate && (
                    <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide backdrop-blur-md shadow-lg flex items-center gap-1.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      نسخه تکراری دارد
                    </span>
                  )}
                </div>

                <div className={`absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-black shadow-lg ${outfitFont.className}`} dir="ltr">
                  {file.sizeMB} MB
                </div>

                <div className="w-full aspect-video bg-[#050505] relative overflow-hidden">
                  <video 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}${file.url}#t=0.1`}
                    muted 
                    loop 
                    playsInline
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-crosshair"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-100 pointer-events-none" />
                  
                  <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                    <div className="w-12 h-12 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                      <svg className="w-5 h-5 text-white ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col gap-4 relative z-10 -mt-2 bg-[#111111]">
                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: englishFontFamily }}>FILENAME</span>
                    <h2 dir="ltr" className="text-white/90 font-mono text-sm line-clamp-1 break-all bg-[#050505] px-3 py-2 rounded-lg border border-white/5">
                      {file.name}
                    </h2>
                  </div>

                  <button 
                    onClick={() => !file.isUsed && handleDelete(file.name)}
                    disabled={file.isUsed || deletingId === file.name}
                    className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                      file.isUsed 
                        ? 'bg-[#050505] text-zinc-600 border border-white/5 cursor-not-allowed'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    }`}
                  >
                    {deletingId === file.name ? (
                      <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : file.isUsed ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        غیرقابل حذف
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        حذف دائمی فایل
                      </>
                    )}
                  </button>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}