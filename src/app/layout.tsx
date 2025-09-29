import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Manrope, Inter } from 'next/font/google';
import { LocaleProvider } from '@/hooks/use-locale';

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
        <LocaleProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <Toaster />
        </LocaleProvider>
      </body>
    </html>
  );
}
