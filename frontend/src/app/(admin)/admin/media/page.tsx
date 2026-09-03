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
  isDuplicate: boolean;
}

export default function MediaManagerPage() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<MediaFile | null>(null);

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

  const handleDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      setDeletingId(confirmDelete.name);
      const res = await fetchWithAuth(`/media/${confirmDelete.name}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMediaFiles(prev => prev.filter(f => f.name !== confirmDelete.name));
        setConfirmDelete(null);
      } else {
        alert(data.message || 'خطا در حذف فایل');
        setConfirmDelete(null);
      }
    } catch (err) {
      alert('خطا در ارتباط با سرور');
      setConfirmDelete(null);
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
      
      {/* هدر */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 border-b border-white/10 pb-8 relative z-10">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">فضای ذخیره‌سازی</h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light">
            مدیریت هوشمند فایل‌های ویدیویی آپلود شده.
          </p>
        </div>
        
        <div className="bg-[#111111] border border-white/5 rounded-3xl p-5 flex items-center gap-6 min-w-[300px] shadow-2xl">
          <div className="w-14 h-14 bg-[#050505] rounded-full flex items-center justify-center border border-white/10 text-white shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1" style={{ fontFamily: englishFontFamily }}>Total Storage Used</span>
            <span className={`text-3xl font-black text-white leading-none ${outfitFont.className}`} dir="ltr">
              {isLoading ? '...' : totalSizeDisplay}
            </span>
            <span className="text-zinc-400 text-xs mt-2">{mediaFiles.length} فایل ویدیویی</span>
          </div>
        </div>
      </div>

      {/* لودینگ */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
        </div>
      ) : mediaFiles.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-[#111111] border border-white/5 rounded-[32px] p-16 flex flex-col items-center justify-center min-h-[400px] text-center"
        >
          <p className="text-white text-xl font-bold">پوشه آپلود سرور شما خالی است!</p>
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
                {/* لیبل‌های وضعیت */}
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                  {file.isUsed ? (
                    <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-bold backdrop-blur-md flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      در حال استفاده
                    </span>
                  ) : (
                    <span className="bg-zinc-500/20 border border-zinc-500/40 text-zinc-300 px-3 py-1.5 rounded-lg text-[10px] font-bold backdrop-blur-md">
                      آزاد (قابل حذف)
                    </span>
                  )}
                  {file.isDuplicate && (
                    <span className="bg-orange-500/20 border border-orange-500/40 text-orange-400 px-3 py-1.5 rounded-lg text-[10px] font-bold backdrop-blur-md">
                      نسخه تکراری دارد
                    </span>
                  )}
                </div>

                <div className={`absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-md border border-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-black ${outfitFont.className}`} dir="ltr">
                  {file.sizeMB} MB
                </div>

                {/* ویدیو */}
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
                </div>

                <div className="p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1 w-full overflow-hidden">
                    <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest" style={{ fontFamily: englishFontFamily }}>FILENAME</span>
                    <h2 dir="ltr" className="text-white/90 font-mono text-sm line-clamp-1 break-all bg-[#050505] px-3 py-2 rounded-lg border border-white/5">
                      {file.name}
                    </h2>
                  </div>

                  {/* دکمه حذف - همه قابل کلیک */}
                  <button 
                    onClick={() => setConfirmDelete(file)}
                    disabled={deletingId === file.name}
                    className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                      file.isUsed 
                        ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 hover:bg-yellow-500 hover:text-black hover:border-yellow-500'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500'
                    }`}
                  >
                    {deletingId === file.name ? (
                      <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : file.isUsed ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        حذف با احتیاط
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

      {/* 🎯 مودال تایید حذف شیک */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
              onClick={() => setConfirmDelete(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-8 shadow-2xl"
              style={{ fontFamily: persianFontFamily }}
              dir="rtl"
            >
              {/* آیکون */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                confirmDelete.isUsed 
                  ? 'bg-yellow-500/10 text-yellow-400'
                  : 'bg-red-500/10 text-red-400'
              }`}>
                {confirmDelete.isUsed ? (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                )}
              </div>

              <h3 className="text-white font-bold text-xl text-center mb-3">
                {confirmDelete.isUsed ? '⚠️ هشدار!' : 'حذف فایل'}
              </h3>
              
              <p className="text-zinc-400 text-sm text-center leading-relaxed mb-6">
                {confirmDelete.isUsed 
                  ? `این ویدیو در پروژه استفاده شده است! حذف آن باعث خرابی پروژه می‌شود.`
                  : `آیا از حذف دائمی این فایل اطمینان دارید؟`}
              </p>

              <div dir="ltr" className="text-zinc-500 text-xs text-center mb-8 bg-[#050505] rounded-lg py-2 px-3 font-mono break-all">
                {confirmDelete.name}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleDelete}
                  disabled={deletingId === confirmDelete.name}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    confirmDelete.isUsed 
                      ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {deletingId === confirmDelete.name ? 'در حال حذف...' : 'بله، حذف کن'}
                </button>
                <button 
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm bg-[#050505] text-zinc-400 border border-white/10 hover:text-white hover:border-white/30 transition-all"
                >
                  انصراف
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}