import ActivityLegendDialog from "@/features/activity/dialogs/ActivityLegendDialog";
import CategoryPickerDialog from "@/features/activity/dialogs/CategoryPickerDialog";
import ColorPickerDialog from "@/features/activity/dialogs/ColorPickerDialog";
import CreateActivityDialog from "@/features/activity/dialogs/CreateActivityDialog";
import EditActivityDialog from "@/features/activity/dialogs/EditActivityDialog";
import ManageActivitiesDialog from "@/features/activity/dialogs/ManageActivitiesDialog";
import ReassignActivityDialog from "@/features/activity/dialogs/ReassignActivityDialog";
import CalendarDialog from "@/features/calendar/CalendarDialog";
import EncryptionLinkDialog from "@/features/encryption/EncryptionLinkDialog";
import { NoteDialog } from "@/features/notes/dialogs/NoteDialog";
import OnboardingDialog from "@/features/onboarding/components/Onboarding";
import ChangePasswordDialog from "@/features/profile/dialogs/ChangePasswordDialog";
import { CustomerSupportDialog } from "@/features/profile/dialogs/CustomerSupportDialog";
import { SubscriptionPlansDialog } from "@/features/profile/dialogs/SubscriptionPlansDialog";
import { ReflectionTimesliceInfoDialog } from "@/features/reflection/dialogs";

export const DialogRegistry: Record<string, React.ComponentType<any>> = {
  // Legacy mapping for backward compatibility
  activity: ActivityLegendDialog,
  // New explicit dialog types
  "activity-legend": ActivityLegendDialog,
  "activity-manage": ManageActivitiesDialog,
  "activity-create": CreateActivityDialog,
  "activity-category-picker": CategoryPickerDialog,
  "activity-color-picker": ColorPickerDialog,
  "activity-edit": EditActivityDialog,
  // Adding new dialog type mapping
  "reassign-activity": ReassignActivityDialog,
  calendar: CalendarDialog,
  note: NoteDialog,
  "encryption-link": EncryptionLinkDialog,
  // Profile and settings dialogs
  "customer-support": CustomerSupportDialog,
  "subscription-plans": SubscriptionPlansDialog,
  "change-password": ChangePasswordDialog,
  // Reflection dialogs
  "reflection-timeslice-info": ReflectionTimesliceInfoDialog,
  // Onboarding
  onboarding: OnboardingDialog,
};

export default DialogRegistry;
