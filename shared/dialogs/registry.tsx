import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const ActivityLegend: React.FC<{ activityId?: string }> = ({
  activityId,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activity Legend</Text>
      <Text style={styles.subtitle}>
        {activityId ? `Activity: ${activityId}` : "No activity selected"}
      </Text>
    </View>
  );
};

export const DialogRegistry: Record<string, React.ComponentType<any>> = {
  "activity-legend": ActivityLegend,
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  subtitle: { fontSize: 13 },
});

export default DialogRegistry;
