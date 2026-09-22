"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/api';
import { saveAdminToken } from '@/utils/adminAuth';
import { orbitronFont, outfitFont } from '@/app/fonts';

const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

const toPersianDigits = (num: number | string) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (char) => persianNumbers[parseInt(char)]);
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 350, damping: 30 } }
};

const MIN_PASSWORD_LENGTH = 6;

// امتیازدهی ساده به قدرت رمز عبور برای نمایش نوار راهنما
const scorePassword = (value: string) => {
  let score = 0;
  if (value.length >= MIN_PASSWORD_LENGTH) score++;
  if (value.length >= 10) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 4);
};

const strengthLabels = ['خیلی ضعیف', 'ضعیف', 'متوسط', 'خوب', 'عالی'];
const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-400'];

const EyeIcon = ({ open }: { open: boolean }) => (
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  )
);

interface AdminProfile {
  id: string;
  username: string;
  createdAt?: string;
}

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchWithAuth('/auth/me');
        const data = await res.json();
        if (data.success) setProfile(data.data);
      } catch (err) {
        console.error('خطا در دریافت اطلاعات ادمین', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const strength = scorePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`رمز عبور جدید باید حداقل ${toPersianDigits(MIN_PASSWORD_LENGTH)} کاراکتر باشد.`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('رمز عبور جدید و تکرار آن یکسان نیستند.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('رمز عبور جدید نباید با رمز عبور فعلی یکسان باشد.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetchWithAuth('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (data.success) {
        // توکن جدید ذخیره می‌شود تا نشست فعلی بعد از تغییر رمز قطع نشود
        if (data.token) saveAdminToken(data.token);
        setSuccess('رمز عبور با موفقیت تغییر کرد.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccess(''), 6000);
      } else {
        setError(data.message || 'خطا در تغییر رمز عبور');
      }
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full h-14 px-4 pl-12 bg-[#050505] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/40 transition-all text-sm tracking-[0.15em] ${outfitFont.className}`;

  return (
    <motion.div
      className="w-full flex flex-col gap-6 md:gap-10 pb-16 px-4 md:px-8 mt-6"
      style={{ fontFamily: persianFontFamily }}
      variants={containerVariants} initial="hidden" animate="show" dir="rtl"
    >
      {/* ======================= تیتر صفحه ======================= */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 md:pb-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">تنظیمات و امنیت</h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl font-light">
            رمز عبور ورود به پنل مدیریت را از این بخش تغییر دهید. بعد از تغییر، رمز قبلی دیگر کار نخواهد کرد.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#111111] border border-white/5 rounded-2xl px-5 py-3.5">
          <div className={`w-11 h-11 rounded-full bg-[#050505] flex items-center justify-center text-white text-base font-black border border-zinc-800 ${orbitronFont.className} uppercase`}>
            {isLoadingProfile ? '—' : (profile?.username?.charAt(0) || 'A')}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">ادمین فعلی</span>
            {isLoadingProfile ? (
              <span className="h-4 w-24 bg-zinc-800 rounded animate-pulse" />
            ) : (
              <span className={`text-white text-sm font-bold ${outfitFont.className}`} dir="ltr">@{profile?.username || 'admin'}</span>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 items-start relative">

        {/* ======================= فرم تغییر رمز عبور ======================= */}
        <motion.div variants={itemVariants} className="xl:col-span-5 2xl:col-span-4 xl:sticky xl:top-24 z-20">
          <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/5 rounded-[24px] p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2 relative z-10">
              <h2 className="text-white font-bold text-lg flex items-center gap-3">
                <div className="w-2 h-8 bg-white rounded-full"></div>
                تغییر رمز عبور
              </h2>
              <span className={`text-xs text-zinc-500 uppercase tracking-widest font-bold ${outfitFont.className}`}>Security</span>
            </div>

            {/* رمز فعلی */}
            <div className="flex flex-col gap-2 relative z-10">
              <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">رمز عبور فعلی</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  dir="ltr"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(v => !v)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors cursor-pointer"
                  title={showCurrent ? 'پنهان کردن رمز' : 'نمایش رمز'}
                >
                  <EyeIcon open={showCurrent} />
                </button>
              </div>
            </div>

            {/* رمز جدید */}
            <div className="flex flex-col gap-2 relative z-10">
              <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">رمز عبور جدید</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  dir="ltr"
                  autoComplete="new-password"
                  placeholder={`حداقل ${toPersianDigits(MIN_PASSWORD_LENGTH)} کاراکتر`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors cursor-pointer"
                  title={showNew ? 'پنهان کردن رمز' : 'نمایش رمز'}
                >
                  <EyeIcon open={showNew} />
                </button>
              </div>

              {/* نوار قدرت رمز */}
              <AnimatePresence>
                {newPassword.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-3 pt-2 pr-1 overflow-hidden"
                  >
                    <div className="flex gap-1.5 flex-1">
                      {[0, 1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < strength ? strengthColors[strength] : 'bg-zinc-800'}`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold shrink-0">{strengthLabels[strength]}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* تکرار رمز جدید */}
            <div className="flex flex-col gap-2 relative z-10">
              <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">تکرار رمز عبور جدید</label>
              <input
                type={showNew ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                dir="ltr"
                autoComplete="new-password"
                placeholder="••••••••"
                className={`w-full h-14 px-4 bg-[#050505] border rounded-xl text-white placeholder:text-zinc-700 focus:outline-none transition-all text-sm tracking-[0.15em] ${outfitFont.className} ${
                  confirmPassword.length > 0 && confirmPassword !== newPassword
                    ? 'border-red-500/40 focus:border-red-500/60'
                    : 'border-zinc-800 focus:border-white/40'
                }`}
              />
              {confirmPassword.length > 0 && confirmPassword !== newPassword && (
                <span className="text-red-400/80 text-[11px] font-medium pr-1">تکرار رمز با رمز جدید یکسان نیست.</span>
              )}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3 font-medium relative z-10">
                  {error}
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-center gap-3 font-medium relative z-10">
                  {success}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 mt-2 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm md:text-base relative z-10 cursor-pointer"
            >
              {isSubmitting ? 'در حال ذخیره...' : 'ذخیره رمز عبور جدید'}
            </button>
          </form>
        </motion.div>

        {/* ======================= راهنمای امنیتی ======================= */}
        <motion.div variants={itemVariants} className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-6">

          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-3">
              نکات امنیتی
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: 'رمز عبور یکتا انتخاب کنید',
                desc: 'از رمزی استفاده کنید که در هیچ سرویس دیگری به کار نبرده‌اید تا لو رفتن یک سرویس، پنل شما را در خطر نیندازد.',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              },
              {
                title: 'ترکیب حروف، عدد و علامت',
                desc: 'استفاده از حروف بزرگ و کوچک همراه با عدد و کاراکترهای ویژه، حدس زدن رمز را عملاً غیرممکن می‌کند.',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"></path></svg>
              },
              {
                title: 'رمز را جایی ذخیره نکنید',
                desc: 'رمز پنل را در چت، ایمیل یا فایل متنی ذخیره نکنید. در صورت نیاز از یک رمزنگار امن (Password Manager) استفاده کنید.',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
              },
              {
                title: 'بعد از تغییر، دوباره وارد شوید',
                desc: 'اگر از دستگاه دیگری هم وارد پنل شده‌اید، بهتر است بعد از تغییر رمز از آن دستگاه خارج شده و دوباره وارد شوید.',
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              },
            ].map((tip, idx) => (
              <div key={idx} className="bg-[#111111] border border-white/5 hover:border-white/10 rounded-[20px] p-6 flex flex-col gap-3 group transition-all duration-300">
                <div className="w-11 h-11 rounded-full bg-[#050505] border border-zinc-800 flex items-center justify-center text-white group-hover:bg-zinc-800 transition-colors shrink-0">
                  {tip.icon}
                </div>
                <h3 className="text-white font-bold text-base mt-1">{tip.title}</h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed font-light">{tip.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#111111] border border-amber-500/15 rounded-[20px] p-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-white font-bold text-sm">رمز جدید را حتماً یادداشت امن کنید</h3>
              <p className="text-zinc-500 text-[13px] leading-relaxed font-light">
                راه بازیابی خودکار رمز برای پنل مدیریت وجود ندارد. در صورت فراموشی، بازیابی فقط از طریق دسترسی مستقیم به سرور امکان‌پذیر است.
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}
