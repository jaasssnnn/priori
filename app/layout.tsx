import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: { default: "Priori", template: "%s | Priori" },
  description:
    "Know what users are saying. Know what to fix first. B2B product intelligence and ops platform.",
};

export const viewport: Viewport = { themeColor: "#1a3a2e" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full`}>
      <body className="h-full bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
