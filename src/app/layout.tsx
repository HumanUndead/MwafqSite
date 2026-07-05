import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import localFont from 'next/font/local';
import { ToastContainer } from '@/shared/components/feedback/Toast';
import {
  defaultLocale,
  hasLocale,
  isRtl,
  localeCookieName,
} from '@/i18n/config';
import {
  config,
  GOOGLE_SITE_VERIFICATION,
  SITE_URL,
} from '@/shared/constants/config';
import './globals.css';
import { Geist } from 'next/font/google';
import { cn } from '@/lib/utils';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

const lamaSans = localFont({
  src: [
    {
      path: '../../public/fonts/LamaSans-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/LamaSans-SemiBold.otf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/LamaSans-Bold.otf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-lama-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: config.appName,
  description: config.appDescription,
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const headerLocale = headerStore.get('x-mwafq-locale');
  const cookieLocale = cookieStore.get(localeCookieName)?.value;
  const locale =
    (headerLocale && hasLocale(headerLocale) ? headerLocale : null) ??
    (cookieLocale && hasLocale(cookieLocale) ? cookieLocale : null) ??
    defaultLocale;

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? 'rtl' : 'ltr'}
      data-scroll-behavior='smooth'
      className={cn(
        'h-full',
        'antialiased',
        lamaSans.variable,
        'font-sans',
        geist.variable
      )}
    >
      <body className='min-h-full bg-[#f3f4f8] text-[#1e2364]'>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
