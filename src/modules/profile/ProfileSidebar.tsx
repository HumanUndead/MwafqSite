import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { getUserDisplayName } from '@/shared/lib/user';
import { profileSidebarPlaceholder } from './constants';
import { ProfileLogoutButton } from './ProfileLogoutButton';
import { ProfileNavLinks } from './ProfileNavLinks';

export async function ProfileSidebar({ locale }: { locale: Locale }) {
  const { profileLayout } = await getDictionary(locale);
  const user = await getCurrentUser();
  const displayName =
    (user ? getUserDisplayName(user) : '') ||
    profileSidebarPlaceholder.displayName;
  const avatarSrc = user?.img || profileSidebarPlaceholder.avatarSrc;
  const imageAlt = profileLayout.avatarAlt.replace('{{name}}', displayName);

  return (
    <ScrollReveal
      variant='y'
      revealAfterLoadMs={200}
      className='sticky top-[110px] col-span-3 flex flex-col gap-1 self-start rounded-[28px] border-2 border-[#e5e7f0] bg-white p-[14px]'
    >
      <div className='mb-2 flex flex-col items-center gap-3 border-b border-[#e5e7f0] px-3 pb-[18px] pt-4 text-center'>
        <div className='inline-flex h-[140px] w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#e5e7f0] bg-[#f2f2f2] text-[48px] font-extrabold tracking-[-0.5px] text-[#1e2364]'>
          <Image
            src={avatarSrc}
            alt={imageAlt}
            width={140}
            height={140}
            className='block h-full w-full object-cover'
            unoptimized={avatarSrc.startsWith('http')}
          />
        </div>
        <div className='wrap-break-word text-xl font-extrabold leading-tight tracking-[-0.4px] text-[#00a8f1]'>
          {displayName}
        </div>
      </div>
      <ProfileNavLinks locale={locale} />
      <div className='mx-[6px] my-2 h-px bg-[#e5e7f0]' />
      <ProfileLogoutButton label={profileLayout.signOut} />
    </ScrollReveal>
  );
}
