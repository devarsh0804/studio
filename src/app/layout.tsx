import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Manrope, Inter } from 'next/font/google';
import { LocaleProvider } from '@/hooks/use-locale';
import { ThemeProvider } from '@/components/ThemeProvider';

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
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocaleProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
            <Toaster />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
