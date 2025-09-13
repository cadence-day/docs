import ActivityLegendDialog from "@/features/activity/dialogs/ActivityLegendDialog";
import ManageActivitiesDialog from "@/features/activity/dialogs/ManageActivitiesDialog";
import CreateActivityDialog from "@/features/activity/dialogs/CreateActivityDialog";
import EditActivityDialog from "@/features/activity/dialogs/EditActivityDialog";
import CalendarDialog from "@/features/calendar/CalendarDialog";
import NoteDialog from "@/features/notes/NoteDialog";
import EncryptionLinkDialog from "@/features/encryption/EncryptionLinkDialog";
import ProfileImagePickerDialog from "@/features/profile/dialogs/ProfileImagePickerDialog";
import { TimePickerDialog } from "@/features/profile/dialogs/TimePickerDialog";
import { CustomerSupportDialog } from "@/features/profile/dialogs/CustomerSupportDialog";
import { SubscriptionPlansDialog } from "@/features/profile/dialogs/SubscriptionPlansDialog";

export const DialogRegistry: Record<string, React.ComponentType<any>> = {
  // Legacy mapping for backward compatibility
  activity: ActivityLegendDialog,
  // New explicit dialog types
  "activity-legend": ActivityLegendDialog,
  "activity-manage": ManageActivitiesDialog,
  "activity-create": CreateActivityDialog,
  "activity-edit": EditActivityDialog,
  calendar: CalendarDialog,
  note: NoteDialog,
  "encryption-link": EncryptionLinkDialog,
  "profile-image-picker": ProfileImagePickerDialog,
  // Profile and settings dialogs
  "time-picker": TimePickerDialog,
  "customer-support": CustomerSupportDialog,
  "subscription-plans": SubscriptionPlansDialog,
};

export default DialogRegistry;
