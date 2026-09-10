import { DojangTourButtonStatus, DojangTourStatus } from "@/types/festival";

export const mapDojangTourStatus = (
    status: DojangTourStatus,
): DojangTourButtonStatus => {
    switch (status) {
        case 'NOT_STARTED':
            return 'start';

        case 'PROGRESS':
            return 'stop';

        case 'REWARDED':
        case 'COMPLETED':
            return 'alreadyJoinedTour';

        case 'PARTICIPATING_IN_ANOTHER_TOUR':
            return 'inOtherTour';

        case 'FESTIVAL_ENDED':
            return 'alreadyEnded';
    }
}

export const mapStampDetailDojangStatus = (
  status: DojangTourStatus,
  stampCount: number,
): DojangTourButtonStatus => {
  switch (status) {
    case 'PROGRESS':
      return stampCount >= 3
        ? 'getReward'
        : 'stillProgress';

    case 'NOT_STARTED':
      return 'start';

    case 'REWARDED':
        return 'alreadyRewarded';
        
    case 'COMPLETED':
      return 'alreadyJoinedTour';

    case 'PARTICIPATING_IN_ANOTHER_TOUR':
      return 'inOtherTour';

    case 'FESTIVAL_ENDED':
      return 'alreadyEnded';
  }
};