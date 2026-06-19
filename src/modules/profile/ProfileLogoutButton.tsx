'use client';

import { useClientLogout } from '@/modules/auth/hooks/useClientLogout';
import { SignOutIcon } from '@/shared/components/icons/profile';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';

type ProfileLogoutButtonProps = {
  label: string;
};

const signOutStyles =
  'h-auto min-[1101px]:w-full max-[1100px]:grow max-[1100px]:shrink max-[1100px]:basis-[calc(50%-12px)] max-[640px]:basis-full min-h-0 justify-start gap-3 rounded-[18px] border-0 bg-transparent px-4 py-[14px] max-[1100px]:px-3 max-[1100px]:py-3 text-left text-[14.5px] font-semibold text-[#742f88] shadow-none ring-0 hover:bg-[#f3e9f7] hover:text-[#5e2570] focus-visible:ring-2 focus-visible:ring-[#742f88]/30';

export function ProfileLogoutButton({ label }: ProfileLogoutButtonProps) {
  const { logout, isLoggingOut } = useClientLogout();

  return (
    <Button
      type='button'
      variant='ghost'
      size='md'
      shape='default'
      loading={isLoggingOut}
      onClick={() => void logout()}
      className={cn(signOutStyles)}
      data-cursor
    >
      {!isLoggingOut ? (
        <SignOutIcon className='size-[18px] shrink-0 text-current' />
      ) : null}
      {label}
    </Button>
  );
}
