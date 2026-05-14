import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { SignOutIcon } from '@/shared/components/icons/profile';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { cn } from '@/shared/lib/cn';
import { profileSidebarPlaceholder } from './constants';
import { ProfileNavLinks } from './ProfileNavLinks';

const navBase =
  'flex w-full items-center gap-3 rounded-[18px] px-4 py-[14px] text-left text-[14.5px] font-semibold no-underline transition-colors duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]';

export async function ProfileSidebar({ locale }: { locale: Locale }) {
  const { profileLayout } = await getDictionary(locale);
  const displayName = profileSidebarPlaceholder.displayName;
  const imageAlt = profileLayout.avatarAlt.replace('{{name}}', displayName);

  return (
    <ScrollReveal
      variant="y"
      revealAfterLoadMs={200}
      className="sticky top-[110px] col-span-3 flex flex-col gap-1 self-start rounded-[28px] border-2 border-[#e5e7f0] bg-white p-[14px]"
    >
      <div className="mb-2 flex flex-col items-center gap-3 border-b border-[#e5e7f0] px-3 pb-[18px] pt-4 text-center">
        <div className="inline-flex h-[140px] w-[140px] shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#e5e7f0] bg-[#f2f2f2] text-[48px] font-extrabold tracking-[-0.5px] text-[#1e2364]">
          <Image
            src="/img1.jpg"
            alt={imageAlt}
            width={100}
            height={100}
            className="block h-full w-full object-cover"
          />
        </div>
        <div className="wrap-break-word text-xl font-extrabold leading-tight tracking-[-0.4px] text-[#00a8f1]">
          {displayName}
        </div>
      </div>
      <ProfileNavLinks locale={locale} />
      <div className="mx-[6px] my-2 h-px bg-[#e5e7f0]" />
      <a
        href="signin.html"
        className={cn(
          navBase,
          'text-[#742f88] hover:bg-[#f3e9f7] hover:text-[#5e2570]',
        )}
        data-cursor
      >
        <SignOutIcon className="size-[18px] shrink-0 text-current" />
        {profileLayout.signOut}
      </a>
    </ScrollReveal>
  );
}
