type FestivalCategoryCode =
  | 'EV010100'
  | 'EV010200'
  | 'EV010300'
  | 'EV010400'
  | 'EV010500'
  | 'EV010600';

type DojangTourButtonStatus =
  | 'start'
  | 'stop'
  | 'visitAndStamp'
  | 'alreadyVisited'
  | 'alreadyJoinedTour'
  | 'inOtherTour';

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

export type FestivalDetail = {
  id: number;
  status: FestivalStatus;
  imageUrl?: string;
  title: string;
  phone?: string;
  homeLink?: string;
  region?: string;
  category: FestivalCategoryCode;
  introduction?: string;
  eventContent?: string;
  usageInfo?: {
    operatingHours?: string;
    closedDays?: string;
    fee?: string;
    parking?: string;
  };
  dojangStatus: DojangTourButtonStatus;
};