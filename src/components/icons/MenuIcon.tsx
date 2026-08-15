import Svg, { Path } from 'react-native-svg';

type Props = {
  color?: string;
};

export const MenuIcon = ({ color = '#A8A8A8' }: Props) => {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3.75 9H9H14.25M3.75 14H14.25M3.75 4H14.25"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};