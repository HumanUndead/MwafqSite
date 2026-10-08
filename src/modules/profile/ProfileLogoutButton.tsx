'use client';

import { useClientLogout } from '@/modules/auth/hooks/useClientLogout';
import { SignOutIcon } from '@/shared/components/icons/profile';
import { Button } from '@/shared/components/ui/Button';

export function ProfileLogoutButton({ label }: { label: string }) {
  const { logout, isLoggingOut } = useClientLogout();

  return (
    <Button
      type='button'
      variant='productDanger'
      size='control'
      loading={isLoggingOut}
      onClick={() => void logout()}
      className='w-full justify-start px-3 font-semibold'
    >
      {!isLoggingOut ? <SignOutIcon className='size-[18px] shrink-0' /> : null}
      {label}
    </Button>
  );
}
