'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useClientLogout } from '@/modules/auth/hooks/useClientLogout';
import { resolveCmsHref } from '@/modules/home/cmsHref';
import type { HomeHeaderUserMenuContent } from '@/modules/home/home.types';
import type { Locale } from '@/i18n/config';
import { SignOutIcon } from '@/shared/components/icons/profile';
import { cn } from '@/shared/lib/cn';

type HeaderUserMenuProps = {
  locale: Locale;
  menu: HomeHeaderUserMenuContent;
};

export function HeaderUserMenu({ locale, menu }: HeaderUserMenuProps) {
  const { logout, isLoggingOut } = useClientLogout();
  const profileHref = resolveCmsHref(locale, menu.profilePath);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        type='button'
        className={cn(
          'inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full p-0',
          'outline-none transition-opacity hover:opacity-90',
          'focus-visible:ring-2 focus-visible:ring-[#1e2364]/35 focus-visible:ring-offset-2'
        )}
        aria-label={menu.profileLabel}
      >
        <Avatar className='size-10 border-2 border-[#d8e4ff]'>
          {menu.avatarSrc ? <AvatarImage src={menu.avatarSrc} alt='' /> : null}
          <AvatarFallback className='bg-[#1e2364] text-sm font-semibold text-white'>
            {menu.avatarInitials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className='min-w-[220px] rounded-2xl border-[#e5e7f0] p-1.5 shadow-lg'
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className='px-2 py-2 text-sm font-semibold text-[#1e2364]'>
            {menu.greeting}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className='bg-[#e5e7f0]' />

        {profileHref ? (
          <DropdownMenuItem
            render={<Link href={profileHref} />}
            nativeButton={false}
            className='cursor-pointer rounded-xl px-2 py-2 text-sm font-medium text-[#1e2364] focus:bg-[#eef4ff] focus:text-[#1e2364]'
          >
            {menu.profileLabel}
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator className='bg-[#e5e7f0]' />

        <DropdownMenuItem
          variant='destructive'
          disabled={isLoggingOut}
          onClick={() => void logout()}
          className='cursor-pointer gap-2 rounded-xl px-2 py-2 text-sm font-semibold'
        >
          <SignOutIcon className='size-4' />
          {menu.signOutLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
