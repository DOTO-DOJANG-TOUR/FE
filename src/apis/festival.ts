import { DojangTourStatusResult, Festival, FestivalContent, FestivalDetail, FestivalListResult } from '@/types/festival';
import { apiFetch } from './client';

export const getTodayFestivals = async (
  cursor?: string,
): Promise<FestivalListResult<Festival>> => {
  const params = new URLSearchParams();

  if (cursor) {
    params.append('cursor', cursor);
  }

  const query = params.toString();

  const response = await apiFetch<FestivalListResult<Festival>>(
    `/api/v1/festival/today${query ? `?${query}` : ''}`
  );

  return response;
};

export const getUpcomingFestivals = async (
  cursor?: string,
): Promise<FestivalListResult<Festival>> => {
  const params = new URLSearchParams();

  if (cursor) {
    params.append('cursor', cursor);
  }

  const query = params.toString();

  const response = await apiFetch<FestivalListResult<Festival>>(
    `/api/v1/festival/future${query ? `?${query}` : ''}`
  );

  return response;
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

  const response = await apiFetch<FestivalListResult<FestivalContent>>(
    `/api/v1/festival/region?${params.toString()}`
  );

  return response;
};

export const getFestivalDetail = async (
  festivalId: string,
): Promise<FestivalDetail> => {
  const response = await apiFetch<FestivalDetail>(
    `/api/v1/festival/${festivalId}`
  );

  return response;
}

export const getFestivalDojangTourStatus = async (
  festivalId: string,
): Promise<DojangTourStatusResult> => {
  const response = await apiFetch<DojangTourStatusResult>(
    `/api/v1/festival/${festivalId}/stamp-tour`
  );

  return response;
}