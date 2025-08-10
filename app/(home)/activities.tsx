import { Stack } from "expo-router";
import ActivityManagementScreen from "@/features/activities/components/ActivityManagementScreen";

export default function ActivitiesPage() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: "Activities",
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <ActivityManagementScreen />
    </>
  );
}
