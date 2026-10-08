import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { getUserDisplayName } from '@/shared/lib/user';
import { ProfileAvatar } from './components/ProfileAvatar';
import { ProfileLogoutButton } from './ProfileLogoutButton';
import { ProfileNavLinks } from './ProfileNavLinks';

/**
 * Account navigation. Desktop: sticky side column with the account name.
 * Below `lg`: one horizontally scrolling row, so content starts right away.
 */
export async function ProfileSidebar({ locale }: { locale: Locale }) {
  const { profileLayout } = await getDictionary(locale);
  const user = await getCurrentUser();
  const displayName = user ? getUserDisplayName(user) : '';
  const imageAlt = profileLayout.avatarAlt.replace('{{name}}', displayName);

  return (
    <aside className='min-w-0 lg:sticky lg:top-[110px] lg:self-start'>
      {displayName ? (
        <div className='mb-4 hidden items-center gap-3 px-1 lg:flex'>
          <ProfileAvatar
            src={user?.img || ''}
            alt={imageAlt}
            name={displayName}
            className='size-11 text-[15px]'
          />
          <p className='min-w-0 break-words text-[15px] font-bold leading-5 text-[#1e2364]'>
            {displayName}
          </p>
        </div>
      ) : null}

      <nav
        aria-label={profileLayout.navAriaLabel}
        className='-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:p-0 [&::-webkit-scrollbar]:hidden'
      >
        <ProfileNavLinks locale={locale} />
        <div className='hidden lg:mt-2 lg:block lg:border-t lg:border-[#e5e7f0] lg:pt-2'>
          <ProfileLogoutButton label={profileLayout.signOut} />
        </div>
      </nav>
    </aside>
  );
}
