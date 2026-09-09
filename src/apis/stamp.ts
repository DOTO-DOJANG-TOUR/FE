import { TourStampListResult } from "@/types/tour";
import { apiFetch } from "./client";

export const startStampTour = async (
  festivalId: string,
): Promise<void> => {
  await apiFetch<void>(
    `/api/v1/festival/${festivalId}/stamp-tour`,
    {
      method: 'POST',
    },
  );
};

export const stopStampTour = async (
  festivalId: string,
): Promise<void> => {
  await apiFetch<void>(
    `/api/v1/festival/${festivalId}/stamp-tour`,
    {
      method: 'DELETE',
    },
  );
};

export const getMyStamps = async (): Promise<TourStampListResult> => {
  const response = await apiFetch<TourStampListResult>(
    `/api/v1/stamps/my-tours`
  );

  return response;
}