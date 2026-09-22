"use client";

/**
 * رفع باگ معروف Next.js/React با اتوپلی در Safari آیفون:
 * موقع رندر سمت سرور، اتریبیوت "muted" روی تگ <video> در HTML خروجی نوشته نمی‌شود
 * (این یک محدودیت شناخته‌شده‌ی React است)، فقط بعد از هیدریشن به‌صورت خاصیت جاوااسکریپتی ست می‌شود.
 * سافاری آیفون همان لحظه‌ی اول پارس کردن HTML تصمیم می‌گیرد که اتوپلی را اجرا کند یا نه،
 * و چون در آن لحظه "muted" را نمی‌بیند، اتوپلی را مسدود می‌کند و دکمه‌ی پلی را نشان می‌دهد؛
 * ست کردن muted بعد از آن دیگر اتوپلی اولیه را برنمی‌گرداند.
 * راه‌حل: به‌صورت دستی، هرچه زودتر بعد از مونت شدن، muted را (هم به‌عنوان خاصیت و هم اتریبیوت)
 * true کنیم و خودمان play() را دوباره صدا بزنیم؛ play() روی ویدیوی واقعاً muted نیازی به
 * تعامل کاربر ندارد و همیشه موفق می‌شود.
 */
export function ensureMutedAutoplay(video: HTMLVideoElement | null | undefined) {
  if (!video) return;
  video.defaultMuted = true;
  video.muted = true;
  try {
    video.setAttribute('muted', '');
  } catch {
    // noop
  }
  const playPromise = video.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(() => {
      // اگر باز هم رد شد (مثلاً چون هنوز داده‌ای برای پخش نیست)، با آماده شدن دیتا دوباره تلاش می‌کنیم
      const retry = () => {
        video.play().catch(() => {});
        video.removeEventListener('loadeddata', retry);
      };
      video.addEventListener('loadeddata', retry);
    });
  }
}

/** همان ensureMutedAutoplay را برای همه‌ی ویدیوهای دارای یک سلکتور، داخل یک ریشه اجرا می‌کند. */
export function ensureMutedAutoplayAll(root: ParentNode = document, selector = 'video[autoplay]') {
  root.querySelectorAll<HTMLVideoElement>(selector).forEach(ensureMutedAutoplay);
}
