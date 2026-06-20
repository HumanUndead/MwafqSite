import type { ComponentType, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export function SocialTwitterIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <path d='M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z' />
    </svg>
  );
}

export function SocialInstagramIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <rect x='2' y='2' width='20' height='20' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' y1='6.5' x2='17.51' y2='6.5' />
    </svg>
  );
}

export function SocialLinkedInIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <path d='M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' />
      <rect x='2' y='9' width='4' height='12' />
      <circle cx='4' cy='4' r='2' />
    </svg>
  );
}

export function SocialFacebookIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
    </svg>
  );
}

export function SocialYoutubeIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <path d='M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z' />
      <polygon points='9.75 15.02 15.5 12 9.75 8.98 9.75 15.02' />
    </svg>
  );
}

export function SocialTiktokIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
      {...props}
    >
      <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z' />
    </svg>
  );
}

export function SocialSnapchatIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      aria-hidden='true'
      {...props}
    >
      <path d='M12.166 2C9.329 2 7.4 3.644 7.4 6.4v.905c-.437.044-.869.066-1.3.066-.26 0-.51-.007-.75-.02l-.05.003c-.22 0-.4.16-.4.38 0 .55.65 1.1 1.7 1.374a7.52 7.52 0 0 1-.5 1.11c-.77 1.49-1.94 2.38-3.1 2.38-.08 0-.16-.01-.24-.02a.38.38 0 0 0-.36.26c-.07.22.06.46.3.55.06.02 1.6.59 1.84 1.35.04.14.18.23.32.23.06 0 .11-.01.16-.04.2-.08.42-.13.65-.13.34 0 .65.1.88.28.55.42 1.17.63 1.85.63.79 0 1.55-.27 2.15-.77.6.5 1.36.77 2.15.77.68 0 1.3-.21 1.85-.63.23-.18.54-.28.88-.28.23 0 .45.05.65.13.05.03.1.04.16.04.14 0 .28-.09.32-.23.24-.76 1.78-1.33 1.84-1.35.24-.09.37-.33.3-.55a.38.38 0 0 0-.36-.26c-.08.01-.16.02-.24.02-1.16 0-2.33-.89-3.1-2.38a7.52 7.52 0 0 1-.5-1.11c1.05-.274 1.7-.824 1.7-1.374 0-.22-.18-.38-.4-.38l-.05-.003c-.24.013-.49.02-.75.02-.431 0-.863-.022-1.3-.066V6.4C16.734 3.644 14.803 2 12.166 2z' />
    </svg>
  );
}

export function SocialWhatsappIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <path d='M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' />
    </svg>
  );
}

export function SocialTelegramIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <line x1='22' y1='2' x2='11' y2='13' />
      <polygon points='22 2 15 22 11 13 2 9 22 2' />
    </svg>
  );
}

export function SocialPinterestIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <path d='M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.03-2.83.19-.77 1.27-5.4 1.27-5.4s-.32-.65-.32-1.61c0-1.51.88-2.64 1.97-2.64.93 0 1.38.7 1.38 1.54 0 .94-.6 2.34-.91 3.64-.26 1.09.54 1.97 1.61 1.97 1.93 0 3.42-2.04 3.42-4.97 0-2.6-1.87-4.42-4.54-4.42-3.09 0-4.9 2.32-4.9 4.72 0 .93.36 1.94.81 2.49.09.11.1.2.07.31-.08.34-.27 1.09-.31 1.24-.05.2-.17.24-.39.15-1.47-.69-2.39-2.84-2.39-4.58 0-3.73 2.71-7.15 7.81-7.15 4.1 0 7.29 2.92 7.29 6.83 0 4.07-2.57 7.35-6.13 7.35-1.2 0-2.32-.62-2.7-1.36l-.74 2.74c-.27 1.02-1 2.3-1.48 3.08.56.17 1.15.26 1.76.26 5.52 0 10-4.48 10-10S17.52 2 12 2z' />
    </svg>
  );
}

export function SocialFallbackIcon(props: IconProps) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      {...props}
    >
      <circle cx='12' cy='12' r='10' />
      <line x1='2' y1='12' x2='22' y2='12' />
      <path d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' />
    </svg>
  );
}

export function getSocialIcon(name: string): ComponentType<IconProps> {
  const n = name.toLowerCase();
  if (n.includes('instagram')) return SocialInstagramIcon;
  if (n.includes('facebook') || n.includes('fb')) return SocialFacebookIcon;
  if (n.includes('twitter') || n === 'x' || n.includes('x (twitter)')) return SocialTwitterIcon;
  if (n.includes('linkedin')) return SocialLinkedInIcon;
  if (n.includes('youtube') || n.includes('yt')) return SocialYoutubeIcon;
  if (n.includes('tiktok') || n.includes('tik tok')) return SocialTiktokIcon;
  if (n.includes('snapchat')) return SocialSnapchatIcon;
  if (n.includes('whatsapp')) return SocialWhatsappIcon;
  if (n.includes('telegram')) return SocialTelegramIcon;
  if (n.includes('pinterest')) return SocialPinterestIcon;
  return SocialFallbackIcon;
}

export function getSocialIconStyle(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('instagram')) return 'bg-[#e1306c] text-white hover:bg-[#c13584]';
  if (n.includes('facebook') || n.includes('fb')) return 'bg-[#1877f2] text-white hover:bg-[#166fe5]';
  if (n.includes('twitter') || n === 'x' || n.includes('x (twitter)')) return 'bg-[#00a8f1] text-white hover:bg-[#0096d9]';
  if (n.includes('linkedin')) return 'bg-[#0077b5] text-white hover:bg-[#006097]';
  if (n.includes('youtube') || n.includes('yt')) return 'bg-[#ff0000] text-white hover:bg-[#cc0000]';
  if (n.includes('tiktok') || n.includes('tik tok')) return 'bg-[#010101] text-white hover:bg-[#333]';
  if (n.includes('snapchat')) return 'bg-[#fffc00] text-[#1e2364] hover:bg-[#f0ed00]';
  if (n.includes('whatsapp')) return 'bg-[#25d366] text-white hover:bg-[#1db954]';
  if (n.includes('telegram')) return 'bg-[#0088cc] text-white hover:bg-[#006faa]';
  if (n.includes('pinterest')) return 'bg-[#e60023] text-white hover:bg-[#c0001d]';
  return 'bg-[#1e2364] text-white hover:bg-[#2a3280]';
}
