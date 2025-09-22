import {
  useActivitiesStore,
  useNotesStore,
  useStatesStore,
  useTimeslicesStore,
} from "@/shared/stores";
import { useCallback, useState } from "react";
import * as migrationApi from "../api/migration";
import {
  ActivityMapping,
  SourceActivity,
  TargetActivity,
} from "../components/ActivityMappingTable";

export interface MigrationProgress {
  activities: number;
  timeslices: number;
  notes: number;
  states: number;
}

export function useMigration() {
  const activitiesStore = useActivitiesStore();
  const timeslicesStore = useTimeslicesStore();
  const notesStore = useNotesStore();
  const statesStore = useStatesStore();

  const [sourceActivities, setSourceActivities] = useState<SourceActivity[]>(
    [],
  );
  const [targetActivities, setTargetActivities] = useState<TargetActivity[]>(
    [],
  );
  const [progress, setProgress] = useState<MigrationProgress>({
    activities: 0,
    timeslices: 0,
    notes: 0,
    states: 0,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const addError = useCallback((error: string) => {
    setErrors((prev) => [...prev, error]);
    addLog(`ERROR: ${error}`);
  }, []);

  const initializeMigration = useCallback(
    async (email: string, password: string) => {
      try {
        setIsLoading(true);
        addLog("Initializing migration clients...");
        await migrationApi.initializeMigrationClients(email, password);
        addLog("Connected to legacy and target databases");

        addLog("Fetching source activities...");
        const sourceActivities = await migrationApi.fetchSourceActivities();
        setSourceActivities(sourceActivities);
        addLog(`Found ${sourceActivities.length} source activities`);

        addLog("Fetching target activities...");
        const targetActivities = await migrationApi
          .fetchTargetActivitiesFromStore(activitiesStore);
        setTargetActivities(targetActivities);
        addLog(`Found ${targetActivities.length} target activities`);

        return { sourceActivities, targetActivities };
      } catch (error) {
        addError(`Failed to initialize migration: ${error}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addLog, addError],
  );

  const runDryRun = useCallback(
    async (mappings: ActivityMapping[]) => {
      try {
        setIsLoading(true);
        addLog("Starting dry run...");
        const result = await migrationApi.runDryRun(mappings);

        if (result.success) {
          addLog(
            `Dry run completed. Would migrate: ${
              result.counts?.activities || 0
            } activities, ${result.counts?.timeslices || 0} timeslices, ${
              result.counts?.notes || 0
            } notes, ${result.counts?.states || 0} states`,
          );
        } else {
          addError(`Dry run failed: ${result.error}`);
        }

        return result;
      } catch (error) {
        addError(`Dry run error: ${error}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addLog, addError],
  );

  const migrateActivities = useCallback(
    async (mappings: ActivityMapping[]) => {
      try {
        setIsLoading(true);
        addLog("Migrating activities...");
        const result = await migrationApi.migrateActivities(
          mappings,
          activitiesStore,
        );

        if (result.success) {
          const count = result.migratedCount || 0;
          setProgress((prev) => ({ ...prev, activities: count }));
          addLog(`Successfully migrated ${count} activities`);
        } else {
          addError(`Activity migration failed: ${result.error}`);
        }

        return result;
      } catch (error) {
        addError(`Activity migration error: ${error}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [addLog, addError, activitiesStore],
  );

  const migrateTimeslices = useCallback(async () => {
    try {
      setIsLoading(true);
      addLog("Migrating timeslices...");

      const result = await migrationApi.migrateTimeslices(
        timeslicesStore,
        (current: number, total?: number) => {
          // Update progress during migration
          const progressMsg = total
            ? `Migrating timeslices: ${current}/${total}`
            : `Migrating timeslices: ${current}`;
          addLog(progressMsg);

          // Update progress state for UI
          setProgress((prev) => ({ ...prev, timeslices: current }));
        },
      );

      if (result.success) {
        const count = result.migratedCount || 0;
        setProgress((prev) => ({ ...prev, timeslices: count }));
        addLog(`Successfully migrated ${count} timeslices`);
      } else {
        addError(`Timeslice migration failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      addError(`Timeslice migration error: ${error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addLog, addError, timeslicesStore]);

  const migrateNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      addLog("Migrating notes...");

      const result = await migrationApi.migrateNotes(
        notesStore,
        timeslicesStore,
        (current: number, total?: number) => {
          // Update progress during migration
          const progressMsg = total
            ? `Migrating notes: ${current}/${total}`
            : `Migrating notes: ${current}`;
          addLog(progressMsg);

          // Update progress state for UI
          setProgress((prev) => ({ ...prev, notes: current }));
        },
      );

      if (result.success) {
        const count = result.migratedCount || 0;
        setProgress((prev) => ({ ...prev, notes: count }));
        addLog(`Successfully migrated ${count} notes`);

        if (result.encryptedCount && result.encryptedCount > 0) {
          addLog(
            `Note: ${result.encryptedCount} notes were encrypted and could not be decrypted`,
          );
        }
      } else {
        addError(`Note migration failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      addError(`Note migration error: ${error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addLog, addError, notesStore, timeslicesStore]);

  const migrateStates = useCallback(async () => {
    try {
      setIsLoading(true);
      addLog("Migrating states...");

      const result = await migrationApi.migrateStates(
        statesStore,
        timeslicesStore,
        (current: number, total?: number) => {
          // Update progress during migration
          const progressMsg = total
            ? `Migrating states: ${current}/${total}`
            : `Migrating states: ${current}`;
          addLog(progressMsg);

          // Update progress state for UI
          setProgress((prev) => ({ ...prev, states: current }));
        },
      );

      if (result.success) {
        const count = result.migratedCount || 0;
        setProgress((prev) => ({ ...prev, states: count }));
        addLog(`Successfully migrated ${count} states`);
      } else {
        addError(`State migration failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      addError(`State migration error: ${error}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addLog, addError, statesStore, timeslicesStore]);

  const runFullMigration = useCallback(
    async (mappings: ActivityMapping[]) => {
      try {
        setIsLoading(true);
        addLog("Starting full migration...");

        // Reset progress
        setProgress({
          activities: 0,
          timeslices: 0,
          notes: 0,
          states: 0,
        });

        // Migrate activities first
        addLog("Step 1/4: Migrating activities...");
        const activitiesResult = await migrationApi.migrateActivities(
          mappings,
          activitiesStore,
        );
        if (activitiesResult.success) {
          setProgress((prev) => ({
            ...prev,
            activities: activitiesResult.migratedCount || 0,
          }));
        } else {
          throw new Error(
            `Activity migration failed: ${activitiesResult.error}`,
          );
        }

        // Migrate timeslices
        addLog("Step 2/4: Migrating timeslices...");
        const timeslicesResult = await migrationApi.migrateTimeslices(
          timeslicesStore,
          (current: number, total?: number) => {
            const progressMsg = total
              ? `Migrating timeslices: ${current}/${total}`
              : `Migrating timeslices: ${current}`;
            addLog(progressMsg);
            setProgress((prev) => ({ ...prev, timeslices: current }));
          },
        );
        if (timeslicesResult.success) {
          setProgress((prev) => ({
            ...prev,
            timeslices: timeslicesResult.migratedCount || 0,
          }));
        } else {
          throw new Error(
            `Timeslice migration failed: ${timeslicesResult.error}`,
          );
        }

        // Migrate notes
        addLog("Step 3/4: Migrating notes...");
        const notesResult = await migrationApi.migrateNotes(
          notesStore,
          timeslicesStore,
          (current: number, total?: number) => {
            const progressMsg = total
              ? `Migrating notes: ${current}/${total}`
              : `Migrating notes: ${current}`;
            addLog(progressMsg);
            setProgress((prev) => ({ ...prev, notes: current }));
          },
        );
        if (notesResult.success) {
          setProgress((prev) => ({
            ...prev,
            notes: notesResult.migratedCount || 0,
          }));
          if (notesResult.encryptedCount && notesResult.encryptedCount > 0) {
            addLog(
              `Note: ${notesResult.encryptedCount} notes were encrypted and could not be decrypted`,
            );
          }
        } else {
          throw new Error(`Note migration failed: ${notesResult.error}`);
        }

        // Migrate states
        addLog("Step 4/4: Migrating states...");
        const statesResult = await migrationApi.migrateStates(
          statesStore,
          timeslicesStore,
          (current: number, total?: number) => {
            const progressMsg = total
              ? `Migrating states: ${current}/${total}`
              : `Migrating states: ${current}`;
            addLog(progressMsg);
            setProgress((prev) => ({ ...prev, states: current }));
          },
        );
        if (statesResult.success) {
          setProgress((prev) => ({
            ...prev,
            states: statesResult.migratedCount || 0,
          }));
        } else {
          throw new Error(`State migration failed: ${statesResult.error}`);
        }

        addLog("Full migration completed successfully!");

        return {
          success: true,
          activities: activitiesResult.migratedCount || 0,
          timeslices: timeslicesResult.migratedCount || 0,
          notes: notesResult.migratedCount || 0,
          states: statesResult.migratedCount || 0,
        };
      } catch (error) {
        addError(`Full migration error: ${error}`);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [
      addLog,
      addError,
      activitiesStore,
      timeslicesStore,
      notesStore,
      statesStore,
    ],
  );

  const resetMigration = useCallback(() => {
    setSourceActivities([]);
    setTargetActivities([]);
    setProgress({
      activities: 0,
      timeslices: 0,
      notes: 0,
      states: 0,
    });
    setErrors([]);
    setLogs([]);
  }, []);

  const cleanupMigration = useCallback(async () => {
    try {
      addLog("Cleaning up migration connection...");
      await migrationApi.cleanupMigrationConnection();
      addLog("Migration connection cleaned up successfully");
    } catch (error) {
      addError(`Failed to cleanup migration: ${error}`);
    }
  }, [addLog, addError]);

  const getConnectionStatus = useCallback(() => {
    return migrationApi.getConnectionState();
  }, []);

  return {
    sourceActivities,
    targetActivities,
    initializeMigration,
    runDryRun,
    migrateActivities,
    migrateTimeslices,
    migrateNotes,
    migrateStates,
    runFullMigration,
    progress,
    errors,
    logs,
    isLoading,
    resetMigration,
    cleanupMigration,
    getConnectionStatus,
  };
}
