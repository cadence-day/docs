import { useActivitiesStore, useStatesStore } from "@/shared/stores";
import { Timeslice } from "@/shared/types/models";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { useEffect, useState } from "react";

export interface TimesliceDetails {
  activityColor: string;
  energy: number | null;
  mood: number | null;
  isLoading: boolean;
  error: string | null;
}

export const useTimesliceDetails = (
  timeslice: Timeslice | null,
): TimesliceDetails => {
  const [energy, setEnergy] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activities = useActivitiesStore((state) => state.activities);
  const getStates = useStatesStore((state) => state.getStates);

  const activityColor =
    activities.find((activity) => activity.id === timeslice?.activity_id)
      ?.color || "#666";

  useEffect(() => {
    if (!timeslice?.state_id) {
      setEnergy(null);
      setMood(null);
      return;
    }

    const fetchStateData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!timeslice?.state_id) {
          setEnergy(null);
          setMood(null);
          return;
        }

        const states = await getStates([
          timeslice.state_id as string,
        ]);

        if (states && states.length > 0) {
          setEnergy(states[0].energy);
          setMood(states[0].mood);
        } else {
          setEnergy(null);
          setMood(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "Failed to fetch state data";
        setError(errorMessage);
        GlobalErrorHandler.logError(err, "useTimesliceDetails.fetchStateData", {
          timesliceId: timeslice?.id,
          stateId: timeslice?.state_id,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStateData();
  }, [timeslice?.state_id, timeslice?.id, getStates]);

  return {
    activityColor,
    energy,
    mood,
    isLoading,
    error,
  };
};
