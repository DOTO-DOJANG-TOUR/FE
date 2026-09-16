import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const kakaoAppKey = process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY;
  const kakaoPlugin: [string, Record<string, string>] | null = kakaoAppKey
    ? ['@react-native-seoul/kakao-login', { kakaoAppKey }]
    : null;

  return {
    ...config,
    name: config.name ?? 'DOTO_FE',
    slug: config.slug ?? 'DOTO_FE',
    plugins: [
      ...(config.plugins ?? []),
      [
        'expo-build-properties',
        {
          android: {
            usesCleartextTraffic: true,

            extraMavenRepos: ['https://devrepo.kakao.com/nexus/content/groups/public/'],
          },
        },
      ],
      ...(kakaoPlugin ? [kakaoPlugin] : []),
      [
        'expo-location',
        {
          locationWhenInUsePermission:
            '내 위치를 지도에 표시하고 가까운 관광지를 안내하기 위해 위치 정보가 필요합니다.',
        },
      ],
    ],
  };
};
