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