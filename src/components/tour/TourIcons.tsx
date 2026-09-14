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

export function VisitPinIcon({ color = Colors.pink.pink40, size = 96 }: IconProps) {
  return (
    <Svg width={size} height={(size * 118) / 96} viewBox="0 0 96 118" fill="none">
      <Path
        d="M48 0C35.274 0.0139428 23.0734 4.90251 14.0748 13.5932C5.0762 22.2839 0.0144367 34.0671 0 46.3576C0 86.025 43.6364 115.984 45.4964 117.237C46.2301 117.734 47.1042 118 48 118C48.8958 118 49.7699 117.734 50.5036 117.237C52.3636 115.984 96 86.025 96 46.3576C95.9856 34.0671 90.9238 22.2839 81.9252 13.5932C72.9266 4.90251 60.726 0.0139428 48 0ZM48 29.5003C51.4522 29.5003 54.8268 30.489 57.6972 32.3413C60.5676 34.1936 62.8048 36.8263 64.1259 39.9066C65.447 42.9869 65.7927 46.3763 65.1192 49.6463C64.4457 52.9163 62.7833 55.92 60.3422 58.2775C57.9012 60.6351 54.7911 62.2406 51.4052 62.891C48.0194 63.5415 44.5098 63.2076 41.3204 61.9317C38.131 60.6558 35.405 58.4952 33.4871 55.723C31.5691 52.9509 30.5455 49.6917 30.5455 46.3576C30.5455 41.8868 32.3844 37.599 35.6578 34.4377C38.9311 31.2763 43.3708 29.5003 48 29.5003Z"
        fill={color}
      />
    </Svg>
  );
}

export function VisitPinShadowIcon({ color = Colors.gray.gray30, size = 116 }: IconProps) {
  return (
    <Svg width={size} height={(size * 25) / 116} viewBox="0 0 116 25" fill="none">
      <Path
        d="M116 12.5C116 19.4036 90.0325 25 58 25C25.9675 25 0 19.4036 0 12.5C0 5.59644 25.9675 0 58 0C90.0325 0 116 5.59644 116 12.5Z"
        fill={color}
      />
    </Svg>
  );
}

export function VisitCheckIcon({ color = Colors.blue.blue20, size = 48 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 0C10.7455 0 0 10.7455 0 24C0 37.2545 10.7455 48 24 48C37.2545 48 48 37.2545 48 24C48 10.7455 37.2545 0 24 0ZM34.4029 19.9418C34.5945 19.7229 34.7403 19.4678 34.8318 19.1916C34.9234 18.9155 34.9587 18.6238 34.9359 18.3338C34.913 18.0438 34.8324 17.7612 34.6987 17.5028C34.5651 17.2444 34.3811 17.0154 34.1576 16.8291C33.9341 16.6429 33.6756 16.5032 33.3973 16.4183C33.119 16.3334 32.8266 16.3051 32.5372 16.3349C32.2478 16.3647 31.9673 16.4521 31.7122 16.5919C31.457 16.7318 31.2325 16.9212 31.0516 17.1491L21.6698 28.4051L16.8153 23.5484C16.4038 23.1509 15.8526 22.931 15.2806 22.936C14.7085 22.941 14.1613 23.1704 13.7568 23.5749C13.3522 23.9795 13.1228 24.5267 13.1178 25.0988C13.1128 25.6708 13.3327 26.222 13.7302 26.6335L20.2756 33.1789C20.49 33.3932 20.7467 33.5604 21.0293 33.67C21.3119 33.7795 21.6142 33.829 21.9169 33.8152C22.2197 33.8015 22.5163 33.7248 22.7878 33.5901C23.0593 33.4553 23.2997 33.2655 23.4938 33.0327L34.4029 19.9418Z"
        fill={color}
      />
    </Svg>
  );
}

export function VisitLocationIcon({ color = Colors.gray.gray70, size = 20 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M10 2C8.40926 2.00189 6.88418 2.66475 5.75935 3.84315C4.63452 5.02155 4.0018 6.61927 4 8.28578C4 13.6644 9.45455 17.7266 9.68705 17.8966C9.77876 17.9639 9.88802 18 10 18C10.112 18 10.2212 17.9639 10.313 17.8966C10.5455 17.7266 16 13.6644 16 8.28578C15.9982 6.61927 15.3655 5.02155 14.2406 3.84315C13.1158 2.66475 11.5907 2.00189 10 2ZM10 6.00004C10.4315 6.00004 10.8534 6.1341 11.2122 6.38526C11.571 6.63642 11.8506 6.9934 12.0157 7.41106C12.1809 7.82873 12.2241 8.28831 12.1399 8.7317C12.0557 9.17509 11.8479 9.58237 11.5428 9.90204C11.2376 10.2217 10.8489 10.4394 10.4257 10.5276C10.0024 10.6158 9.56373 10.5705 9.16505 10.3975C8.76638 10.2245 8.42563 9.93155 8.18588 9.55566C7.94614 9.17978 7.81818 8.73785 7.81818 8.28578C7.81818 7.67956 8.04805 7.09818 8.45722 6.66952C8.86639 6.24086 9.42135 6.00004 10 6.00004Z"
        fill={color}
      />
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
