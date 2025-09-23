import { Activity, Note, State, Timeslice } from "@/shared/types/models";
import { ScrollView } from "react-native-gesture-handler";

export interface ReflectionGridProps {
  fromDate: Date;
  toDate: Date;
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

export interface ActivityStatistics {
  activityId: string;
  activityName: string;
  activityColor: string;
  totalTimeslices: number;
  totalHours: number;
  totalNotes: number;
  averageEnergy: number | null;
  energyLevels: number[];
  notesList: Note[];
  timesliceIds: string[];
}

export interface TimesliceStatistics {
  totalTimeslices: number;
  totalHours: number;
  totalNotes: number;
  activitiesStats: ActivityStatistics[];
  overallAverageEnergy: number | null;
  dateRange: {
    from: Date;
    to: Date;
    formattedRange: string;
  };
}

export interface EnhancedTimesliceInformation {
  timeslice?: Timeslice;
  activity?: Activity;
  noteList?: Note[];
  state?: State;
  energyLevel?: number | null;
  hoursOfActivityInView?: number;
  hoursOfActivityInDay?: number;
  statistics?: TimesliceStatistics;
  activityStats?: ActivityStatistics;
}

export interface TimesliceInformation {
  timeslice?: Timeslice;
  activity?: Activity;
  noteList?: Note[];
  state?: State;
  hoursOfActivityInView?: number;
  hoursOfActivityInDay?: number;
}

export interface DateRange {
  day: string;
  display: string;
  full: string;
}

export interface ReflectionCellProps {
  timeslice?: Timeslice | null;
  onPress?: () => void;
  onLongPress?: () => void;
  style?: object;
  dimmed?: boolean;
  notSelectedOpacity?: number;
}

export interface EmptyReflectionCellProps {
  onLongPress?: () => void;
  dimmed?: boolean;
  notSelectedOpacity?: number;
}

export interface ReflectionDateAxisProps {
  dates: DateRange[];
  selectedColumns: string[];
  toggleColumn: (full: string) => void;
  resetSelectedColumns: (full: string) => void;
}

export interface ReflectionTimeAxisProps {
  hours: string[];
  hoursScrollViewRef?: React.RefObject<ScrollView>;
  toggleRow: (hour: string) => void;
  resetSelectedRows: (hour: string) => void;
}

export interface ReflectionTimesliceInfoProps {
  timesliceInfo: EnhancedTimesliceInformation | null;
}

export interface LineItemProps {
  label: string;
  value: string;
  isNote?: boolean;
}
