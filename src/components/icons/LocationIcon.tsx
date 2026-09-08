import Svg, { Path } from 'react-native-svg';

type Props = {
  width?: number;
  height?: number;
  color?: string;
};

export const LocationIcon = ({
  width = 14,
  height = 17,
  color = '#CFCFCF',
}: Props) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 14 17"
      fill="none"
    >
      <Path
        d="M7 8.5C6.0375 8.5 5.25 7.735 5.25 6.8C5.25 5.865 6.0375 5.1 7 5.1C7.9625 5.1 8.75 5.865 8.75 6.8C8.75 7.735 7.9625 8.5 7 8.5ZM12.25 6.97C12.25 3.8845 9.93125 1.7 7 1.7C4.06875 1.7 1.75 3.8845 1.75 6.97C1.75 8.959 3.45625 11.594 7 14.739C10.5438 11.594 12.25 8.959 12.25 6.97ZM7 0C10.675 0 14 2.737 14 6.97C14 9.792 11.6637 13.1325 7 17C2.33625 13.1325 0 9.792 0 6.97C0 2.737 3.325 0 7 0Z"
        fill={color}
      />
    </Svg>
  );
};