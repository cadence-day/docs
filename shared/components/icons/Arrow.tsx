import { Svg, Line } from "react-native-svg";

const Arrow = () => {
  return (
    <Svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ marginLeft: 5 }}
    >
      <Line x1="2" y1="12" x2="19" y2="12" stroke="black" strokeWidth="2" />
      <Line x1="12" y1="5" x2="19" y2="12" stroke="black" strokeWidth="2" />
      <Line x1="12" y1="19" x2="19" y2="12" stroke="black" strokeWidth="2" />
    </Svg>
  );
};

export default Arrow;
