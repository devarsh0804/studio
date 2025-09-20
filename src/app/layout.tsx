import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Manrope, Inter } from 'next/font/google';
import { MainNav } from './(roles)/components/MainNav';
import { UserProfile } from './(roles)/components/UserProfile';

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-headline',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});


export const metadata: Metadata = {
  title: 'AgriChain Trace',
  description: 'Supply chain transparency for agriculture.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <div className="min-h-screen flex flex-col">
          <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
              <div className="flex h-16 items-center px-4 container mx-auto justify-between">
                  <MainNav />
                  <UserProfile />
              </div>
          </div>
          {children}
        </div>
        <Toaster />
      </body>
    </html>
  );
}
