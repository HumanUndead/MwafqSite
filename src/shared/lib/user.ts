import type { User } from '@/shared/types/user.types';

export function getUserDisplayName(user: Pick<User, 'firstName' | 'lastName' | 'name'>): string {
  const fromParts = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');

  return fromParts || user.name?.trim() || '';
}

export function resolveUserAppRole(
  user: Pick<User, 'roleName' | 'isManagement' | 'role'>
): 'user' | 'admin' {
  if (user.role === 'admin') {
    return 'admin';
  }

  const roleName = user.roleName?.trim().toLowerCase();
  if (roleName === 'admin' || roleName === 'administrator') {
    return 'admin';
  }

  return user.isManagement ? 'admin' : 'user';
}

export function getUserMemberSinceDate(user: User): string | undefined {
  return user.createdAt?.trim() || user.dateOfBirth?.trim() || undefined;
}
