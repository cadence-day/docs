import { useActivitiesStore, useStatesStore } from "@/shared/stores";
import { Timeslice } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useEffect, useState } from "react";

export interface TimesliceDetails {
  activityColor: string;
  energy: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useTimesliceDetails = (
  timeslice: Timeslice | null
): TimesliceDetails => {
  const [energy, setEnergy] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activities = useActivitiesStore((state) => state.activities);
  const statesStore = useStatesStore();

  const activityColor =
    activities.find((activity) => activity.id === timeslice?.activity_id)
      ?.color || "#666";

  useEffect(() => {
    if (!timeslice?.state_id) {
      setEnergy(null);
      return;
    }

    const fetchEnergy = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!timeslice?.state_id) {
          setEnergy(null);
          return;
        }

        const states = await statesStore.getStates([
          timeslice.state_id as string,
        ]);

        if (states && states.length > 0) {
          setEnergy(states[0].energy);
        } else {
          setEnergy(null);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch energy data";
        setError(errorMessage);
        GlobalErrorHandler.logError(err, "useTimesliceDetails.fetchEnergy", {
          timesliceId: timeslice?.id,
          stateId: timeslice?.state_id,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnergy();
  }, [timeslice?.state_id]);

  return {
    activityColor,
    energy,
    isLoading,
    error,
  };
};
