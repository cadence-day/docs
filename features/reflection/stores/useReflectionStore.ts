import {
  useActivitiesStore,
  useNotesStore,
  useStatesStore,
  useTimeslicesStore,
} from "@/shared/stores";
import {
  type BaseStoreState,
  handleGetApiCall,
} from "@/shared/stores/utils/utils";
import { Activity, Note, State, Timeslice } from "@/shared/types/models";
import { create } from "zustand";
import { timeslicesParser } from "../utils";

interface ReflectionData {
  timeslices: Timeslice[];
  parsedTimeslices: Record<string, Record<string, Timeslice | null>>;
  fromDate: Date | null;
  toDate: Date | null;
}

interface TimesliceInfo {
  timeslice?: Timeslice;
  activity?: Activity;
  noteList?: Note[];
  state?: State;
  hoursOfActivityInView?: number;
  hoursOfActivityInDay?: number;
}

interface ReflectionStore extends BaseStoreState {
  // State
  reflectionData: ReflectionData;
  selectedTimesliceInfo: TimesliceInfo | null;
  selectedColumns: string[];
  selectedRows: string[];

  // Core operations
  loadReflectionData: (fromDate: Date, toDate: Date) => Promise<void>;
  getTimesliceInformation: (
    timesliceId: string
  ) => Promise<TimesliceInfo | null>;
  refreshReflectionData: () => Promise<void>;

  // UI state management
  setSelectedColumns: (columns: string[]) => void;
  setSelectedRows: (rows: string[]) => void;
  toggleColumn: (dateString: string) => void;
  toggleRow: (timeString: string) => void;
  resetSelectedColumns: (dateString: string) => void;
  resetSelectedRows: (timeString: string) => void;
  setSelectedTimesliceInfo: (info: TimesliceInfo | null) => void;

  // Utility functions
  reset: () => void;
}

const useReflectionStore = create<ReflectionStore>((set, get) => ({
  // Initial state
  reflectionData: {
    timeslices: [],
    parsedTimeslices: {},
    fromDate: null,
    toDate: null,
  },
  selectedTimesliceInfo: null,
  selectedColumns: [],
  selectedRows: [],
  isLoading: false,
  error: null,

  // Core operations
  loadReflectionData: async (fromDate: Date, toDate: Date) => {
    const timeslicesStore = useTimeslicesStore.getState();

    try {
      set({ isLoading: true, error: null });

      // Create UTC dates for API request
      const utcFromDate = new Date(
        fromDate.getTime() + fromDate.getTimezoneOffset() * 60000
      );
      utcFromDate.setUTCHours(0, 0, 0, 0);

      const utcToDate = new Date(
        toDate.getTime() + toDate.getTimezoneOffset() * 60000
      );
      utcToDate.setUTCHours(23, 59, 59, 999);

      const timeslices = await timeslicesStore.getTimeslicesFromTo(
        utcFromDate,
        utcToDate
      );
      const parsedTimeslices = timeslicesParser(timeslices);

      set({
        reflectionData: {
          timeslices,
          parsedTimeslices,
          fromDate,
          toDate,
        },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to load reflection data",
      });
      throw error;
    }
  },

  getTimesliceInformation: async (timesliceId: string) => {
    return handleGetApiCall(
      set,
      async () => {
        const timeslicesStore = useTimeslicesStore.getState();
        const activitiesStore = useActivitiesStore.getState();
        const notesStore = useNotesStore.getState();
        const statesStore = useStatesStore.getState();

        const timeslices = await timeslicesStore.getTimeslices([timesliceId]);

        if (timeslices.length === 0) {
          return null;
        }

        const timeslice = timeslices[0];

        // Fetch related data in parallel
        const [activities, notes, states] = await Promise.all([
          timeslice.activity_id
            ? activitiesStore.getActivities([timeslice.activity_id])
            : Promise.resolve([]),
          timeslice.note_ids?.length
            ? notesStore.getNotes(timeslice.note_ids)
            : Promise.resolve([]),
          timeslice.state_id
            ? statesStore.getStates([timeslice.state_id])
            : Promise.resolve([]),
        ]);

        // Calculate activity hours (simplified for now)
        const hoursOfActivityInView = 0.5; // TODO: Calculate based on timeslice duration
        const hoursOfActivityInDay = 1.0; // TODO: Calculate based on daily activity

        const info: TimesliceInfo = {
          timeslice,
          activity: activities[0],
          noteList: notes,
          state: states[0],
          hoursOfActivityInView,
          hoursOfActivityInDay,
        };

        return info;
      },
      "get timeslice information",
      null
    );
  },

  refreshReflectionData: async () => {
    const { reflectionData } = get();
    if (reflectionData.fromDate && reflectionData.toDate) {
      return get().loadReflectionData(
        reflectionData.fromDate,
        reflectionData.toDate
      );
    }
  },

  // UI state management
  setSelectedColumns: (columns: string[]) => set({ selectedColumns: columns }),
  setSelectedRows: (rows: string[]) => set({ selectedRows: rows }),

  toggleColumn: (dateString: string) => {
    const { selectedColumns } = get();
    const newColumns = selectedColumns.includes(dateString)
      ? selectedColumns.filter((d) => d !== dateString)
      : [...selectedColumns, dateString];
    set({ selectedColumns: newColumns });
  },

  toggleRow: (timeString: string) => {
    const { selectedRows } = get();
    const newRows = selectedRows.includes(timeString)
      ? selectedRows.filter((t) => t !== timeString)
      : [...selectedRows, timeString];
    set({ selectedRows: newRows });
  },

  resetSelectedColumns: (dateString: string) => {
    set({ selectedColumns: [dateString] });
  },

  resetSelectedRows: (timeString: string) => {
    set({ selectedRows: [timeString] });
  },

  setSelectedTimesliceInfo: (info: TimesliceInfo | null) => {
    set({ selectedTimesliceInfo: info });
  },

  reset: () =>
    set({
      reflectionData: {
        timeslices: [],
        parsedTimeslices: {},
        fromDate: null,
        toDate: null,
      },
      selectedTimesliceInfo: null,
      selectedColumns: [],
      selectedRows: [],
      isLoading: false,
      error: null,
    }),
}));

export default useReflectionStore;
