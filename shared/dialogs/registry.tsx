import ActivityDialog from "@/features/activities/ActivityDialog";
import CalendarDialog from "@/features/calendar/CalendarDialog";

export const DialogRegistry: Record<string, React.ComponentType<any>> = {
  "activity-legend": ActivityDialog,
  calendar: CalendarDialog,
};

export default DialogRegistry;
