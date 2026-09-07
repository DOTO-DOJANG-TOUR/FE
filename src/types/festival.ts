type FestivalCategoryCode =
  | 'EV010100'
  | 'EV010200'
  | 'EV010300'
  | 'EV010400'
  | 'EV010500'
  | 'EV010600';

export type FestivalStatus = 'upcoming' | 'ongoing' | 'ended';

export type FestivalContent = {
  id: number;
  status: FestivalStatus;
  imageUrl?: string;
  title: string;
  startDate: string;
  endDate: string;
  region: string;
  category: FestivalCategoryCode;
};