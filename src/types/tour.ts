export type TourCategoryCode =
  | 'EV010100'
  | 'EV010200'
  | 'EV010300'
  | 'EV010400'
  | 'EV010500'
  | 'EV010600';

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
