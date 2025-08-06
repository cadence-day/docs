type NoteIconProps = {
  color?: string;
  size?: "small" | "normal";
};
import { Svg, Line, Rect } from "react-native-svg";

const NoteIcon = ({ color = "black", size = "normal" }: NoteIconProps) => {
  const dimensions =
    size === "small"
      ? {
          width: 8,
          height: 10,
          bottom: 2,
        }
      : {
          width: 14,
          height: 17,
          bottom: 10,
        };

  return (
    <Svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 14 17"
      fill="none">
      <Rect x="0.5" y="0.5" width="13.0076" height="16" stroke={color} />
      <Line
        x1="2.35742"
        y1="4.39453"
        x2="11.7883"
        y2="4.39453"
        stroke={color}
      />
      <Line
        x1="2.35742"
        y1="8.77344"
        x2="11.7883"
        y2="8.77344"
        stroke={color}
      />
      <Line
        x1="2.35742"
        y1="12.8945"
        x2="11.7883"
        y2="12.8945"
        stroke={color}
      />
    </Svg>
  );
};

export default NoteIcon;
