import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { getUserDisplayName } from '@/shared/lib/user';
import { cn } from '@/shared/lib/cn';
import { ProfileAvatar } from './components/ProfileAvatar';
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
      className={cn(
        'sticky top-[110px] col-span-3 self-start rounded-[28px] border-2 border-[#e5e7f0] bg-white shadow-sm',
        'min-[1101px]:flex min-[1101px]:flex-col min-[1101px]:gap-1 min-[1101px]:p-[14px]',
        'max-[1100px]:static max-[1100px]:top-auto max-[1100px]:col-span-12 max-[1100px]:overflow-hidden',
        'max-[640px]:rounded-[22px]'
      )}
    >
      <div
        className={cn(
          'flex items-center gap-3.5 border-[#e5e7f0]',
          'min-[1101px]:mb-2 min-[1101px]:flex-col min-[1101px]:items-center min-[1101px]:gap-3 min-[1101px]:border-b min-[1101px]:px-3 min-[1101px]:pb-[18px] min-[1101px]:pt-4 min-[1101px]:text-center',
          'max-[1100px]:border-b max-[1100px]:px-5 max-[1100px]:py-4'
        )}
      >
        <ProfileAvatar
          src={avatarSrc}
          alt={imageAlt}
          name={displayName}
          className='h-[140px] w-[140px] text-[48px] max-[1100px]:h-14 max-[1100px]:w-14 max-[1100px]:text-base'
        />
        <div className='wrap-break-word text-xl font-extrabold leading-tight tracking-[-0.4px] text-[#00a8f1] max-[1100px]:text-[17px]'>
          {displayName}
        </div>
      </div>

      <nav
        aria-label={profileLayout.navAriaLabel}
        className={cn(
          'flex flex-col gap-0.5',
          'min-[1101px]:contents',
          'max-[1100px]:px-3 max-[1100px]:py-2.5'
        )}
      >
        <ProfileNavLinks locale={locale} />
      </nav>

      <div className='mx-[6px] my-2 h-px bg-[#e5e7f0] max-[1100px]:hidden' />

      <div className='max-[1100px]:border-t max-[1100px]:border-[#e5e7f0] max-[1100px]:px-3 max-[1100px]:py-2.5'>
        <ProfileLogoutButton label={profileLayout.signOut} />
      </div>
    </ScrollReveal>
  );
}
