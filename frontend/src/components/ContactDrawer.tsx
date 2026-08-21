"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const englishFontFamily = '"Outfit", sans-serif';
const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

interface ContactDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMenu: () => void;
}

// 🚀 انیمیشن پرمیوم و روان
const premiumEase = [0.76, 0, 0.24, 1];

// 🚀 لیست خدمات استودیو
const SERVICES_LIST = [
  'تیزر تبلیغاتی',
  'تولید محتوا',
  'معرفی محصول',
  'معرفی خدمات',
  'اجرای کمپین',
  'طراحی سایت'
];

export default function ContactDrawer({ isOpen, onClose, onOpenMenu }: ContactDrawerProps) {
  const [step, setStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    services: [] as string[],
    phone: '',
    email: '',
    message: ''
  });

  // 🚀 رجکس‌های استاندارد
  const isNameValid = formData.name.trim().length >= 3;
  const isPhoneValid = /^09[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''));
  const isEmailValid = formData.email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIsSubmitted(false);
      setIsSending(false);
      setFormData({ name: '', brand: '', services: [], phone: '', email: '', message: '' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [step, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleService = (service: string) => {
    setFormData(prev => {
      const isSelected = prev.services.includes(service);
      return {
        ...prev,
        services: isSelected 
          ? prev.services.filter(s => s !== service) 
          : [...prev.services, service]
      };
    });
  };

  const nextStep = (targetStep: number) => {
    setStep(targetStep);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, targetStep: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // بررسی می‌کنیم که تو همون مرحله اطلاعات معتبر باشه بعد بره مرحله بعد
      if (step === 1 && !isNameValid) return;
      if (step === 3 && (!isPhoneValid || !isEmailValid)) return;
      
      nextStep(targetStep);
    }
  };

  const handleMenuClick = () => {
    onClose(); 
    setTimeout(() => {
      onOpenMenu(); 
    }, 500); 
  };

  const handleSubmit = async () => {
    if (!isNameValid || formData.services.length === 0 || !isPhoneValid || !isEmailValid) return;
    setIsSending(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert('خطا در ثبت اطلاعات: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      // setIsSubmitted(true); 
      alert('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex w-full h-full text-white bg-transparent overflow-hidden" dir="ltr" style={{ fontFamily: englishFontFamily }}>
          
          {/* لایه تاریک‌کننده (Blur Overlay) */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: premiumEase }}
            className="fixed inset-0 bg-black/70 cursor-pointer z-10"
            onClick={onClose}
          />

          {/* پنل فرم لاکچری و مینیمال */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.8, ease: premiumEase }}
            className="relative w-full md:w-[60%] lg:w-[42%] h-full bg-[#030303] shadow-[30px_0_100px_rgba(0,0,0,0.9)] flex flex-col z-20 border-r border-white/10"
          >
            
            {/* Header */}
            <div className="w-full flex items-center justify-between py-6 px-6 md:px-10 shrink-0 border-b border-white/5">
              <button 
                onClick={handleMenuClick}
                className="group flex items-center gap-3 text-zinc-500 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transform transition-transform group-hover:-translate-x-1.5">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span className="font-semibold tracking-[0.3em] text-[10px] uppercase">Menu</span>
              </button>
              {/* 🚀 متن بزرگ‌تر و برجسته‌تر شد */}
              <div className="text-zinc-100 font-black tracking-[0.15em] text-xl md:text-2xl uppercase" style={{ fontFamily: englishFontFamily }}>
                CONTACT US
              </div>
            </div>

            {/* بدنه اسکرول‌خور */}
            <div ref={scrollContainerRef} className="flex-1 w-full overflow-y-auto hide-scrollbar px-6 md:px-12 py-8 md:py-10" dir="rtl" style={{ fontFamily: persianFontFamily }}>
              <AnimatePresence mode="wait">
                {isSubmitted ? (
                  // حالت سینمایی موفقیت
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: premiumEase }}
                    className="flex flex-col items-center justify-center h-full text-center mt-20"
                    dir="ltr"
                  >
                    <div className="relative mb-10">
                      <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, ease: premiumEase }}
                        className="w-24 h-24 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-900/20 backdrop-blur-md"
                      >
                        <svg viewBox="0 0 50 50" className="w-12 h-12">
                          <motion.path
                            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: premiumEase, delay: 0.3 }}
                            d="M15 26l7 7 14-14" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    </div>
                    <motion.h2 
                      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: premiumEase }}
                      className="text-[32px] md:text-[45px] font-black tracking-tight leading-none mb-4 text-white"
                    >
                      MESSAGE RECEIVED.
                    </motion.h2>
                    <motion.p 
                      initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.8, ease: premiumEase }}
                      className="text-zinc-400 text-sm md:text-base font-light mb-12 tracking-wide" dir="rtl" style={{ fontFamily: persianFontFamily }}
                    >
                      پیام شما با موفقیت دریافت شد.<br/>به زودی جهت هماهنگی با شما ارتباط می‌گیریم.
                    </motion.p>
                    <motion.button 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                      onClick={onClose} 
                      className="px-8 py-3 bg-white text-black rounded-full text-xs font-bold tracking-[0.25em] uppercase transition-all hover:bg-zinc-200"
                    >
                      Close
                    </motion.button>
                  </motion.div>
                ) : (
                  
                  // مراحل آبشاری (حذف layout از موشن‌ها برای جلوگیری از پرش‌های انیمیشنی)
                  <div className="flex flex-col gap-12 pb-16">
                    
                    {/* مرحله 1 */}
                    <div className={`flex flex-col gap-5 transition-opacity duration-300 focus-within:opacity-100 ${step > 1 ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-600 font-mono text-sm">01</span>
                        <h3 className="text-zinc-200 text-lg md:text-xl font-medium tracking-wide">نام و نشان شما</h3>
                      </div>
                      <div className="flex flex-col md:flex-row gap-5">
                        <input 
                          type="text" name="name" value={formData.name} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 2)}
                          className="flex-1 bg-transparent border-b border-zinc-800 focus:border-white text-white text-base md:text-lg py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors font-light"
                          placeholder="نام و نام خانوادگی *"
                        />
                        <input 
                          type="text" name="brand" value={formData.brand} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 2)}
                          className="flex-1 bg-transparent border-b border-zinc-800 focus:border-white text-white text-base md:text-lg py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors font-light"
                          placeholder="نام برند یا شرکت"
                        />
                      </div>
                      {step === 1 && (
                        <button 
                          onClick={() => nextStep(2)} disabled={!isNameValid}
                          className="self-end px-6 py-2.5 bg-white text-black rounded-full font-semibold text-xs tracking-wider uppercase disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-zinc-200"
                        >
                          تایید و ادامه
                        </button>
                      )}
                    </div>

                    {/* مرحله 2: خدمات */}
                    {step >= 2 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: premiumEase }} className={`flex flex-col gap-5 transition-opacity duration-300 ${step > 2 ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-600 font-mono text-sm">02</span>
                          <h3 className="text-zinc-200 text-lg md:text-xl font-medium tracking-wide">به چه خدماتی نیاز دارید؟ *</h3>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {SERVICES_LIST.map((srv) => {
                            const isSelected = formData.services.includes(srv);
                            return (
                              <button
                                key={srv}
                                onClick={() => toggleService(srv)}
                                className={`px-4 py-2 rounded-full border transition-all duration-300 text-xs md:text-sm tracking-wide ${
                                  isSelected 
                                    ? 'bg-white border-white text-black font-semibold shadow-[0_0_15px_rgba(255,255,255,0.25)]' 
                                    : 'bg-transparent border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white'
                                }`}
                              >
                                {srv}
                              </button>
                            );
                          })}
                        </div>
                        {step === 2 && (
                          <button 
                            onClick={() => nextStep(3)} disabled={formData.services.length === 0}
                            className="self-end px-6 py-2.5 bg-white text-black rounded-full font-semibold text-xs tracking-wider uppercase disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-zinc-200"
                          >
                            مرحله بعد
                          </button>
                        )}
                      </motion.div>
                    )}

                    {/* مرحله 3: تماس */}
                    {step >= 3 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: premiumEase }} className={`flex flex-col gap-5 transition-opacity duration-300 focus-within:opacity-100 ${step > 3 ? 'opacity-35 hover:opacity-100' : 'opacity-100'}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-600 font-mono text-sm">03</span>
                          <h3 className="text-zinc-200 text-lg md:text-xl font-medium tracking-wide">راه‌های ارتباطی</h3>
                        </div>
                        <div className="flex flex-col md:flex-row gap-5">
                          <div className="flex-1">
                            <input 
                              type="tel" name="phone" dir="ltr" value={formData.phone} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 4)}
                              className={`w-full bg-transparent border-b ${formData.phone.trim() !== '' && !isPhoneValid ? 'border-red-500/50' : 'border-zinc-800'} focus:border-white text-white text-base md:text-lg py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors text-right font-light`}
                              placeholder="شماره موبایل *"
                            />
                            {formData.phone.trim() !== '' && !isPhoneValid && (
                              <p className="text-red-500/70 text-xs mt-1">فرمت موبایل صحیح نیست (مثال: 09120000000)</p>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <input 
                              type="email" name="email" dir="ltr" value={formData.email} onChange={handleChange} onKeyDown={(e) => handleKeyDown(e, 4)}
                              className={`w-full bg-transparent border-b ${formData.email.trim() !== '' && !isEmailValid ? 'border-red-500/50' : 'border-zinc-800'} focus:border-white text-white text-base md:text-lg py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors text-right font-light`}
                              placeholder="آدرس ایمیل"
                            />
                            {formData.email.trim() !== '' && !isEmailValid && (
                              <p className="text-red-500/70 text-xs mt-1">فرمت ایمیل صحیح نیست</p>
                            )}
                          </div>
                        </div>
                        {step === 3 && (
                          <button 
                            onClick={() => nextStep(4)} disabled={!isPhoneValid || !isEmailValid}
                            className="self-end px-6 py-2.5 bg-white text-black rounded-full font-semibold text-xs tracking-wider uppercase disabled:opacity-20 disabled:cursor-not-allowed transition-all hover:bg-zinc-200"
                          >
                            مرحله آخر
                          </button>
                        )}
                      </motion.div>
                    )}

                    {/* مرحله 4: پیام */}
                    {step >= 4 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: premiumEase }} className="flex flex-col gap-5">
                        <div className="flex items-center gap-3">
                          <span className="text-zinc-600 font-mono text-sm">04</span>
                          <h3 className="text-zinc-200 text-lg md:text-xl font-medium tracking-wide">توضیحات تکمیلی</h3>
                        </div>
                        <textarea 
                          name="message" value={formData.message} onChange={handleChange}
                          rows={3}
                          className="w-full bg-transparent border-b border-zinc-800 focus:border-white text-white text-base py-2.5 focus:outline-none placeholder:text-zinc-700 transition-colors resize-none font-light leading-relaxed"
                          placeholder="جزئیات پروژه‌تون رو بنویسید..."
                        />
                        
                        <div className="flex justify-end pt-4">
                          <button 
                            onClick={handleSubmit} 
                            disabled={!isNameValid || formData.services.length === 0 || !isPhoneValid || !isEmailValid || isSending}
                            className="px-8 py-3.5 bg-white text-black rounded-full font-bold text-sm tracking-wider uppercase disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-2.5 hover:bg-zinc-200 shadow-[0_0_25px_rgba(255,255,255,0.15)]"
                          >
                            {isSending ? (
                              <><span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span> در حال ارسال</>
                            ) : (
                              'ارسال درخواست'
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}