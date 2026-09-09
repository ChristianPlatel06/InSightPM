import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InSightPM | Intelligent Project Management",
  description: "AI-powered project management and risk intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-black text-slate-200 min-h-screen selection:bg-blue-500/30 selection:text-blue-200`}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col relative">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
