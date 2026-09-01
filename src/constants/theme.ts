/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  primary: '#208AEF',
  text: '#111111',
  textSecondary: '#777777',
  background: '#FFFFFF',
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
  },
  // Figma 로컬 색상 스타일(gray/pink/blue) 이름 그대로(공백만 제거) — 확인된 것만 우선 추가, 필요할 때마다 늘려갈 것
  gray: {
    gray00: '#FFFFFF',
    gray20: '#F6F6F6',
    gray60: '#BCBCBC',
    gray70: '#A8A8A8',
    gray100: '#262626',
  },
  pink: {
    pink10: '#FFF2F2',
    pink25: '#FFBDBD',
    pink30: '#FF8076',
    pink40: '#FF675F',
    pink50: '#FA5144',
  },
  blue: {
    blue10: '#F2F9FF',
    blue20: '#4598FE',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export const FontFamily = {
  regular: 'PretendardRegular',
  medium: 'PretendardMedium',
  semiBold: 'PretendardSemiBold',
  bold: 'PretendardBold',
};

export const Radius = {
  sm: 4,
  md: 12,
  lg: 16,
  full: 999,
};

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
