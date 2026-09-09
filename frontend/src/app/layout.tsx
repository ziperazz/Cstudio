import type { Metadata, Viewport } from "next";
import "./globals.css";

// 🚀 متادیتای پایه + تنظیمات اختصاصی وب‌اپلیکیشن برای آیفون (PWA)
export const metadata: Metadata = {
  title: "C STUDIO | آژانس خلاقیت و تبلیغات",
  description: "ما فقط ظاهر زیبا نمی‌سازیم، ما باعث ارزشمند شدن آن‌ها می‌شویم. استراتژی، طراحی و تکنولوژی برای خلق تجربه‌های ماندگار.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "C STUDIO",
  },
};

// 🚀 کلید طلایی مهار سافاری آیفون (جلوگیری از زوم فرم‌ها و پرش صفحه)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // جلوگیری قطعی از زوم شدن هنگام کلیک روی اینپوت‌ها
  userScalable: false, // قفل کردن زوم دستی برای جلوگیری از به هم ریختن GSAP
  themeColor: "#050505", // هم‌رنگ کردن نوار وضعیت گوشی (Status Bar) با پس‌زمینه سایت
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className="scroll-smooth">
      <body className="bg-[#050505] text-white antialiased selection:bg-white/20 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}