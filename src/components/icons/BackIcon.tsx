import Svg, { Path } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export const BackIcon = ({
  width = 10,
  height = 18,
  color = '#A8A8A8',
}: Props) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 10 18"
      fill="none"
    >
      <Path
        d="M9 17L1 9L9 1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};