import { apiFetch } from '@/apis/client';
import type { Member } from '@/types/auth';

export function getMyProfile() {
  return apiFetch<Member>('/api/v1/members/me');
}

export function updateMyNickname(nickname: string) {
  return apiFetch<{ nickname: string }>('/api/v1/members/me', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });
}

export function withdrawMembership() {
  return apiFetch<void>('/api/v1/members/me', {
    method: 'DELETE',
  });
}
