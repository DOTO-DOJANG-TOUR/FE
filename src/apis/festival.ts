import { ApiResponse } from '@/types/api';
import { Festival, FestivalContent, FestivalListResult } from '@/types/festival';
import { apiFetch } from './client';

export const getTodayFestivals = async (
  cursor?: string,
): Promise<FestivalListResult<Festival>> => {
  const params = new URLSearchParams();

  if (cursor) {
    params.append('cursor', cursor);
  }

  const query = params.toString();

  const response = await apiFetch<ApiResponse<FestivalListResult<Festival>>>(
    `/api/v1/festival/today${query ? `?${query}` : ''}`
  );

  return response.result;
};

export const getUpcomingFestivals = async (
  cursor?: string,
): Promise<FestivalListResult<Festival>> => {
  const params = new URLSearchParams();

  if (cursor) {
    params.append('cursor', cursor);
  }

  const query = params.toString();

  const response = await apiFetch<ApiResponse<FestivalListResult<Festival>>>(
    `/api/v1/festival/future${query ? `?${query}` : ''}`
  );

  return response.result;
};

export const getRegionalFestivals = async (
  regionGroup: string,
  sort: string,
  cursor?: string,
): Promise<FestivalListResult<FestivalContent>> => {
  const params = new URLSearchParams({
    regionGroup: regionGroup,
    sort,
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await apiFetch<ApiResponse<FestivalListResult<FestivalContent>>>(
    `/api/v1/festival/region?${params.toString()}`
  );

  return response.result;
};