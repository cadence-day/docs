import { Timeslice } from "@/shared/types/models";
import { getContrastColor } from "@/shared/utils/colorUtils";

export { getContrastColor };

/**
 * Check if a timeslice has notes or states attached to it
 */
export const hasNotesOrStates = (timeslice: Timeslice): boolean => {
  const hasNotes = timeslice.note_ids && timeslice.note_ids.length > 0;
  const hasState = timeslice.state_id !== null;
  return !!(hasNotes || hasState);
};
