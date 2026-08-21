import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "C STUDIO | آژانس خلاقیت و تبلیغات",
  description: "ما فقط ظاهر زیبا نمی‌سازیم، ما باعث ارزشمند شدن آن‌ها می‌شویم. استراتژی، طراحی و تکنولوژی برای خلق تجربه‌های ماندگار.",
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