import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export function RightArrowIcon({
  size = 32,
  color = '#262626',
}: Props) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <Path
        d="M13 22L19 16L13 10"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}