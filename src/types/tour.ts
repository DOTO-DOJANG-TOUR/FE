export type TourContent = {
  tourSpotId: string;
  title: string;
  imageUrl?: string;
  address: string;
  mapX: string;
  mapY: string;
  category: string;
  distance: string;
};

export type TourFilterCategory = 'menu' | 'culture' | 'history' | 'nature' | 'experience';
export type TourCategory = Exclude<TourFilterCategory, 'menu'>;

export type TourAttraction = {
  id: string;
  title: string;
  distance: string;
  address: string;
  phone: string;
  homepage: string;
  category: TourCategory;
  imageCount: number;
  visited?: boolean;
};

export type CurrentVisitTourSpot = {
  tourSpotId: string;
  tourSpotName: string;
  expiresAt: string;
};

export type StampLocation = {
  mapX: number;
  mapY: number;
};

export type Stamp = {
  stampId: string;
};
