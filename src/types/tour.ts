type FestivalCategoryCode =
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