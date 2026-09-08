import Svg, { Path } from 'react-native-svg';

// 소셜 제공자 로고는 DOTO 테마 토큰이 아닌 각 제공자의 공식 브랜드 컬러를 유지한다.
export function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20H42V20H24v8h11.3A12 12 0 1 1 32 15.3l5.7-5.7A20 20 0 1 0 44 24c0-1.4-.1-2.7-.4-4Z" />
      <Path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 32 15.3l5.7-5.7A20 20 0 0 0 6.3 14.7Z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A11.9 11.9 0 0 1 12.9 28l-6.6 5.1A20 20 0 0 0 24 44Z" />
      <Path fill="#1976D2" d="M43.6 20H42V20H24v8h11.3a12.1 12.1 0 0 1-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.4-.1-2.7-.4-4Z" />
    </Svg>
  );
}

export function KakaoIcon() {
  return (
    <Svg width={21} height={20} viewBox="0 0 24 22" fill="none">
      <Path
        d="M12 1C5.9 1 1 4.8 1 9.4c0 3 2.1 5.7 5.2 7.2l-1.1 4c-.1.4.3.7.6.5l4.7-3.2c.5.1 1.1.1 1.6.1 6.1 0 11-3.8 11-8.6S18.1 1 12 1Z"
        fill="#181600"
      />
    </Svg>
  );
}
