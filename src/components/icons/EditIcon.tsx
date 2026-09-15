import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export const EditIcon = ({
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
        d="M12.146 2.146a1.5 1.5 0 0 1 2.122 0l1.586 1.586a1.5 1.5 0 0 1 0 2.122l-8.5 8.5a1 1 0 0 1-.44.256l-3.146.9a.5.5 0 0 1-.62-.618l.9-3.147a1 1 0 0 1 .256-.44l8.5-8.5-.658-.659Zm.708 1.415-8.5 8.5-.6 2.1 2.1-.6 8.5-8.5a.5.5 0 0 0 0-.708l-.792-.792a.5.5 0 0 0-.708 0Z"
        fill={color}
      />
    </Svg>
  );
};
