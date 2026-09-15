import { apiFetch } from '@/apis/client';
import type { Member } from '@/types/auth';

export function getMyProfile() {
  return apiFetch<Member>('/api/v1/members/me');
}

export function withdrawMembership() {
  return apiFetch<void>('/api/v1/members/me', {
    method: 'DELETE',
  });
}
