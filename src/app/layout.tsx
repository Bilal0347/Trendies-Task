
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ToasterWrapper } from "@/components/ToasterWrapper";
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trendies - Luxury Fashion Marketplace",
  description: "A curated marketplace for second-hand luxury fashion",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  // If user is authenticated and on the home page, redirect to My Orders
  if (user && typeof window !== 'undefined' && window.location.pathname === '/') {
    redirect('/my-orders');
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <nav className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-xl font-bold">
                Trendies
              </Link>
              <div className="space-x-4">     
                  <Link href="/my-orders" className="hover:text-primary">
                    My Orders
                  </Link>

              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <ToasterWrapper />
      </body>
    </html>
  );
}
