"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/api';

import { orbitronFont, outfitFont } from '@/app/fonts';

const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';
const englishFontFamily = outfitFont.className;

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

// ==========================================
// 🧮 توابع کمکی
// ==========================================
const toPersianDigits = (num: number | string) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (char) => persianNumbers[parseInt(char)]);
};

const formatCompact = (n: number) => (n < 10 && n > 0 ? `0${n}` : `${n}`);

const formatBytes = (bytes: number) => {
  if (!bytes) return '۰ MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) return `${toPersianDigits((mb / 1024).toFixed(1))} GB`;
  return `${toPersianDigits(mb.toFixed(1))} MB`;
};

// فاصله‌ی زمانی نسبی به فارسی (مثلاً «۲ ساعت پیش»)
const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'همین الان';
  if (diffMin < 60) return `${toPersianDigits(diffMin)} دقیقه پیش`;
  if (diffHour < 24) return `${toPersianDigits(diffHour)} ساعت پیش`;
  if (diffDay === 1) return 'دیروز';
  if (diffDay < 7) return `${toPersianDigits(diffDay)} روز پیش`;
  return new Intl.DateTimeFormat('fa-IR', { month: 'long', day: 'numeric' }).format(date);
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const getGreeting = (date: Date) => {
  const h = date.getHours();
  if (h < 5) return 'شب بخیر';
  if (h < 12) return 'صبح بخیر';
  if (h < 17) return 'ظهر بخیر';
  if (h < 20) return 'عصر بخیر';
  return 'شب بخیر';
};

const CATEGORY_LABELS: Record<string, string> = {
  teaser: 'تیزر',
  content: 'محتوایی',
  product: 'محصول',
  service: 'خدماتی',
  campaign: 'کمپین',
  web: 'وب',
};

// پالت مونوکروم هماهنگ با تم سیاه‌وسفید پنل (از سفید تا خاکستری تیره)
const CHART_PALETTE = ['#ffffff', '#c7c7c7', '#9a9a9a', '#707070', '#4d4d4d', '#2c2c2c'];

// ==========================================
// 🧾 تایپ‌های دیتا
// ==========================================
interface ProjectItem { _id: string; companyName: string; teaserName: string; category: string; createdAt: string; }
interface OrderItem { _id: string; customerName: string; customerBrand?: string; projectName: string; companyName?: string; customerPhone: string; isRead: boolean; createdAt: string; }
interface ContactItem { _id: string; name: string; brand?: string; phone: string; services: string[]; isRead: boolean; createdAt: string; }
interface ClientItem { _id: string; name: string; username: string; createdAt: string; }
interface MediaItem { id: string; name: string; sizeBytes: number; isUsed: boolean; isDuplicate: boolean; createdAt: string; }
interface FolderItem { _id: string; title: string; createdAt: string; }

interface ActivityItem {
  id: string;
  type: 'order' | 'contact';
  title: string;
  subtitle: string;
  phone: string;
  isRead: boolean;
  createdAt: string;
  href: string;
}

// ==========================================
// 🖼️ آیکون‌های اشتراکی (هم‌راستا با آیکون‌های سایدبار برای یکدستی بصری)
// ==========================================
const Icon = ({ path, className = "" }: { path: React.ReactNode; className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {path}
  </svg>
);

const ICONS = {
  projects: <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>,
  orders: <><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path><rect x="9" y="3" width="6" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></>,
  messages: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></>,
  clients: <><path d="M17 21v-2a4 4 0 0 0-4-4H5c-2.2 0-4 1.8-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></>,
  folders: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></>,
  storage: <><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></>,
  chart: <><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></>,
  pie: <><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></>,
  arrowLeft: <><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></>,
  sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"></path></>,
  broom: <><path d="M20 20L9 9"></path><path d="M13 5l6 6-9 9-6-6z"></path><path d="M4 20l3-3"></path></>,
};

export default function AdminDashboardPage() {
  const [time, setTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);

  // ⏱️ راه‌اندازی ساعت زنده
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // 🚀 دریافت کل دیتای پنل به‌صورت موازی
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);

      const results = await Promise.allSettled([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`, { cache: 'no-store' }).then(r => r.json()),
        fetchWithAuth('/orders').then(r => r.json()),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, { cache: 'no-store' }).then(r => r.json()),
        fetchWithAuth('/users').then(r => r.json()),
        fetchWithAuth('/media').then(r => r.json()),
        fetchWithAuth('/client-folders/all').then(r => r.json()),
      ]);

      const [pRes, oRes, cRes, uRes, mRes, fRes] = results;

      if (pRes.status === 'fulfilled' && pRes.value?.success) setProjects(pRes.value.data || []);
      if (oRes.status === 'fulfilled' && oRes.value?.success) setOrders(oRes.value.data || []);
      if (cRes.status === 'fulfilled' && cRes.value?.success) setContacts(cRes.value.data || []);
      if (uRes.status === 'fulfilled' && uRes.value?.success) setClients(uRes.value.data || []);
      if (mRes.status === 'fulfilled' && mRes.value?.success) setMedia(mRes.value.data || []);
      if (fRes.status === 'fulfilled' && fRes.value?.success) setFolders(fRes.value.data || []);

      setIsLoading(false);
    };

    load();
  }, []);

  // ==========================================
  // 📊 محاسبات مشتق‌شده از دیتای خام
  // ==========================================
  const unreadOrders = useMemo(() => orders.filter(o => !o.isRead).length, [orders]);
  const unreadContacts = useMemo(() => contacts.filter(c => !c.isRead).length, [contacts]);
  const totalStorage = useMemo(() => media.reduce((sum, m) => sum + (m.sizeBytes || 0), 0), [media]);
  const unusedMedia = useMemo(() => media.filter(m => !m.isUsed), [media]);
  const duplicateMedia = useMemo(() => media.filter(m => m.isDuplicate), [media]);

  // ترکیب سفارشات و پیام‌ها در یک فید واحد از تازه‌ترین فعالیت‌ها
  const activityFeed: ActivityItem[] = useMemo(() => {
    const fromOrders: ActivityItem[] = orders.map(o => ({
      id: o._id,
      type: 'order',
      title: o.customerName,
      subtitle: o.companyName ? `${o.projectName} • ${o.companyName}` : o.projectName,
      phone: o.customerPhone,
      isRead: o.isRead,
      createdAt: o.createdAt,
      href: '/admin/orders',
    }));
    const fromContacts: ActivityItem[] = contacts.map(c => ({
      id: c._id,
      type: 'contact',
      title: c.name,
      subtitle: c.brand ? c.brand : (c.services || []).join('، '),
      phone: c.phone,
      isRead: c.isRead,
      createdAt: c.createdAt,
      href: '/admin/contacts',
    }));
    return [...fromOrders, ...fromContacts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 7);
  }, [orders, contacts]);

  // نمودار میله‌ای فعالیت ۷ روز اخیر (مجموع سفارش + پیام هر روز)
  const weeklyActivity = useMemo(() => {
    const buckets = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return { date: d, label: new Intl.DateTimeFormat('fa-IR', { weekday: 'short' }).format(d), count: 0 };
    });
    [...orders, ...contacts].forEach(item => {
      const d = new Date(item.createdAt);
      const bucket = buckets.find(b => isSameDay(b.date, d));
      if (bucket) bucket.count++;
    });
    const max = Math.max(1, ...buckets.map(b => b.count));
    return { buckets, max };
  }, [orders, contacts]);

  // نمودار دونات دسته‌بندی پروژه‌ها
  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    projects.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = projects.length;
    let cumulative = 0;
    const segments = entries.map(([key, count], idx) => {
      const percent = total > 0 ? (count / total) * 100 : 0;
      const seg = { key, label: CATEGORY_LABELS[key] || key, count, percent, color: CHART_PALETTE[idx % CHART_PALETTE.length], offset: cumulative };
      cumulative += percent;
      return seg;
    });
    return { segments, total };
  }, [projects]);

  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = (date: Date) => new Intl.DateTimeFormat('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(date);

  // هندسه‌ی نمودار دونات
  const R = 60, C = 2 * Math.PI * R;

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 pb-16 px-4 md:px-8 mt-6" style={{ fontFamily: persianFontFamily }} dir="rtl">

      {/* ======================= هدر داشبورد و ساعت لایو ======================= */}
      <motion.div
        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/5 pb-6 md:pb-8 relative"
      >
        <div className="absolute top-0 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-white/5 rounded-full blur-[100px] md:blur-[120px] pointer-events-none"></div>

        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-zinc-500 text-xs md:text-sm font-bold">{time ? getGreeting(time) : '...'}، مدیر عزیز</span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">داشبورد</h1>
          <p className="text-zinc-400 text-xs md:text-sm mt-1 leading-relaxed">نمای کلی سیستم، آمار زنده و دسترسی سریع به ابزارهای استودیو.</p>
        </div>

        {/* ⏱️ ویجت ساعت */}
        <div className="flex flex-col items-center xl:items-end bg-[#050505] border border-white/10 rounded-2xl px-6 py-4 shadow-xl relative z-10 w-full xl:w-auto">
          <span className={`text-3xl md:text-4xl font-black text-white tracking-widest ${orbitronFont.className}`} dir="ltr">
            {time ? formatTime(time) : '00:00:00'}
          </span>
          <span className="text-zinc-500 text-xs mt-2 font-medium">
            {time ? formatDate(time) : 'در حال همگام‌سازی...'}
          </span>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6 md:gap-8 relative z-10">

        {/* ======================= کارت‌های آماری اصلی (KPI) ======================= */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">

          <StatCard variants={itemVariants} icon={ICONS.orders} label="سفارشات جدید" value={unreadOrders} isLoading={isLoading} highlight badge="زنده" />
          <StatCard variants={itemVariants} icon={ICONS.messages} label="پیام‌های خوانده‌نشده" value={unreadContacts} isLoading={isLoading} highlight badge="زنده" />
          <StatCard variants={itemVariants} icon={ICONS.projects} label="پروژه‌های منتشر شده" value={projects.length} isLoading={isLoading} />
          <StatCard variants={itemVariants} icon={ICONS.clients} label="مشتریان فعال" value={clients.length} isLoading={isLoading} />
          <StatCard variants={itemVariants} icon={ICONS.folders} label="پوشه‌های درایو" value={folders.length} isLoading={isLoading} />
          <StatCard
            variants={itemVariants}
            icon={ICONS.storage}
            label="حجم رسانه‌ها"
            isLoading={isLoading}
            customValue={formatBytes(totalStorage)}
          />
        </div>

        {/* ======================= ردیف تحلیلی: نمودار فعالیت هفتگی + دسته‌بندی پروژه‌ها ======================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* نمودار میله‌ای ۷ روز اخیر */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-center text-white">
                  <Icon path={ICONS.chart} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base md:text-lg">فعالیت هفت روز اخیر</h3>
                  <p className="text-zinc-500 text-[11px] md:text-xs">مجموع سفارشات و پیام‌های دریافتی</p>
                </div>
              </div>
              <span className={`text-zinc-500 text-xs ${englishFontFamily}`} dir="ltr">
                {toPersianDigits(orders.length + contacts.length)} کل
              </span>
            </div>

            {isLoading ? (
              <div className="h-40 md:h-48 flex items-end gap-2 md:gap-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 bg-white/5 rounded-t-lg animate-pulse" style={{ height: `${30 + (i % 3) * 15}%` }}></div>
                ))}
              </div>
            ) : (
              <div className="h-40 md:h-48 flex items-end gap-2 md:gap-4" dir="ltr">
                {weeklyActivity.buckets.map((b, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 h-full group">
                    <span className={`text-[10px] md:text-xs text-zinc-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity ${englishFontFamily}`}>
                      {toPersianDigits(b.count)}
                    </span>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(6, (b.count / weeklyActivity.max) * 100)}%` }}
                      transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.05 }}
                      className={`w-full rounded-t-lg transition-colors ${b.count > 0 ? 'bg-white group-hover:bg-zinc-200' : 'bg-white/10'}`}
                    ></motion.div>
                    <span className="text-[10px] md:text-xs text-zinc-500 font-bold">{b.label}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* نمودار دونات دسته‌بندی پروژه‌ها */}
          <motion.div variants={itemVariants} className="bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-center text-white">
                <Icon path={ICONS.pie} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base md:text-lg">دسته‌بندی پروژه‌ها</h3>
                <p className="text-zinc-500 text-[11px] md:text-xs">سهم هر نوع از کل نمونه‌کارها</p>
              </div>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center py-4">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-full border-[14px] border-white/10 animate-pulse"></div>
              </div>
            ) : categoryBreakdown.total === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                  <Icon path={ICONS.projects} />
                </div>
                <p className="text-zinc-500 text-xs">هنوز پروژه‌ای ثبت نشده</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center py-2">
                  <div className="relative w-32 h-32 md:w-36 md:h-36">
                    <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                      <circle cx="70" cy="70" r={R} fill="none" stroke="#050505" strokeWidth="14" />
                      {categoryBreakdown.segments.map(seg => (
                        <circle
                          key={seg.key}
                          cx="70" cy="70" r={R} fill="none"
                          stroke={seg.color}
                          strokeWidth="14"
                          strokeDasharray={`${(seg.percent / 100) * C} ${C}`}
                          strokeDashoffset={-(seg.offset / 100) * C}
                          strokeLinecap="butt"
                        />
                      ))}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-2xl md:text-3xl font-black text-white ${englishFontFamily}`}>{toPersianDigits(categoryBreakdown.total)}</span>
                      <span className="text-zinc-500 text-[10px]">پروژه</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  {categoryBreakdown.segments.map(seg => (
                    <div key={seg.key} className="flex items-center justify-between text-xs md:text-sm">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                        <span className="text-zinc-300 truncate">{seg.label}</span>
                      </div>
                      <span className={`text-zinc-500 shrink-0 ${englishFontFamily}`} dir="ltr">{toPersianDigits(seg.count)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        </div>

        {/* ======================= ردیف پایین: فید فعالیت + وضعیت فضای ذخیره‌سازی ======================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* فید فعالیت اخیر (ترکیب سفارشات و پیام‌ها) */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base md:text-lg">آخرین درخواست‌ها</h3>
              <Link href="/admin/orders" className="text-zinc-500 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5">
                مشاهده همه
                <Icon path={ICONS.arrowLeft} className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 w-full bg-white/5 rounded-2xl animate-pulse"></div>)}
              </div>
            ) : activityFeed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500">
                  <Icon path={ICONS.messages} />
                </div>
                <p className="text-zinc-500 text-xs">هنوز درخواستی ثبت نشده</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <AnimatePresence>
                  {activityFeed.map((item) => (
                    <motion.div key={`${item.type}-${item.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all duration-300 group"
                      >
                        <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border transition-colors ${item.isRead ? 'bg-[#050505] border-white/10 text-zinc-500' : 'bg-white border-white text-black'}`}>
                          <Icon path={item.type === 'order' ? ICONS.orders : ICONS.messages} className="w-[18px] h-[18px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-bold text-sm truncate">{item.title}</h4>
                            {!item.isRead && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0"></span>}
                          </div>
                          <p className="text-zinc-500 text-[11px] md:text-xs truncate mt-0.5">{item.subtitle}</p>
                        </div>
                        <span className="text-zinc-600 text-[10px] md:text-xs shrink-0 group-hover:text-zinc-400 transition-colors whitespace-nowrap">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* وضعیت فضای ذخیره‌سازی */}
          <motion.div variants={itemVariants} className="bg-[#111111] border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#050505] border border-white/10 flex items-center justify-center text-white">
                <Icon path={ICONS.storage} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base md:text-lg">فضای ذخیره‌سازی</h3>
                <p className="text-zinc-500 text-[11px] md:text-xs">وضعیت فایل‌های ویدیویی سرور</p>
              </div>
            </div>

            {isLoading ? (
              <div className="h-24 bg-white/5 rounded-2xl animate-pulse"></div>
            ) : (
              <>
                <div className="flex items-end justify-between border-b border-white/5 pb-5">
                  <div className="flex flex-col gap-1">
                    <span className={`text-3xl md:text-4xl font-black text-white ${englishFontFamily}`} dir="ltr">{formatBytes(totalStorage)}</span>
                    <span className="text-zinc-500 text-xs">حجم کل استفاده‌شده</span>
                  </div>
                  <span className={`text-zinc-400 text-sm font-bold ${englishFontFamily}`} dir="ltr">{toPersianDigits(media.length)} فایل</span>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                        <Icon path={ICONS.broom} className="w-4 h-4" />
                      </div>
                      <span className="text-zinc-300 text-xs md:text-sm">فایل‌های استفاده‌نشده</span>
                    </div>
                    <span className={`text-white font-bold text-sm ${englishFontFamily}`}>{toPersianDigits(unusedMedia.length)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                        <Icon path={ICONS.sparkle} className="w-4 h-4" />
                      </div>
                      <span className="text-zinc-300 text-xs md:text-sm">فایل‌های تکراری</span>
                    </div>
                    <span className={`text-white font-bold text-sm ${englishFontFamily}`}>{toPersianDigits(duplicateMedia.length)}</span>
                  </div>
                </div>

                <Link
                  href="/admin/media"
                  className="w-full h-11 flex items-center justify-center gap-2 bg-[#050505] hover:bg-white hover:text-black text-zinc-300 text-xs md:text-sm font-bold rounded-xl border border-white/10 hover:border-white transition-all duration-300"
                >
                  مدیریت فضای ذخیره‌سازی
                </Link>
              </>
            )}
          </motion.div>
        </div>

        {/* ======================= دسترسی سریع (Quick Actions) ======================= */}
        <div className="mt-2 md:mt-4">
          <h3 className="text-white font-bold text-lg md:text-xl mb-4 md:mb-6">عملیات سریع</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

            <motion.div variants={itemVariants}>
              <Link href="/admin/projects/new" className="flex flex-col justify-between h-32 md:h-40 bg-[#050505] border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 group transition-all duration-300 hover:bg-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">آپلود پروژه جدید</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs">اضافه کردن نمونه کار به سایت</p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link href="/admin/projects" className="flex flex-col justify-between h-32 md:h-40 bg-[#050505] border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 group transition-all duration-300 hover:bg-white/5">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">مدیریت نمونه‌کارها</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs">ویرایش، حذف و تغییر اولویت‌ها</p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link href="/admin/orders" className="flex flex-col justify-between h-32 md:h-40 bg-[#050505] border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 group transition-all duration-300 hover:bg-white/5 relative overflow-hidden">
                {unreadOrders > 0 && (
                  <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {formatCompact(unreadOrders)}
                  </span>
                )}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <Icon path={ICONS.orders} className="w-[18px] h-[18px]" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">مدیریت سفارشات</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs">پیگیری لیدهای ثبت‌شده</p>
                </div>
              </Link>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link href="/admin/contacts" className="flex flex-col justify-between h-32 md:h-40 bg-[#050505] border border-white/10 hover:border-white/30 rounded-2xl p-4 md:p-5 group transition-all duration-300 hover:bg-white/5 relative overflow-hidden">
                {unreadContacts > 0 && (
                  <span className="absolute top-4 left-4 bg-white text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {formatCompact(unreadContacts)}
                  </span>
                )}
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-colors">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1">صندوق پیام‌ها</h4>
                  <p className="text-zinc-500 text-[10px] md:text-xs">بررسی درخواست‌های سایت</p>
                </div>
              </Link>
            </motion.div>

          </div>
        </div>

      </motion.div>
    </div>
  );
}

// ==========================================
// 🧩 کامپوننت کارت آماری KPI
// ==========================================
function StatCard({
  variants, icon, label, value, customValue, isLoading, highlight = false, badge,
}: {
  variants: any; icon: React.ReactNode; label: string; value?: number; customValue?: string;
  isLoading: boolean; highlight?: boolean; badge?: string;
}) {
  return (
    <motion.div
      variants={variants}
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl p-4 md:p-6 group transition-all duration-300 ${
        highlight
          ? 'bg-white border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.08)] md:shadow-[0_0_35px_rgba(255,255,255,0.12)]'
          : 'bg-[#111111] border border-white/5'
      }`}
    >
      <div className={`absolute -left-8 -top-8 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-colors ${highlight ? 'bg-black/5' : 'bg-white/5 group-hover:bg-white/10'}`}></div>

      <div className="flex justify-between items-start mb-3 md:mb-5 relative z-10">
        <div className={`w-8 h-8 md:w-11 md:h-11 rounded-lg md:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${highlight ? 'bg-black/5 border border-black/10 text-black' : 'bg-[#050505] border border-white/10 text-white'}`}>
          <Icon path={icon} className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        {badge && (value ?? 0) > 0 && (
          <span className={`px-2 py-0.5 rounded-md text-[9px] md:text-[10px] font-bold animate-pulse ${highlight ? 'text-black bg-black/10' : 'text-white bg-white/10'}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 relative z-10">
        <span className={`text-[10px] md:text-xs font-bold ${highlight ? 'text-black/60' : 'text-zinc-400'}`}>{label}</span>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`h-8 md:h-11 w-14 rounded-lg animate-pulse mt-1.5 ${highlight ? 'bg-black/10' : 'bg-white/10'}`}></motion.div>
          ) : (
            <motion.span
              key="val"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className={`text-2xl md:text-4xl font-black tracking-tighter mt-1 ${englishFontFamily} ${highlight ? 'text-black' : 'text-white'}`}
              dir="ltr"
            >
              {customValue !== undefined ? customValue : formatCompact(value || 0)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
