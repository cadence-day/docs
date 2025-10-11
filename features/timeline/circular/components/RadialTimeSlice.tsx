import { COLORS } from "@/shared/constants/COLORS";
import { Timeslice } from "@/shared/types/models";
import React from "react";
import { TouchableOpacity } from "react-native";
import Svg, { Path } from "react-native-svg";

export enum RadialMode {
  Faded,
  Today,
  Past,
  Current,
}

interface RadialTimeSliceProps {
  timeslice: Timeslice;
  color?: string;
  onPress?: () => void;
  onLongPress?: () => void;
  modes?: RadialMode[];
  // Arc geometry
  startAngle: number;
  endAngle: number;
  outerRadius: number;
  innerRadius: number;
  centerX: number;
  centerY: number;
}

/**
 * RadialTimeSlice component renders a single arc segment in the circular timeline
 * Similar to TimeSlice but for radial/circular layout
 */
export const RadialTimeSlice: React.FC<RadialTimeSliceProps> = ({
  timeslice,
  color,
  onPress,
  onLongPress,
  modes = [RadialMode.Today],
  startAngle,
  endAngle,
  outerRadius,
  innerRadius,
  centerX,
  centerY,
}) => {
  const isEmpty = timeslice.id == null;

  // Determine visual properties based on modes
  let fillColor = isEmpty ? COLORS.neutral.lightGray : (color ?? "#d9d9d9");
  let opacity = 1;
  let strokeColor = modes.includes(RadialMode.Today)
    ? COLORS.brand.primary
    : COLORS.brand.secondary;
  let strokeWidth = modes.includes(RadialMode.Current) ? 2 : 1;

  if (modes.includes(RadialMode.Faded)) {
    opacity = 0.3;
  }

  // Create arc path
  const createArcPath = (): string => {
    const startRadians = ((startAngle - 90) * Math.PI) / 180;
    const endRadians = ((endAngle - 90) * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startRadians);
    const y1 = centerY + outerRadius * Math.sin(startRadians);
    const x2 = centerX + outerRadius * Math.cos(endRadians);
    const y2 = centerY + outerRadius * Math.sin(endRadians);
    const x3 = centerX + innerRadius * Math.cos(endRadians);
    const y3 = centerY + innerRadius * Math.sin(endRadians);
    const x4 = centerX + innerRadius * Math.cos(startRadians);
    const y4 = centerY + innerRadius * Math.sin(startRadians);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1},${y1}
      A ${outerRadius},${outerRadius} 0 ${largeArcFlag} 1 ${x2},${y2}
      L ${x3},${y3}
      A ${innerRadius},${innerRadius} 0 ${largeArcFlag} 0 ${x4},${y4}
      Z
    `;
  };

  const path = createArcPath();

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Path
        d={path}
        fill={fillColor}
        opacity={opacity}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </TouchableOpacity>
  );
};

export default RadialTimeSlice;
