import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export const DownIcon = ({
  size = 18,
  color = '#A8A8A8',
}: Props) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
    >
      <Path
        d="M12.9966 6.18501C13.2263 5.93833 13.598 5.93833 13.8277 6.18501C14.0574 6.4317 14.0574 6.83074 13.8277 7.07742L9.41555 11.815C9.18581 12.0617 8.81419 12.0617 8.58445 11.815L4.1723 7.07742C3.94257 6.83074 3.94257 6.4317 4.1723 6.18501C4.40204 5.93833 4.77367 5.93833 5.00341 6.18501L9 10.4764L12.9966 6.18501Z"
        fill={color}
      />
    </Svg>
  );
};