import { FestivalContent, FestivalListResult } from "@/types/festival";
import { TourContent } from "@/types/tour";
import { apiFetch } from "./client";

export const searchFestivals = async (
  query: string,
  cursor?: string,
): Promise<FestivalListResult<FestivalContent>> => {
  const params = new URLSearchParams({
    query,
  });

  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await apiFetch<FestivalListResult<FestivalContent>>(
    `/api/v1/festival?${params.toString()}`
  );

  return response;
};

export const searchTours = async (
  festivalId: string,
  keyword: string,
): Promise<TourContent[]> => {
  const params = new URLSearchParams({
    keyword,
  });

  const response = await apiFetch<TourContent[]>(
    `/api/v1/festival/${festivalId}/tour-spots?${params.toString()}`
  );

  return response;
};