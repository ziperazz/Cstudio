"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchWithAuth } from '@/utils/api'; 
import { orbitronFont, outfitFont } from '@/app/fonts';



const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

const toPersianDigits = (num: number | string) => {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/[0-9]/g, (char) => persianNumbers[parseInt(char)]);
};

const toShamsiDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const shamsi = new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
    return toPersianDigits(shamsi);
  } catch (error) {
    return 'تاریخ نامشخص';
  }
};

const generateRandomPassword = () => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789"; 
  let pass = "";
  for (let i = 0; i < 6; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 30 } }
};

interface ClientUser {
  _id: string;
  name: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function ClientManagementPage() {
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // استیت‌های مدال تغییر رمز عبور
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  const fetchClients = async () => {
    try {
      const res = await fetchWithAuth('/users'); 
      const data = await res.json();
      if (data.success) setClients(data.data || []);
    } catch (err) {
      console.error('خطا در دریافت کارفرمایان', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsSubmitting(true);

    try {
      const res = await fetchWithAuth('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('اکانت کارفرما ایجاد شد!');
        setFormData({ name: '', username: '', password: '' });
        fetchClients();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'خطا در ثبت کاربر');
      }
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('آیا از حذف این کارفرما اطمینان دارید؟ تمام دسترسی‌های او قطع خواهد شد.')) return;
    try {
      const res = await fetchWithAuth(`/users/${id}`, { method: 'DELETE' });
      if (res.ok) setClients(clients.filter(u => u._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= توابع تغییر رمز =================
  const openPasswordModal = (id: string) => {
    setSelectedUserId(id);
    setNewPassword(generateRandomPassword()); // پیشنهاد یک رمز جدید
    setIsPasswordModalOpen(true);
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('رمز عبور باید حداقل ۶ کاراکتر باشد.');
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      const res = await fetchWithAuth(`/users/${selectedUserId}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('✅ رمز عبور با موفقیت تغییر کرد.');
        setIsPasswordModalOpen(false);
      } else {
        alert(data.message || '❌ خطا در تغییر رمز عبور');
      }
    } catch (err) {
      alert('❌ خطای ارتباط با سرور');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <>
      <motion.div 
        className="w-full flex flex-col gap-6 md:gap-10 pb-16 px-4 md:px-8 mt-6"
        style={{ fontFamily: persianFontFamily }}
        variants={containerVariants} initial="hidden" animate="show" dir="rtl"
      >
        {/* ======================= تیتر صفحه و سرچ ======================= */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6 md:pb-8">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">مدیریت کارفرمایان</h1>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl font-light">
              اکانت‌های اختصاصی بسازید تا کارفرمایان بتوانند به صورت امن و حرفه‌ای فایل‌های خود را دریافت کنند.
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" placeholder="جستجوی نام یا آیدی کارفرما..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111111] border border-white/5 rounded-2xl py-3.5 pr-12 pl-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/30 focus:bg-[#151515] transition-all"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 items-start relative">
          
          {/* ======================= فرم افزودن مشتری ======================= */}
          <motion.div variants={itemVariants} className="xl:col-span-5 2xl:col-span-4 xl:sticky xl:top-24 z-20">
            <form onSubmit={handleSubmit} className="bg-[#111111] border border-white/5 rounded-[24px] p-6 md:p-8 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-2 relative z-10">
                <h2 className="text-white font-bold text-lg flex items-center gap-3">
                  <div className="w-2 h-8 bg-white rounded-full"></div>
                  ثبت کارفرمای جدید
                </h2>
                <span className={`text-xs text-zinc-500 uppercase tracking-widest font-bold ${outfitFont.className}`}>New Client</span>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">نام کارفرما یا برند</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="مثال: برند نایکی"
                  className="w-full h-14 px-4 bg-[#050505] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/40 transition-all text-sm"
                />
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <label className="text-zinc-400 text-xs font-bold tracking-wide pr-1">نام کاربری (حروف انگلیسی)</label>
                <input 
                  type="text" name="username" value={formData.username} onChange={handleChange} required dir="ltr" placeholder="nike_brand"
                  className={`w-full h-14 px-4 bg-[#050505] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/40 transition-all text-sm tracking-tight ${outfitFont.className}`}
                />
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex justify-between items-end pr-1 pl-1">
                  <label className="text-zinc-400 text-xs font-bold tracking-wide">رمز عبور امن</label>
                  <button type="button" onClick={() => setFormData(p => ({ ...p, password: generateRandomPassword() }))} className="text-[10px] text-white/50 hover:text-white font-bold transition-colors bg-white/5 px-2 py-1 rounded-md cursor-pointer">
                    تولید رمز ساده
                  </button>
                </div>
                <input 
                  type="text" name="password" value={formData.password} onChange={handleChange} required dir="ltr" placeholder="حداقل ۶ کاراکتر"
                  className={`w-full h-14 px-4 bg-[#050505] border border-zinc-800 rounded-xl text-white placeholder:text-zinc-700 focus:outline-none focus:border-white/40 transition-all text-sm tracking-[0.2em] font-bold ${outfitFont.className}`}
                />
              </div>

              <AnimatePresence>
                {error && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-center gap-3 font-medium relative z-10">{error}</motion.div>}
                {success && <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-4 rounded-xl flex items-center gap-3 font-medium relative z-10">{success}</motion.div>}
              </AnimatePresence>

              {/* 🎯 حل مشکل فونت در دکمه (font-black به font-bold تغییر کرد) */}
              <button 
                type="submit" disabled={isSubmitting}
                className="w-full h-14 mt-2 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-sm md:text-base relative z-10 cursor-pointer"
              >
                {isSubmitting ? 'درحال ثبت...' : 'ایجاد اکانت کارفرما'}
              </button>
            </form>
          </motion.div>

          {/* ======================= لیست کارفرمایان ======================= */}
          <motion.div variants={itemVariants} className="xl:col-span-7 2xl:col-span-8 flex flex-col gap-6">
            
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-white font-bold text-lg flex items-center gap-3">
                حساب‌های کاربری
                {!isLoading && filteredClients.length > 0 && <span className={`bg-zinc-800 text-white text-xs px-2.5 py-1 rounded-md ${outfitFont.className}`}>{toPersianDigits(filteredClients.length)}</span>}
              </h2>
            </div>

            {isLoading ? (
              <div className="w-full flex flex-col gap-4 animate-pulse">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-[90px] w-full bg-[#111111] border border-white/5 rounded-[20px]" />)}
              </div>
            ) : filteredClients.length === 0 ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#111111] border border-white/5 rounded-[24px] p-12 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <p className="text-white font-bold text-lg mb-2">هیچ اکانتی یافت نشد</p>
                <p className="text-zinc-500 text-sm font-light">از فرم سمت راست برای ساخت اولین اکانت استفاده کنید.</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence mode="popLayout">
                  {filteredClients.map((client) => (
                    <motion.div 
                      key={client._id} layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15 } }}
                      className="bg-[#111111] border border-white/5 hover:border-white/10 rounded-[20px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          <div className={`w-14 h-14 rounded-full bg-[#050505] flex items-center justify-center text-white text-lg font-black border border-zinc-800 group-hover:bg-zinc-800 transition-colors ${orbitronFont.className} uppercase`}>
                            {client.name.charAt(0)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="text-white font-bold text-base md:text-lg">{client.name}</h3>
                          <div className="flex items-center gap-3">
                            <p className={`text-zinc-500 text-[11px] md:text-xs tracking-wider ${outfitFont.className}`}>@{client.username}</p>
                            <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                            <span className="text-[10px] md:text-xs text-zinc-600 font-light">ثبت در {toShamsiDate(client.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* 🎯 دکمه‌های عملیات (تغییر رمز اضافه شد) */}
                      <div className="flex items-center w-full sm:w-auto justify-end border-t border-zinc-800 sm:border-0 pt-4 sm:pt-0 gap-2">
                        <button 
                          onClick={() => openPasswordModal(client._id)}
                          className="w-11 h-11 rounded-xl bg-[#050505] hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-all duration-300 border border-zinc-800 hover:border-white/20 cursor-pointer group/btn-pass"
                          title="تغییر رمز عبور"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/btn-pass:scale-110 transition-transform"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        </button>

                        <button 
                          onClick={() => handleDelete(client._id)}
                          className="w-11 h-11 rounded-xl bg-[#050505] hover:bg-red-500/10 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-all duration-300 border border-zinc-800 hover:border-red-500/20 cursor-pointer group/btn-del"
                          title="حذف کامل کارفرما"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/btn-del:scale-110 transition-transform"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ======================= مدال تغییر رمز عبور ======================= */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ fontFamily: persianFontFamily }} dir="rtl">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsPasswordModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111111] border border-white/10 rounded-[24px] p-6 w-full max-w-sm relative z-10 shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <h3 className="text-white font-bold text-lg">تغییر رمز عبور</h3>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-2 rounded-xl">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-zinc-400 text-xs font-bold">رمز عبور جدید</label>
                <div className="relative">
                  <input 
                    type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} dir="ltr"
                    className={`w-full h-12 pl-4 pr-24 text-left bg-[#050505] border border-zinc-800 rounded-xl text-white focus:border-white/40 focus:outline-none transition-all text-sm tracking-[0.2em] font-bold ${outfitFont.className}`} 
                  />
                  <button 
                    onClick={() => setNewPassword(generateRandomPassword())} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    تولید رمز
                  </button>
                </div>
              </div>

              <button 
                onClick={handleUpdatePassword} disabled={isUpdatingPassword} 
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold h-12 rounded-xl mt-2 transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {isUpdatingPassword ? 'درحال ذخیره...' : 'ذخیره رمز جدید'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}