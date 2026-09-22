"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { orbitronFont } from '@/app/fonts';
import Link from 'next/link';
import { saveAdminToken, safeSetLocal, setAuthCookie } from '@/utils/adminAuth';


const persianFontFamily = '"AzarMehr", "OpenAI Sans", sans-serif';

const premiumEase = [0.76, 0, 0.24, 1];

const cColor = "#888888";                
const studioColor = "#FFFFFF";          
const logoHoverColor = "#FFFFFF";       
const cLogoWidth = "43px";              
const cLogoHeight = "52px";             
const cThickness = "10px";              
const studioFontSize = "25px";          
const studioOverlap = "-13px";          

export default function LoginPage() {
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'client'>('admin');

  // مقصد بعد از ورود: middleware مسیر درخواستی را در پارامتر redirect می‌گذارد.
  // از window.location خوانده می‌شود (نه useSearchParams) تا این صفحه استاتیک بماند.
  // فقط مسیرهای داخلی پذیرفته می‌شوند تا امکان ریدایرکت به سایت بیرونی وجود نداشته باشد.
  const getRedirectTarget = (fallback: string, prefix: string) => {
    try {
      const target = new URLSearchParams(window.location.search).get('redirect');
      if (target && target.startsWith(prefix) && !target.startsWith('//')) return target;
    } catch {
      // noop
    }
    return fallback;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const endpoint = loginType === 'admin' 
  ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login` 
  : `${process.env.NEXT_PUBLIC_API_URL}/auth/client/login`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        if (loginType === 'admin') {
          // توکن هم‌زمان در localStorage و کوکی ذخیره می‌شود تا API و middleware هماهنگ بمانند
          saveAdminToken(data.token);
          router.replace(getRedirectTarget('/admin', '/admin'));
        } else {
          safeSetLocal('token', data.token);
          safeSetLocal('clientInfo', JSON.stringify(data.client));
          setAuthCookie('clientToken', data.token);
          router.replace(getRedirectTarget('/client/dashboard', '/client'));
        }
      } else {
        setError(data.message || 'اطلاعات ورود اشتباه است.');
      }
    } catch (err) {
      setError('ارتباط با سرور برقرار نشد.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: premiumEase } }
  };

  return (
    <div 
      className="relative min-h-screen w-full flex items-center justify-center bg-[#030303] overflow-hidden px-4"
      style={{ fontFamily: persianFontFamily }}
      dir="rtl"
    >
      <style jsx global>{`
        @font-face {
          font-family: 'AzarMehr';
          src: url('/fonts/AzarMehr/Static/woff2/400-AzarMehr-FD-Regular.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
        }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 50px #0a0a0a inset;
          -webkit-text-fill-color: white;
        }
      `}</style>

      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] bg-zinc-800/30 rounded-full blur-[100px] md:blur-[140px] pointer-events-none" 
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: premiumEase }}
        className="relative z-10 w-full max-w-[440px] p-8 md:p-14 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-zinc-800/50 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
      >
        
        <div className="flex flex-col items-center mb-12">
          <Link href="/" className="group relative flex items-center cursor-pointer mb-8" dir="ltr">
            <div className="flex items-center">
              <div 
                className="relative transition-colors duration-500 group-hover:text-[var(--hover-color)]"
                style={{ color: cColor, width: cLogoWidth, height: cLogoHeight, '--hover-color': logoHoverColor } as React.CSSProperties}
              >
                <div 
                  className="absolute inset-0 border-current rounded-l-full border-y border-l transition-colors duration-500"
                  style={{ borderRight: 'none', borderWidth: cThickness }}
                />
              </div>
              <span 
                className={`transition-colors duration-500 group-hover:text-[var(--hover-color)] tracking-widest font-black leading-none ${orbitronFont.className}`}
                style={{ color: studioColor, fontSize: studioFontSize, marginLeft: studioOverlap, '--hover-color': logoHoverColor } as React.CSSProperties}
              >
                STUDIO
              </span>
            </div>
          </Link>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: premiumEase }}
            className="text-white text-2xl md:text-3xl font-black mb-3 tracking-tight"
          >
            ورود به پنل
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="text-zinc-500 text-sm font-light text-center"
          >
            برای دسترسی به اطلاعات، حساب کاربری خود را انتخاب کنید.
          </motion.p>
        </div>

        <motion.form 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleLogin} 
          className="flex flex-col gap-8"
        >
          <motion.div variants={itemVariants} className="relative flex bg-zinc-900/50 p-1.5 rounded-2xl border border-zinc-800/80">
            {['admin', 'client'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setLoginType(type as 'admin' | 'client')}
                className={`relative flex-1 py-3.5 text-xs font-bold rounded-xl transition-colors duration-500 z-10 ${
                  loginType === type ? 'text-black' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {loginType === type && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-xl -z-10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.6 }}
                  />
                )}
                {type === 'admin' ? 'مدیر کل' : 'کارفرما'}
              </button>
            ))}
          </motion.div>
          
          <motion.div variants={itemVariants} className="group flex flex-col gap-2 relative">
            <label className="text-zinc-500 text-xs font-bold uppercase tracking-widest transition-colors group-focus-within:text-white">
              نام کاربری
            </label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={loginType === 'admin' ? "مثال: admin" : "مثال: nike_brand"}
              className="w-full bg-transparent border-b border-zinc-800 text-white text-lg py-3 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 font-light"
              required
              dir="ltr"
            />
          </motion.div>

          <motion.div variants={itemVariants} className="group flex flex-col gap-2 relative">
            <label className="text-zinc-500 text-xs font-bold uppercase tracking-widest transition-colors group-focus-within:text-white">
              رمز عبور
            </label>
            <div className="relative w-full" dir="ltr">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-zinc-800 text-white text-lg py-3 pr-12 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-700 font-light tracking-widest"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors focus:outline-none p-2"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                )}
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10, height: 0 }} 
                animate={{ opacity: 1, y: 0, height: 'auto' }} 
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ duration: 0.4, ease: premiumEase }}
                className="overflow-hidden"
              >
                <div className="text-red-400 text-xs font-bold text-center mt-2 bg-red-500/10 py-3 rounded-xl border border-red-500/20">
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="mt-4">
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative w-full h-[60px] flex items-center justify-center bg-white text-black rounded-2xl font-black text-sm uppercase tracking-[0.1em] overflow-hidden transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-zinc-200 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.76,0,0.24,1]" />
              
              <div className="relative z-10 flex items-center gap-3">
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>در حال احراز هویت ...</span>
                  </>
                ) : (
                  <>
                    <span>ورود به سیستم</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="transform transition-transform duration-500 group-hover:-translate-x-1">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </>
                )}
              </div>
            </button>
          </motion.div>

        </motion.form>
      </motion.div>
    </div>
  );
}