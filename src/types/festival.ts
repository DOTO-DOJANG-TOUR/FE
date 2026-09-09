type FestivalCategoryCode =
  | 'EV010100'
  | 'EV010200'
  | 'EV010300'
  | 'EV010400'
  | 'EV010500'
  | 'EV010600';

export type DojangTourButtonStatus =
  | 'start'
  | 'stop'
  | 'visitAndStamp'
  | 'alreadyVisited'
  | 'alreadyJoinedTour'
  | 'inOtherTour'
  | 'alreadyEnded';

export type DojangTourStatus =
  | 'NOT_STARTED'
  | 'PROGRESS'
  | 'COMPLETED'
  | 'REWARDED'
  | 'PARTICIPATING_IN_ANOTHER_TOUR'
  | 'FESTIVAL_ENDED';

export type FestivalStatus = 'UPCOMING' | 'ONGOING' | 'ENDED';

export type FestivalContent = {
  festivalId: string;
  status: FestivalStatus;
  imageUrl?: string;
  title: string;
  eventStartDate: string;
  eventEndDate: string;
  gunguName: string;
  category: FestivalCategoryCode;
};

export type FestivalDetail = {
  imageUrl: string;
  title: string;
  status: FestivalStatus;
  category: string;
  address: string;
  phone: string;
  homepageUrl: string;
  summary: string;
  program: string;
  operationHours: string;
  restDate: string;
  useFee: string;
  parkingFee: string;
};

export type DojangTourStatusResult = {
  status: DojangTourStatus;
};

export type Festival = {
  festivalId: string;
  title: string;
  imageUrl?: string;
  eventStartDate: string;
  eventEndDate: string;
  gunguName: string;
};

export type FestivalListResult<T> = {
  festivals: T[];
  nextCursor?: string | null;
};