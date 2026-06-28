'use client';

import { useClientLogout } from '@/modules/auth/hooks/useClientLogout';
import { SignOutIcon } from '@/shared/components/icons/profile';
import { Button } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';

type ProfileLogoutButtonProps = {
  label: string;
};

const signOutStyles =
  'h-auto min-h-[48px] w-full justify-start gap-3 rounded-[14px] border-0 bg-transparent px-4 py-3 text-start text-[14.5px] font-semibold text-[#742f88] shadow-none ring-0 hover:bg-[#f3e9f7] hover:text-[#5e2570] focus-visible:ring-2 focus-visible:ring-[#742f88]/30 max-[1100px]:px-3.5';

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
