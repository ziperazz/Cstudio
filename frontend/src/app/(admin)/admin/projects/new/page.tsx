"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; 
import { fetchWithAuth } from '@/utils/api';

// 🎯 وارد کردن فونت‌های گوگل برای ترکیب تایپوگرافی حرفه‌ای
import { orbitronFont, outfitFont } from '@/app/fonts';



const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

export default function NewProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🚀 استیت‌های فرم
  const [companyName, setCompanyName] = useState('');
  const [teaserName, setTeaserName] = useState('');
  const [description, setDescription] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [priority, setPriority] = useState<number>(5); 
  const [videoFiles, setVideoFiles] = useState<File[]>([]); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 🎥 هندل کردن انتخاب ویدیوها (حل مشکل جایگزین شدن فایل‌ها)
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      setVideoFiles((prevFiles) => {
        // ترکیب فایل‌های قبلی با فایل‌های جدید
        const combinedFiles = [...prevFiles, ...newFiles];
        
        // اگر بیشتر از 2 تا شد، فقط دو تای اول رو نگه دار و ارور بده
        if (combinedFiles.length > 2) {
          setError('حداکثر می‌توانید ۲ ویدیو انتخاب کنید. فایل‌های اضافی نادیده گرفته شدند.');
          return combinedFiles.slice(0, 2);
        }
        
        setError('');
        return combinedFiles;
      });
      
      // ریست کردن اینپوت تا بتونیم دوباره همون فایل رو در صورت نیاز انتخاب کنیم
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 🗑️ حذف یکی از ویدیوهای انتخاب شده
  const handleRemoveVideo = (indexToRemove: number, e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); // جلوگیری از باز شدن دوباره پنجره انتخاب فایل
    setVideoFiles(videoFiles.filter((_, idx) => idx !== indexToRemove));
  };

  // 🚀 ارسال اطلاعات به بک‌اند
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (videoFiles.length === 0 || videoFiles.length > 2) {
      setError('لطفاً حداقل ۱ و حداکثر ۲ فایل ویدیویی انتخاب کنید.');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('companyName', companyName);
      formData.append('teaserName', teaserName);
      formData.append('description', description);
      formData.append('priority', priority.toString()); 
      
      if (bottomText) {
        formData.append('bottomText', bottomText);
      }
      
      videoFiles.forEach(file => {
        formData.append('videos', file);
      });

      const res = await fetchWithAuth('/projects', {
  method: 'POST',
  body: formData, 
}, 'admin');

      const data = await res.json();

      if (data.success) {
        setSuccessMsg('پروژه با موفقیت آپلود و در سایت منتشر شد!');
        setTimeout(() => {
          router.push('/admin/projects');
        }, 1500);
      } else {
        setError(data.message || 'خطا در ثبت پروژه');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col gap-10 pb-20 px-4 md:px-8 pt-8" style={{ fontFamily: persianFontFamily }} dir="rtl">
      
      {/* ======================= هدر مینیمال و لاکچری ======================= */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8"
      >
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">آپلود نمونه‌کار جدید</h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed font-light">
            اطلاعات پروژه را وارد کنید، اولویت نمایش را تعیین کنید و ویدیوهای خود را آپلود نمایید.
          </p>
        </div>
        <div className={`hidden md:block text-white/5 font-black text-6xl uppercase tracking-widest ${orbitronFont.className} select-none pointer-events-none`}>
          UPLOAD
        </div>
      </motion.div>

      {/* ======================= فرم آپلود ======================= */}
      <motion.form 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={handleSubmit}
        className="bg-[#111111] border border-white/10 rounded-[32px] p-6 md:p-12 flex flex-col gap-10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* ----------------- ردیف اول: نام برند و تیزر ----------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <div className="flex flex-col gap-3">
            <label className="text-white text-sm font-bold tracking-wide">نام برند / شرکت</label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="مثال: الما کلینیک"
              className="w-full h-16 px-5 bg-[#050505] border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-[#0a0a0a] transition-all text-base"
              required
            />
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-white text-sm font-bold tracking-wide">نام تیزر</label>
            <input 
              type="text" 
              value={teaserName}
              onChange={(e) => setTeaserName(e.target.value)}
              placeholder="مثال: تیزر تبلیغاتی خدمات نوین"
              className="w-full h-16 px-5 bg-[#050505] border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-[#0a0a0a] transition-all text-base"
              required
            />
          </div>
        </div>

        {/* ----------------- ردیف دوم: اولویت نمایش ----------------- */}
        <div className="flex flex-col gap-4 relative z-10 border-y border-white/5 py-8 my-2">
          <div className="flex flex-col gap-1">
            <label className="text-white text-base font-bold tracking-wide">اولویت نمایش در صفحه نمونه‌کارها</label>
            <span className="text-white/50 text-xs font-light">شماره ۱ بالاترین جایگاه (ابتدای صفحه) و شماره ۵ پایین‌ترین جایگاه است.</span>
          </div>
          <div className="flex items-center gap-3 md:gap-5 flex-wrap">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPriority(num)}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl transition-all duration-300 ${outfitFont.className} ${
                  priority === num 
                    ? 'bg-white text-black scale-110 shadow-[0_0_30px_rgba(255,255,255,0.4)] border-transparent' 
                    : 'bg-[#050505] text-white/70 border border-white/10 hover:border-white/40 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* ----------------- ردیف سوم: توضیحات ----------------- */}
        <div className="flex flex-col gap-3 relative z-10">
          <label className="text-white text-sm font-bold tracking-wide">توضیحات پروژه (متن اصلی)</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات کامل درباره ایده، استراتژی و اجرای پروژه..."
            rows={5}
            className="w-full p-5 bg-[#050505] border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-[#0a0a0a] transition-all resize-none leading-loose text-base"
            required
          />
        </div>

        {/* ----------------- ردیف چهارم: نتیجه‌گیری ----------------- */}
        <div className="flex flex-col gap-3 relative z-10">
          <label className="text-white text-sm font-bold tracking-wide">متن نتیجه‌گیری پایانی (اختیاری)</label>
          <textarea 
            value={bottomText}
            onChange={(e) => setBottomText(e.target.value)}
            placeholder="مثال: پس از انتشار این تیزر، فروش مجموعه ۶۵ درصد افزایش یافت..."
            rows={2}
            className="w-full p-5 bg-[#050505] border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/50 focus:bg-[#0a0a0a] transition-all resize-none leading-relaxed text-base"
          />
        </div>

        {/* ----------------- ردیف پنجم: آپلودر ویدیو ----------------- */}
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <label className="text-white text-sm font-bold tracking-wide">فایل‌های ویدیویی</label>
              <span className="text-white/50 text-xs font-light">آپلود ۱ الی ۲ فایل ویدیویی با فرمت MP4.</span>
            </div>
            {videoFiles.length > 0 && (
              <span className={`text-white text-xs bg-white/10 px-3 py-1.5 rounded-lg ${outfitFont.className}`}>
                {videoFiles.length} / 2
              </span>
            )}
          </div>
          
          <div className={`relative border-2 border-dashed rounded-3xl p-10 md:p-14 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
            videoFiles.length > 0 
              ? 'border-white/60 bg-white/5' 
              : 'border-white/20 hover:border-white/40 bg-[#050505]'
          }`}>
            {/* اینپوت آپلود */}
            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/*"
              multiple 
              onChange={handleVideoChange}
              disabled={videoFiles.length >= 2}
              className={`absolute inset-0 w-full h-full opacity-0 z-10 ${videoFiles.length >= 2 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            />
            
            <div className="text-center relative z-20 w-full">
              {videoFiles.length > 0 ? (
                <div className="flex flex-col gap-4 items-center w-full">
                  <div className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <p className="text-white font-bold text-xl">{videoFiles.length} ویدیو انتخاب شده</p>
                  
                  {/* لیست ویدیوهای انتخاب شده با دکمه حذف */}
                  <div className="flex flex-col gap-2 mt-2 w-full max-w-sm">
                    {videoFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#050505] border border-white/20 px-4 py-3 rounded-xl pointer-events-auto shadow-lg relative z-30">
                        <span dir="ltr" className="truncate max-w-[80%] text-white text-sm font-mono tracking-wider">{f.name}</span>
                        <button 
                          onClick={(e) => handleRemoveVideo(i, e)}
                          className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/30 hover:text-red-300 flex items-center justify-center transition-colors cursor-pointer"
                          title="حذف این ویدیو"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {videoFiles.length < 2 && (
                    <p className="text-white/50 text-xs mt-2 border border-white/10 rounded-full px-4 py-1">برای افزودن ویدیوی دوم کلیک کنید</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center pointer-events-none">
                  <div className="w-20 h-20 rounded-full bg-[#111111] border border-white/10 text-white flex items-center justify-center mb-6 shadow-inner">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  </div>
                  <p className="text-white font-bold text-lg mb-2">ویدیوهای خود را اینجا رها کنید</p>
                  <p className="text-white/50 text-sm">یا برای انتخاب فایل کلیک کنید (۱ تا ۲ ویدیو)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ----------------- پیام خطا و موفقیت ----------------- */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/30 text-white p-5 rounded-2xl flex items-center gap-3 font-bold relative z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-red-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {error}
            </motion.div>
          )}
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-white/10 border border-white/30 text-white p-5 rounded-2xl flex items-center gap-3 font-bold relative z-10">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ----------------- دکمه انتشار ----------------- */}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-16 mt-6 bg-white text-black font-bold text-xl rounded-2xl hover:bg-zinc-200 transition-all duration-300 disabled:opacity-50 flex items-center justify-center relative overflow-hidden group shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] z-10 cursor-pointer"
        >
          {isLoading ? (
            <div className="w-7 h-7 border-4 border-black/20 border-t-black rounded-full animate-spin" />
          ) : (
            <div className="flex items-center gap-3">
              <span>آپلود پروژه</span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
          )}
        </button>

      </motion.form>

    </div>
  );
}