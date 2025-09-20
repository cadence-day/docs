import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { reflectionStyles } from "../styles";

interface ReflectionDateAxisProps {
  dates: { day: string; display: string; full: string }[];
  selectedColumns: string[];
  toggleColumn: (full: string) => void;
  resetSelectedColumns: (full: string) => void;
}

const ReflectionDateAxis: React.FC<ReflectionDateAxisProps> = ({
  dates,
  selectedColumns,
  toggleColumn,
  resetSelectedColumns,
}) => (
  <View style={reflectionStyles.dateHeaderRow}>
    {dates.map((date, dateIndex) => (
      <TouchableOpacity
        key={dateIndex}
        style={[reflectionStyles.dateHeaderCell]}
        onPress={() => toggleColumn(date.full)}
        onLongPress={() => resetSelectedColumns(date.full)}
      >
        <Text
          style={[
            reflectionStyles.dayHeader,
            selectedColumns.includes(date.full) &&
              reflectionStyles.selectedDateText,
          ]}
        >
          {date.day}
        </Text>
        <Text
          style={[
            reflectionStyles.dateHeader,
            selectedColumns.includes(date.full) &&
              reflectionStyles.selectedDateText,
          ]}
        >
          {date.display}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default ReflectionDateAxis;
