import { Tables } from "@/shared/types/database.types";
import { Activity } from "@/shared/types/models/activity";
import { Note } from "@/shared/types/models/note";
import { State } from "@/shared/types/models/state";

export type Timeslice = Tables<"timeslices">;

export type ExtendedTimeslice = Timeslice & {
  activity: Activity;
  state: State;
  notes: Note[];
};

export default Timeslice;
