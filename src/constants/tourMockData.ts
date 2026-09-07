import type { TourAttraction } from '@/types/tour';

export const ACTIVE_TOUR_TITLE = '거문도백도 은빛바다 체험행사';

export const TOUR_ATTRACTIONS: TourAttraction[] = [
  {
    id: 'isunsin-square',
    title: '이순신 광장',
    distance: '179m',
    address: '여수시 중앙로 74',
    phone: '061-661-1746',
    homepage: '홈페이지 바로가기',
    category: 'history',
    imageCount: 4,
  },
  {
    id: 'dolsan-park',
    title: '여수해상케이블카 돌산정류장',
    distance: '2.5km',
    address: '여수시 돌산읍 돌산로 3600-1',
    phone: '061-664-7301',
    homepage: '홈페이지 바로가기',
    category: 'culture',
    imageCount: 4,
  },
  {
    id: 'odongdo',
    title: '오동도',
    distance: '2.9km',
    address: '여수시 수정동 산1-11',
    phone: '061-659-1819',
    homepage: '홈페이지 바로가기',
    category: 'nature',
    imageCount: 3,
  },
  {
    id: 'aqua-planet',
    title: '아쿠아플라넷 여수',
    distance: '3.1km',
    address: '여수시 오동도로 61-11',
    phone: '1833-7001',
    homepage: '홈페이지 바로가기',
    category: 'culture',
    imageCount: 2,
  },
];

