import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { reflectionStyles } from "../styles";

interface ReflectionTimeAxisProps {
  hours: string[];
  hoursScrollViewRef?: React.RefObject<ScrollView | null>;
  toggleRow: (hour: string) => void;
  resetSelectedRows: (hour: string) => void;
  onScroll?: (event: any) => void;
}

const ReflectionTimeAxis: React.FC<ReflectionTimeAxisProps> = ({
  hours,
  hoursScrollViewRef,
  toggleRow,
  resetSelectedRows,
  onScroll,
}) => (
  <View style={reflectionStyles.hourColumn}>
    <ScrollView
      ref={hoursScrollViewRef}
      scrollEnabled={true}
      showsVerticalScrollIndicator={false}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {hours.map((hour, index) => (
        <TouchableOpacity
          key={index}
          style={[
            reflectionStyles.hourCell,
            index % 2 !== 0 && reflectionStyles.transparentCell,
          ]}
          onPress={() => toggleRow(hour)}
          onLongPress={() => resetSelectedRows(hour)}
        >
          <Text style={reflectionStyles.hourText}>
            {index % 2 === 0 ? parseInt(hour.split(":")[0], 10) : ""}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

export default ReflectionTimeAxis;
