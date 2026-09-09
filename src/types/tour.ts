type FestivalCategoryCode =
  | 'EV010100'
  | 'EV010200'
  | 'EV010300'
  | 'EV010400'
  | 'EV010500'
  | 'EV010600';

export type TourContent = {
  id: number;
  imageUrl?: string;
  title: string;
  distance: number;
  address: string;
  category: FestivalCategoryCode;
};