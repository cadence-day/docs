import {
  useActivitiesStore,
  useNotesStore,
  useStatesStore,
  useTimeslicesStore,
} from "@/shared/stores";
import { Activity, Note, State, Timeslice } from "@/shared/types/models";

export const fetchPeriodTimeslices = async (fromDate: Date, toDate: Date) => {
  // Convert local dates to UTC for API call
  const from_time = new Date(fromDate);
  from_time.setUTCHours(0, 0, 0, 0);

  const to_time = new Date(toDate);
  to_time.setUTCHours(23, 59, 59, 999);

  const timeslicesStore = useTimeslicesStore.getState();
  const result = await timeslicesStore.getTimeslicesFromTo(from_time, to_time);
  return result;
};

// This function retrieves detailed information about a specific timeslice -
export const getTimesliceInformation = async (
  timeslice_id: string
): Promise<{
  timeslice: Timeslice | undefined;
  activity: Activity | undefined;
  noteList: Note[] | undefined;
  state: State | undefined;
  energyLevel: number | null;
}> => {
  const timeslicesStore = useTimeslicesStore.getState();
  const activitiesStore = useActivitiesStore.getState();
  const notesStore = useNotesStore.getState();
  const statesStore = useStatesStore.getState();

  const timeslices = await timeslicesStore.getTimeslices([timeslice_id]);

  if (timeslices.length > 0) {
    const timeslice = timeslices[0];

    const activities = await activitiesStore.getActivities([
      timeslice?.activity_id || "",
    ]);

    const notes = await notesStore.getNotes(timeslice?.note_ids || []);

    const states = await statesStore.getStates([timeslice?.state_id || ""]);

    const activity = activities[0];
    const noteList = notes;
    const state = states.length > 0 ? states[0] : undefined;

    // Extract energy level from state
    let energyLevel: number | null = null;
    if (state?.energy !== null && state?.energy !== undefined) {
      energyLevel = Number(state.energy);
      if (isNaN(energyLevel)) {
        energyLevel = null;
      }
    }

    return { timeslice, activity, noteList, state, energyLevel };
  }
  return {
    timeslice: undefined,
    activity: undefined,
    noteList: undefined,
    state: undefined,
    energyLevel: null,
  };
};

export const timeslicesParser = (
  timeslices: Timeslice[],
  locale?: string
): {
  [date: string]: {
    [time: string]: Timeslice | null;
  };
} => {
  const result: { [date: string]: { [time: string]: Timeslice | null } } = {};

  // Filter and extract valid timeslices with start_time
  const validTimeslices = timeslices.filter((ts) => ts.start_time !== null);

  if (validTimeslices.length === 0) {
    return result;
  }

  // Use provided locale or fallback to en-US for consistent date formatting
  const dateLocale = locale || "en-US";

  // Get unique dates from timeslices, converting UTC to local time
  const dates = new Set(
    validTimeslices.map((ts) => {
      // Convert UTC string to local date
      const utcDate = new Date(ts.start_time as string);
      return utcDate.toLocaleDateString(dateLocale);
    })
  );

  // Pre-generate time keys array for reuse
  const timeKeys: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeKeys.push(
        `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`
      );
    }
  }

  // Initialize all dates with 30-minute time slots using pre-generated keys
  dates.forEach((date) => {
    result[date] = {};
    timeKeys.forEach((timeKey) => {
      result[date][timeKey] = null;
    });
  });

  // Map timeslices to their corresponding time slots in local time
  validTimeslices.forEach((timeslice) => {
    // Convert UTC string to local time
    const utcStartTime = new Date(timeslice.start_time as string);

    const dateKey = utcStartTime.toLocaleDateString(dateLocale);
    const hour = utcStartTime.getHours();
    const minute = Math.floor(utcStartTime.getMinutes() / 30) * 30;
    const timeKey = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    if (result[dateKey] && result[dateKey][timeKey] !== undefined) {
      result[dateKey][timeKey] = timeslice;
    }
  });

  return result;
};
