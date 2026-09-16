import { Image } from 'expo-image';

const assets = {
  empty: { source: require('../../../assets/images/tour/qa/empty.svg'), width: 22, height: 22 },
  noImage: { source: require('../../../assets/images/tour/qa/noImage.svg'), width: 83, height: 80 },
  call: { source: require('../../../assets/images/tour/qa/call.svg'), width: 26, height: 26 },
  close: { source: require('../../../assets/images/tour/qa/close.svg'), width: 33, height: 33 },
  page: { source: require('../../../assets/images/tour/qa/page.svg'), width: 26, height: 26 },
  space: { source: require('../../../assets/images/tour/qa/space.svg'), width: 26, height: 26 },
  search: { source: require('../../../assets/images/tour/qa/search.svg'), width: 32, height: 32 },
} as const;

export function TourAsset({ name }: { name: keyof typeof assets }) {
  const { source, width, height } = assets[name];
  return <Image source={source} style={{ width, height }} contentFit="contain" />;
}
