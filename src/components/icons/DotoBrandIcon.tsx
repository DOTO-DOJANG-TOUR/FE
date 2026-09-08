import { Colors } from '@/constants/theme';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { FESTIVAL_ICON_PATHS } from './FestivalNaviIcon';

type FlowerProps = {
  size?: number;
};

export function DotoFlowerIcon({ size = 34 }: FlowerProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      {FESTIVAL_ICON_PATHS.map((path, index) => (
        <Path
          key={path}
          fillRule="evenodd"
          clipRule="evenodd"
          d={path}
          fill={index % 2 === 0 ? Colors.pink.pink50 : Colors.pink.pink25}
        />
      ))}
    </Svg>
  );
}

export function DotoBrandIcon() {
  return (
    <Svg width={76} height={38} viewBox="0 0 76 38" fill="none">
      <G transform="translate(1 3)">
        {FESTIVAL_ICON_PATHS.map((path, index) => (
          <Path
            key={path}
            fillRule="evenodd"
            clipRule="evenodd"
            d={path}
            fill={index % 2 === 0 ? Colors.pink.pink50 : Colors.pink.pink25}
          />
        ))}
      </G>
      <Circle cx={57} cy={19} r={17} fill={Colors.pink.pink25} />
      <Circle cx={51.5} cy={17} r={1.6} fill={Colors.gray.gray100} />
      <Circle cx={62.5} cy={17} r={1.6} fill={Colors.gray.gray100} />
      <Path
        d="M51 22.2C52.8 24.2 55 25.2 57.2 25.2C59.5 25.2 61.6 24.2 63 22.2"
        stroke={Colors.gray.gray100}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
