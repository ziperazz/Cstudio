"use client";

/**
 * مدیریت متمرکز توکن‌های ورود.
 *
 * چرا این فایل لازم شد؟ توکن هم در localStorage نگه داشته می‌شد (برای ارسال به API)
 * و هم در کوکی (برای middleware سمت سرور)، ولی این دو جای مختلف هماهنگ نبودند:
 * مثلاً موقع خروج فقط localStorage پاک می‌شد و کوکی تا یک هفته باقی می‌ماند.
 * نتیجه این بود که middleware کاربر را «لاگین‌شده» می‌دید و به صفحه‌ی ورود ریدایرکت نمی‌کرد.
 * همچنین در سافاری (حالت Private یا وقتی دسترسی به استوریج مسدود است)
 * خواندن localStorage استثنا پرتاب می‌کند و کل منطق ریدایرکت از کار می‌افتاد.
 */

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // ۷ روز

/** خواندن امن از localStorage؛ در سافاری ممکن است استثنا پرتاب کند */
export function safeGetLocal(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSetLocal(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // در حالت Private سافاری ممکن است شکست بخورد؛ کوکی به‌عنوان جایگزین کار می‌کند
  }
}

export function safeRemoveLocal(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // noop
  }
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setAuthCookie(name: string, value: string) {
  if (typeof document === 'undefined') return;
  // SameSite=Lax درست‌ترین گزینه برای جریان ورود است؛ Strict باعث می‌شد کوکی در
  // بعضی ناوبری‌های سافاری همراه درخواست نرود. Secure فقط روی HTTPS ست می‌شود.
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearAuthCookie(name: string) {
  if (typeof document === 'undefined') return;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
  // نسخه‌ی بدون SameSite هم پاک می‌شود تا کوکی‌های قدیمی جا نمانند
  document.cookie = `${name}=; path=/; max-age=0`;
}

/** توکن ادمین را از هر جایی که موجود باشد برمی‌گرداند (اول کوکی، بعد localStorage) */
export function getAdminToken(): string | null {
  return getCookie('adminToken') || safeGetLocal('adminToken');
}

/** ذخیره‌ی توکن ادمین در هر دو جا، تا middleware و API هر دو آن را ببینند */
export function saveAdminToken(token: string) {
  safeSetLocal('adminToken', token);
  setAuthCookie('adminToken', token);
}

/** پاک کردن کامل نشست ادمین از هر دو جا */
export function clearAdminSession() {
  safeRemoveLocal('adminToken');
  clearAuthCookie('adminToken');
}

/** پاک کردن کامل نشست مشتری از هر دو جا */
export function clearClientSession() {
  safeRemoveLocal('token');
  safeRemoveLocal('clientInfo');
  clearAuthCookie('clientToken');
}
