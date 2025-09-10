import ActivityDialog from "@/features/activity/ActivityDialog";
import CalendarDialog from "@/features/calendar/CalendarDialog";
import NoteDialog from "@/features/notes/NoteDialog";

export const DialogRegistry: Record<string, React.ComponentType<any>> = {
  activity: ActivityDialog,
  calendar: CalendarDialog,
  note: NoteDialog,
};

export default DialogRegistry;
