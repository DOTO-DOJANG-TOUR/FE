import { Colors } from '@/constants/theme';
import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = {
  color?: string;
  size?: number;
};

export function CurrentLocationIcon({ color = Colors.gray.gray100, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="11" r="5.5" stroke={color} strokeWidth="1.5" />
      <Circle cx="11" cy="11" r="1.6" fill={color} />
      <Path d="M11 1.8V5M11 17V20.2M1.8 11H5M17 11H20.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

export function CloseIcon({ color = Colors.gray.gray60, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M5.5 5.5L14.5 14.5M14.5 5.5L5.5 14.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

export function PinIcon({ color = Colors.gray.gray60, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 16C12.3 12.8 14 10.2 14 7.4A5 5 0 104 7.4C4 10.2 5.7 12.8 9 16Z" stroke={color} strokeWidth="1.4" />
      <Circle cx="9" cy="7.2" r="1.7" stroke={color} strokeWidth="1.3" />
    </Svg>
  );
}

export function PhoneIcon({ color = Colors.gray.gray60, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M5.3 2.8L7.1 6 5.7 7.4C6.8 9.5 8.5 11.2 10.6 12.3L12 10.9 15.2 12.7V14.4C15.2 15 14.7 15.5 14.1 15.5 7.7 15.1 2.9 10.3 2.5 3.9 2.5 3.3 3 2.8 3.6 2.8H5.3Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />
    </Svg>
  );
}

export function GlobeIcon({ color = Colors.gray.gray60, size = 18 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Circle cx="9" cy="9" r="6.3" stroke={color} strokeWidth="1.4" />
      <Path d="M2.9 9H15.1M9 2.7C10.7 4.4 11.5 6.5 11.5 9S10.7 13.6 9 15.3M9 2.7C7.3 4.4 6.5 6.5 6.5 9S7.3 13.6 9 15.3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </Svg>
  );
}

export function TourStampIcon({ color = Colors.pink.pink40, size = 10 }: IconProps) {
  return (
    <Svg width={size} height={(size * 26) / 24} viewBox="0 0 24 26" fill="none">
      <Path
        d="M24 19.4991C24 16.6258 21.6147 14.2985 18.6696 14.2985C17.2038 14.2985 16.0044 13.1283 16.0044 11.6981V11.2301C16.0044 10.619 16.2043 10.0469 16.5775 9.63085C17.7901 8.23966 18.2565 6.39342 17.8567 4.57318C17.3903 2.4149 15.5913 0.633661 13.3926 0.152598C11.5669 -0.250455 9.70128 0.152598 8.26208 1.27075C6.82288 2.38889 5.99667 4.05311 5.99667 5.84735C5.99667 7.25153 6.51638 8.60371 7.46252 9.66985C7.809 10.0599 7.99556 10.619 7.99556 11.2301V11.6981C7.99556 13.1283 6.79622 14.2985 5.33037 14.2985C2.38534 14.2985 0 16.6258 0 19.4991V20.7993C0 21.5144 0.599667 22.0995 1.33259 22.0995H22.6541C23.387 22.0995 23.9867 21.5144 23.9867 20.7993V19.4991H24ZM0.0133259 23.3997H24V26H0.0133259V23.3997Z"
        fill={color}
      />
    </Svg>
  );
}
