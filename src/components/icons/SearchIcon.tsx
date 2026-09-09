import Svg, { Path } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export const SearchIcon = ({
  size = 32,
  color = '#A8A8A8',
}: Props) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      <Path
        d="M24 24L20.4444 20.4444M22.2222 15.1111C22.2222 16.9971 21.473 18.8058 20.1394 20.1394C18.8058 21.473 16.9971 22.2222 15.1111 22.2222C13.2251 22.2222 11.4164 21.473 10.0828 20.1394C8.7492 18.8058 8 16.9971 8 15.1111C8 13.2251 8.7492 11.4164 10.0828 10.0828C11.4164 8.7492 13.2251 8 15.1111 8C16.9971 8 18.8058 8.7492 20.1394 10.0828C21.473 11.4164 22.2222 13.2251 22.2222 15.1111Z"
        stroke={color}
        strokeWidth={2}
        strokeMiterlimit={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};