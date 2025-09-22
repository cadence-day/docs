import { SECRETS } from "@/shared/constants/SECRETS";
import { GlobalErrorHandler } from "@/shared/utils/errorHandler";
import { createClient } from "@supabase/supabase-js";
import {
  ActivityMapping,
  SourceActivity,
  TargetActivity,
} from "../components/ActivityMappingTable";
import { convertMigrationTimestamp } from "../lib/dateConversion";
import { processNoteForMigration } from "../lib/decryptor";

export interface V1Activity {
  activity_id: string;
  name: string;
  color: string;
  user_id: string;
  category_id?: string; // Added during migration process
  custom_name?: string; // From profile_activities table
  custom_color?: string; // From profile_activities table
}

export interface V2Activity {
  id: string;
  name: string;
  color: string;
  weight: number;
  activity_categories: string[];
}

interface MigrationResponse {
  success: boolean;
  error?: string;
  migratedCount?: number;
  counts?: {
    activities: number;
    timeslices: number;
    notes: number;
    states: number;
  };
  encryptedCount?: number;
}

interface ConnectionState {
  isConnected: boolean;
  lastCheck: Date;
  email?: string;
  password?: string;
}

let sourceClient: any = null;
let connectionState: ConnectionState = {
  isConnected: false,
  lastCheck: new Date(),
};

export async function initializeMigrationClients(
  email: string,
  password: string,
): Promise<void> {
  if (
    !SECRETS.EXPO_PUBLIC_LEGACY_SUPABASE_URL ||
    !SECRETS.EXPO_PUBLIC_LEGACY_SUPABASE_KEY
  ) {
    throw new Error("Legacy Supabase configuration not found");
  }

  try {
    // Create source client (legacy database) if not already created
    if (!sourceClient) {
      sourceClient = createClient(
        SECRETS.EXPO_PUBLIC_LEGACY_SUPABASE_URL,
        SECRETS.EXPO_PUBLIC_LEGACY_SUPABASE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        },
      );

      GlobalErrorHandler.logError(
        new Error("Created new legacy Supabase client"),
        "initializeMigrationClients",
        { operation: "create_client" },
      );
    }

    // Sign in to legacy database
    const { error: signInError } = await sourceClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      throw new Error(`Legacy authentication failed: ${signInError.message}`);
    }

    // Update connection state
    connectionState = {
      isConnected: true,
      lastCheck: new Date(),
      email,
      password,
    };

    GlobalErrorHandler.logError(
      new Error("Successfully connected to legacy database"),
      "initializeMigrationClients",
      { operation: "connect_success" },
    );
  } catch (error) {
    connectionState.isConnected = false;
    throw new Error(`Failed to initialize migration: ${error}`);
  }
}

export async function ensureConnectionHealth(): Promise<void> {
  if (!sourceClient || !connectionState.isConnected) {
    throw new Error("Source client not initialized or connection lost");
  }

  // Check connection health every 5 minutes
  const timeSinceLastCheck = Date.now() - connectionState.lastCheck.getTime();
  if (timeSinceLastCheck > 5 * 60 * 1000) {
    try {
      // Test connection with a simple query
      const { error } = await sourceClient
        .from("activities")
        .select("activity_id", { count: "exact", head: true });

      if (error) {
        GlobalErrorHandler.logError(
          new Error("Connection health check failed, attempting reconnection"),
          "ensureConnectionHealth",
          { operation: "health_check_failed", error: error.message },
        );

        // Attempt to reconnect
        if (connectionState.email && connectionState.password) {
          await initializeMigrationClients(
            connectionState.email,
            connectionState.password,
          );
        } else {
          throw new Error("Cannot reconnect: credentials not stored");
        }
      } else {
        connectionState.lastCheck = new Date();
        GlobalErrorHandler.logError(
          new Error("Connection health check passed"),
          "ensureConnectionHealth",
          { operation: "health_check_success" },
        );
      }
    } catch (error) {
      connectionState.isConnected = false;
      throw new Error(`Connection health check failed: ${error}`);
    }
  }
}

export function getConnectionState(): ConnectionState {
  return { ...connectionState };
}

export async function cleanupMigrationConnection(): Promise<void> {
  try {
    if (sourceClient) {
      await sourceClient.auth.signOut();
      GlobalErrorHandler.logError(
        new Error("Successfully signed out from legacy database"),
        "cleanupMigrationConnection",
        { operation: "cleanup_success" },
      );
    }
  } catch (error) {
    GlobalErrorHandler.logError(
      error as Error,
      "cleanupMigrationConnection",
      { operation: "cleanup_error" },
    );
  } finally {
    sourceClient = null;
    connectionState = {
      isConnected: false,
      lastCheck: new Date(),
    };
  }
}

export async function fetchSourceActivities(): Promise<SourceActivity[]> {
  try {
    await ensureConnectionHealth();

    const { data, error } = await sourceClient
      .from("activities")
      .select("activity_id, name, color")
      .order("name");

    if (error) {
      throw new Error(`Failed to fetch activities: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    throw new Error(`Connection failed: ${error}`);
  }
}

export async function fetchV1ActivitiesWithDetails(): Promise<V1Activity[]> {
  try {
    await ensureConnectionHealth();

    const { data, error } = await sourceClient
      .from("activities")
      .select(`
        activity_id, 
        name, 
        color, 
        user_id,
        profile_activities(custom_name, custom_color)
      `)
      .order("name");

    if (error) {
      throw new Error(`Failed to fetch V1 activities: ${error.message}`);
    }

    // Transform the data to flatten the profile_activities relationship
    const transformedData = (data || []).map((activity: any) => ({
      activity_id: activity.activity_id,
      name: activity.name,
      color: activity.color,
      user_id: activity.user_id,
      custom_name: activity.profile_activities?.[0]?.custom_name || null,
      custom_color: activity.profile_activities?.[0]?.custom_color || null,
    }));

    return transformedData;
  } catch (error) {
    GlobalErrorHandler.logError(error, "fetchV1ActivitiesWithDetails");
    throw error;
  }
}

export async function fetchV2ActivitiesWithDetails(
  activitiesStore: any,
): Promise<V2Activity[]> {
  try {
    // Refresh to get latest activities
    await activitiesStore.refresh();

    // Return activities in the expected format
    return activitiesStore.activities.map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      color: activity.color,
      weight: activity.weight,
      activity_categories: activity.activity_categories || [],
    }));
  } catch (error) {
    GlobalErrorHandler.logError(error, "fetchV2ActivitiesWithDetails");
    throw error;
  }
}

// This function is now provided by the hook that uses the stores
export async function fetchTargetActivitiesFromStore(
  activitiesStore: any,
): Promise<TargetActivity[]> {
  try {
    // Refresh to get latest activities
    await activitiesStore.refresh();

    // Return activities in the expected format
    return activitiesStore.activities.map((activity: any) => ({
      id: activity.id,
      name: activity.name,
      color: activity.color,
      weight: activity.weight,
      activity_categories: activity.activity_categories || [],
    }));
  } catch (error) {
    throw new Error(`Failed to fetch target activities: ${error}`);
  }
}

export async function runDryRun(
  _mappings: ActivityMapping[],
): Promise<MigrationResponse> {
  try {
    await ensureConnectionHealth();

    const totalCounts = {
      activities: 0,
      timeslices: 0,
      notes: 0,
      states: 0,
    };

    // Count source activities
    const { count: activitiesCount } = await sourceClient
      .from("activities")
      .select("*", { count: "exact", head: true });
    totalCounts.activities = activitiesCount || 0;

    // Count source timeslices
    const { count: timeslicesCount } = await sourceClient
      .from("timeslices")
      .select("*", { count: "exact", head: true });
    totalCounts.timeslices = timeslicesCount || 0;

    // Count source notes
    const { count: notesCount } = await sourceClient
      .from("notes")
      .select("*", { count: "exact", head: true });
    totalCounts.notes = notesCount || 0;

    // Count source states
    const { count: statesCount } = await sourceClient
      .from("states")
      .select("*", { count: "exact", head: true });
    totalCounts.states = statesCount || 0;

    return {
      success: true,
      counts: totalCounts,
    };
  } catch (error) {
    return {
      success: false,
      error: `Dry run failed: ${error}`,
    };
  }
}

export async function migrateActivities(
  mappings: ActivityMapping[],
  activitiesStore: {
    insertActivity: (activity: unknown) => Promise<{ id: string } | null>;
    upsertActivity: (activity: unknown) => Promise<{ id: string } | null>;
  },
): Promise<MigrationResponse> {
  try {
    await ensureConnectionHealth();

    let migratedCount = 0;
    const activityMappings: { [key: string]: string } = {};

    for (const mapping of mappings) {
      if (!mapping.targetId && !mapping.createNew) continue;

      // Get source activity
      const { data: sourceActivity, error: sourceError } = await sourceClient
        .from("activities")
        .select("*")
        .eq("activity_id", mapping.sourceId)
        .single();

      if (sourceError || !sourceActivity) {
        GlobalErrorHandler.logError(
          new Error(
            `Failed to fetch source activity ${mapping.sourceId}: ${sourceError?.message}`,
          ),
          "migrateActivities",
          {
            operation: "fetch_source_activity_failed",
            sourceId: mapping.sourceId,
          },
        );
        continue;
      }

      let targetActivityId: string;

      if (mapping.createNew && mapping.newActivityData) {
        // Create new activity using upsert to avoid insert-only schema issues
        const newActivity = await activitiesStore.upsertActivity({
          name: mapping.newActivityData.name,
          color: mapping.newActivityData.color,
          weight: 0.5,
          activity_categories: mapping.newActivityData.category
            ? [mapping.newActivityData.category]
            : [],
          user_id: sourceActivity.user_id,
        });

        if (!newActivity) {
          GlobalErrorHandler.logError(
            new Error(
              `Failed to create new activity for source ${mapping.sourceId}`,
            ),
            "migrateActivities",
            {
              operation: "create_new_activity_failed",
              sourceId: mapping.sourceId,
            },
          );
          continue;
        }

        targetActivityId = newActivity.id;
        GlobalErrorHandler.logError(
          new Error(
            `Created new activity: v1 ${mapping.sourceId} -> v2 ${targetActivityId}`,
          ),
          "migrateActivities",
          {
            operation: "create_new_activity",
            sourceId: mapping.sourceId,
            targetId: targetActivityId,
          },
        );
      } else if (mapping.targetId) {
        targetActivityId = mapping.targetId;
        // Log mapping for debugging
      } else {
        GlobalErrorHandler.logError(
          new Error(`No valid mapping for source activity ${mapping.sourceId}`),
          "migrateActivities",
          { operation: "skip_invalid_mapping", sourceId: mapping.sourceId },
        );
        continue;
      }

      // Store the mapping for later use by timeslices, notes, and states migration
      activityMappings[mapping.sourceId] = targetActivityId;
      migratedCount++;
    }

    // Store mappings in memory for use by other migration functions
    (globalThis as Record<string, unknown>).__activityMappings =
      activityMappings;

    return {
      success: true,
      migratedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: `Activity migration failed: ${error}`,
    };
  }
}

export interface V1Timeslice {
  timeslice_id: string;
  activity_id: string;
  user_id: string;
  start_time: string;
  end_time: string;
}

export interface V1Note {
  note_id: string;
  timeslice_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface V1State {
  state_id: string;
  timeslice_id: string;
  user_id: string;
  energy?: number;
  created_at: string;
}

interface ProcessedTimeslice {
  sourceId: string;
  data: {
    activity_id: string;
    user_id: string;
    start_time: string;
    end_time: string;
    note_ids: string[];
    state_id: string | null;
  };
}

interface ProcessedNote {
  sourceId: string;
  data: {
    timeslice_id: string;
    user_id: string;
    message: string;
    created_at: string;
  };
}

interface ProcessedState {
  sourceId: string;
  data: {
    timeslice_id: string;
    user_id: string;
    created_at: string;
    energy?: number;
  };
}

// Helper function to fetch notes with pagination
async function fetchNotesWithPagination(
  pageSize: number = 100,
  onProgress?: (current: number, total?: number) => void,
): Promise<V1Note[]> {
  await ensureConnectionHealth();

  // First, get the total count
  const { count: totalCount, error: countError } = await sourceClient
    .from("notes")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Failed to count notes: ${countError.message}`);
  }

  GlobalErrorHandler.logError(
    new Error(`Starting notes fetch: ${totalCount} total notes`),
    "fetchNotesWithPagination",
    { operation: "start_fetch", totalCount },
  );

  const allNotes: V1Note[] = [];
  let currentPage = 0;
  let hasMoreData = true;

  while (hasMoreData) {
    const rangeStart = currentPage * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;

    GlobalErrorHandler.logError(
      new Error(`Fetching notes page ${currentPage + 1}`),
      "fetchNotesWithPagination",
      { operation: "fetch_page", rangeStart, rangeEnd },
    );

    const { data: pageData, error: pageError } = await sourceClient
      .from("notes")
      .select("*")
      .order("note_id")
      .range(rangeStart, rangeEnd);

    if (pageError) {
      throw new Error(`Failed to fetch notes page: ${pageError.message}`);
    }

    if (!pageData || pageData.length === 0) {
      hasMoreData = false;
      break;
    }

    allNotes.push(...pageData);
    currentPage++;

    // Report progress
    if (onProgress) {
      onProgress(allNotes.length, totalCount || undefined);
    }

    // If we got fewer items than page size, we're done
    if (pageData.length < pageSize) {
      hasMoreData = false;
    }

    GlobalErrorHandler.logError(
      new Error(`Fetched ${pageData.length} notes in this page`),
      "fetchNotesWithPagination",
      {
        operation: "page_complete",
        pageSize: pageData.length,
        totalFetched: allNotes.length,
      },
    );
  }

  return allNotes;
}

// Helper function to fetch states with pagination
async function fetchStatesWithPagination(
  pageSize: number = 100,
  onProgress?: (current: number, total?: number) => void,
): Promise<V1State[]> {
  await ensureConnectionHealth();

  // First, get the total count
  const { count: totalCount, error: countError } = await sourceClient
    .from("states")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Failed to count states: ${countError.message}`);
  }

  GlobalErrorHandler.logError(
    new Error(`Starting states fetch: ${totalCount} total states`),
    "fetchStatesWithPagination",
    { operation: "start_fetch", totalCount },
  );

  const allStates: V1State[] = [];
  let currentPage = 0;
  let hasMoreData = true;

  while (hasMoreData) {
    const rangeStart = currentPage * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;

    GlobalErrorHandler.logError(
      new Error(`Fetching states page ${currentPage + 1}`),
      "fetchStatesWithPagination",
      { operation: "fetch_page", rangeStart, rangeEnd },
    );

    const { data: pageData, error: pageError } = await sourceClient
      .from("states")
      .select("*")
      .order("state_id")
      .range(rangeStart, rangeEnd);

    if (pageError) {
      throw new Error(`Failed to fetch states page: ${pageError.message}`);
    }

    if (!pageData || pageData.length === 0) {
      hasMoreData = false;
      break;
    }

    allStates.push(...pageData);
    currentPage++;

    // Report progress
    if (onProgress) {
      onProgress(allStates.length, totalCount || undefined);
    }

    // If we got fewer items than page size, we're done
    if (pageData.length < pageSize) {
      hasMoreData = false;
    }

    GlobalErrorHandler.logError(
      new Error(`Fetched ${pageData.length} states in this page`),
      "fetchStatesWithPagination",
      {
        operation: "page_complete",
        pageSize: pageData.length,
        totalFetched: allStates.length,
      },
    );
  }

  return allStates;
}

// Helper function to fetch timeslices with pagination
async function fetchTimeslicesWithPagination(
  pageSize: number = 1000,
  onProgress?: (current: number, total?: number) => void,
): Promise<V1Timeslice[]> {
  await ensureConnectionHealth();

  // First, get the total count
  const { count: totalCount, error: countError } = await sourceClient
    .from("timeslices")
    .select("*", { count: "exact", head: true });

  if (countError) {
    throw new Error(`Failed to count timeslices: ${countError.message}`);
  }

  GlobalErrorHandler.logError(
    new Error(`Starting timeslice fetch: ${totalCount} total timeslices`),
    "fetchTimeslicesWithPagination",
    { operation: "start_fetch", totalCount },
  );

  const allTimeslices: V1Timeslice[] = [];
  let currentPage = 0;
  let hasMoreData = true;

  while (hasMoreData) {
    const rangeStart = currentPage * pageSize;
    const rangeEnd = rangeStart + pageSize - 1;

    GlobalErrorHandler.logError(
      new Error(`Fetching timeslices page ${currentPage + 1}`),
      "fetchTimeslicesWithPagination",
      { operation: "fetch_page", rangeStart, rangeEnd },
    );

    const { data: pageData, error: pageError } = await sourceClient
      .from("timeslices")
      .select("*")
      .order("start_time")
      .range(rangeStart, rangeEnd);

    if (pageError) {
      throw new Error(`Failed to fetch timeslices page: ${pageError.message}`);
    }

    if (!pageData || pageData.length === 0) {
      hasMoreData = false;
      break;
    }

    allTimeslices.push(...pageData);
    currentPage++;

    // Report progress
    if (onProgress) {
      onProgress(allTimeslices.length, totalCount || undefined);
    }

    // If we got fewer items than page size, we're done
    if (pageData.length < pageSize) {
      hasMoreData = false;
    }

    GlobalErrorHandler.logError(
      new Error(`Fetched ${pageData.length} timeslices in this page`),
      "fetchTimeslicesWithPagination",
      {
        operation: "page_complete",
        pageSize: pageData.length,
        totalFetched: allTimeslices.length,
      },
    );
  }

  return allTimeslices;
}

export async function migrateTimeslices(
  timeslicesStore: {
    insertTimeslice: (timeslice: unknown) => Promise<{ id: string } | null>;
    insertTimeslices: (timeslices: unknown[]) => Promise<{ id: string }[]>;
    timeslices: { id: string }[];
  },
  onProgress?: (current: number, total?: number) => void,
): Promise<MigrationResponse> {
  try {
    await ensureConnectionHealth();

    const activityMappings =
      (globalThis as Record<string, unknown>).__activityMappings as Record<
        string,
        string
      > || {};
    if (Object.keys(activityMappings).length === 0) {
      throw new Error(
        "Activity mappings not found. Please migrate activities first.",
      );
    }

    // Fetch all source timeslices with pagination
    const sourceTimeslices = await fetchTimeslicesWithPagination(
      1000, // Page size
      (current, total) => {
        if (onProgress) {
          // Report fetch progress (first half of the process)
          onProgress(
            Math.floor(current / 2),
            total ? Math.floor(total / 2) : undefined,
          );
        }
      },
    );

    if (sourceTimeslices.length === 0) {
      return {
        success: true,
        migratedCount: 0,
      };
    }

    GlobalErrorHandler.logError(
      new Error(`Starting migration of ${sourceTimeslices.length} timeslices`),
      "migrateTimeslices",
      {
        operation: "start_migration",
        totalTimeslices: sourceTimeslices.length,
      },
    );

    let migratedCount = 0;
    const timesliceMappings: { [key: string]: string } = {};
    const batchSize = 100; // Process in smaller batches for v2 insertion

    // Process timeslices in batches
    for (let i = 0; i < sourceTimeslices.length; i += batchSize) {
      const batch = sourceTimeslices.slice(i, i + batchSize);
      const processedBatch: ProcessedTimeslice[] = [];

      // Prepare batch data
      for (const timeslice of batch) {
        // Get activity mapping
        const targetActivityId = activityMappings[timeslice.activity_id];

        if (!targetActivityId) {
          GlobalErrorHandler.logError(
            new Error(
              `No activity mapping found for timeslice ${timeslice.timeslice_id}`,
            ),
            "migrateTimeslices",
            {
              operation: "skip_unmapped_timeslice",
              timesliceId: timeslice.timeslice_id,
            },
          );
          continue;
        }

        // Convert timestamps from UTC to local time
        const startTime = convertMigrationTimestamp(timeslice.start_time);
        const endTime = convertMigrationTimestamp(timeslice.end_time);

        processedBatch.push({
          sourceId: timeslice.timeslice_id,
          data: {
            activity_id: targetActivityId,
            user_id: timeslice.user_id,
            start_time: startTime.localString,
            end_time: endTime.localString,
            note_ids: [], // Will be updated after notes migration
            state_id: null, // Will be updated after states migration
          },
        });
      }

      if (processedBatch.length === 0) {
        continue;
      }

      // Insert batch using the store
      try {
        const newTimeslices = await timeslicesStore.insertTimeslices(
          processedBatch.map((item) => item.data),
        );

        // Store the mappings for later use
        for (
          let j = 0;
          j < processedBatch.length && j < newTimeslices.length;
          j++
        ) {
          timesliceMappings[processedBatch[j].sourceId] = newTimeslices[j].id;
          migratedCount++;
        }

        GlobalErrorHandler.logError(
          new Error(
            `Successfully migrated batch of ${newTimeslices.length} timeslices`,
          ),
          "migrateTimeslices",
          {
            operation: "batch_complete",
            batchSize: newTimeslices.length,
            totalMigrated: migratedCount,
          },
        );
      } catch (batchError) {
        GlobalErrorHandler.logError(
          batchError as Error,
          "migrateTimeslices",
          {
            operation: "batch_failed",
            batchIndex: Math.floor(i / batchSize),
            batchSize: processedBatch.length,
          },
        );

        // Fall back to individual inserts for this batch
        for (const item of processedBatch) {
          try {
            const newTimeslice = await timeslicesStore.insertTimeslice(
              item.data,
            );
            if (newTimeslice) {
              timesliceMappings[item.sourceId] = newTimeslice.id;
              migratedCount++;
            }
          } catch (individualError) {
            GlobalErrorHandler.logError(
              individualError as Error,
              "migrateTimeslices",
              {
                operation: "individual_insert_failed",
                timesliceId: item.sourceId,
              },
            );
          }
        }
      }

      // Report migration progress (second half of the process)
      if (onProgress) {
        const progressBase = Math.floor(sourceTimeslices.length / 2);
        const currentProgress = Math.floor(
          (migratedCount / sourceTimeslices.length) * progressBase,
        );
        onProgress(progressBase + currentProgress, progressBase * 2);
      }
    }

    // Store mappings in memory for use by other migration functions
    (globalThis as Record<string, unknown>).__timesliceMappings =
      timesliceMappings;

    GlobalErrorHandler.logError(
      new Error(`Completed timeslice migration: ${migratedCount} migrated`),
      "migrateTimeslices",
      { operation: "migration_complete", migratedCount },
    );

    return {
      success: true,
      migratedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: `Timeslice migration failed: ${error}`,
    };
  }
}

export async function migrateNotes(
  notesStore: {
    insertNote: (note: unknown) => Promise<{ id: string } | null>;
    insertNotes: (notes: unknown[]) => Promise<{ id: string }[]>;
  },
  timeslicesStore: {
    timeslices: { id: string; note_ids?: string[] }[];
    updateTimeslice: (timeslice: unknown) => Promise<unknown>;
  },
  onProgress?: (current: number, total?: number) => void,
): Promise<MigrationResponse> {
  try {
    await ensureConnectionHealth();

    const timesliceMappings =
      (globalThis as Record<string, unknown>).__timesliceMappings as Record<
        string,
        string
      > || {};
    if (Object.keys(timesliceMappings).length === 0) {
      throw new Error(
        "Timeslice mappings not found. Please migrate timeslices first.",
      );
    }

    // Fetch all source notes with pagination
    const sourceNotes = await fetchNotesWithPagination(
      100, // Page size
      (current, total) => {
        if (onProgress) {
          // Report fetch progress (first half of the process)
          onProgress(
            Math.floor(current / 2),
            total ? Math.floor(total / 2) : undefined,
          );
        }
      },
    );

    if (sourceNotes.length === 0) {
      return {
        success: true,
        migratedCount: 0,
      };
    }

    GlobalErrorHandler.logError(
      new Error(`Starting migration of ${sourceNotes.length} notes`),
      "migrateNotes",
      { operation: "start_migration", totalNotes: sourceNotes.length },
    );

    let migratedCount = 0;
    let encryptedCount = 0;
    const timesliceNotes: { [key: string]: string[] } = {};
    const batchSize = 50; // Process in smaller batches for notes

    // Process notes in batches
    for (let i = 0; i < sourceNotes.length; i += batchSize) {
      const batch = sourceNotes.slice(i, i + batchSize);
      const processedBatch: ProcessedNote[] = [];

      // Prepare batch data
      for (const note of batch) {
        // Get timeslice mapping
        const targetTimesliceId = timesliceMappings[note.timeslice_id];

        if (!targetTimesliceId) {
          GlobalErrorHandler.logError(
            new Error(`No timeslice mapping found for note ${note.note_id}`),
            "migrateNotes",
            { operation: "skip_unmapped_note", noteId: note.note_id },
          );
          continue;
        }

        // Process the note (decrypt if needed)
        const processedNote = await processNoteForMigration(note.message);

        if (processedNote.wasEncrypted) {
          encryptedCount++;
        }

        processedBatch.push({
          sourceId: note.note_id,
          data: {
            timeslice_id: targetTimesliceId,
            user_id: note.user_id,
            message: processedNote.message,
            created_at: note.created_at,
          },
        });
      }

      if (processedBatch.length === 0) {
        continue;
      }

      // Insert batch using the store
      try {
        const newNotes = await notesStore.insertNotes
          ? await notesStore.insertNotes(
            processedBatch.map((item) => item.data),
          )
          : await Promise.all(
            processedBatch.map((item) => notesStore.insertNote(item.data)),
          );

        // Handle both array of notes and array of individual results
        const notesArray = Array.isArray(newNotes)
          ? newNotes.filter(Boolean)
          : [];

        // Collect notes for each timeslice
        for (
          let j = 0;
          j < processedBatch.length && j < notesArray.length;
          j++
        ) {
          const note = notesArray[j];
          if (note && note.id) {
            const targetTimesliceId = processedBatch[j].data.timeslice_id;

            if (!timesliceNotes[targetTimesliceId]) {
              timesliceNotes[targetTimesliceId] = [];
            }
            timesliceNotes[targetTimesliceId].push(note.id);
            migratedCount++;
          }
        }

        GlobalErrorHandler.logError(
          new Error(
            `Successfully migrated batch of ${notesArray.length} notes`,
          ),
          "migrateNotes",
          {
            operation: "batch_complete",
            batchSize: notesArray.length,
            totalMigrated: migratedCount,
          },
        );
      } catch (batchError) {
        GlobalErrorHandler.logError(
          batchError as Error,
          "migrateNotes",
          {
            operation: "batch_failed",
            batchIndex: Math.floor(i / batchSize),
            batchSize: processedBatch.length,
          },
        );

        // Fall back to individual inserts for this batch
        for (const item of processedBatch) {
          try {
            const newNote = await notesStore.insertNote(item.data);
            if (newNote && newNote.id) {
              const targetTimesliceId = item.data.timeslice_id;

              if (!timesliceNotes[targetTimesliceId]) {
                timesliceNotes[targetTimesliceId] = [];
              }
              timesliceNotes[targetTimesliceId].push(newNote.id);
              migratedCount++;
            }
          } catch (individualError) {
            GlobalErrorHandler.logError(
              individualError as Error,
              "migrateNotes",
              {
                operation: "individual_insert_failed",
                noteId: item.sourceId,
              },
            );
          }
        }
      }

      // Report migration progress (second half of the process)
      if (onProgress) {
        const progressBase = Math.floor(sourceNotes.length / 2);
        const currentProgress = Math.floor(
          (migratedCount / sourceNotes.length) * progressBase,
        );
        onProgress(progressBase + currentProgress, progressBase * 2);
      }
    }

    // Update timeslices with their note IDs
    for (const [timesliceId, noteIds] of Object.entries(timesliceNotes)) {
      // Get current timeslice to preserve existing note_ids
      const currentTimeslices = timeslicesStore.timeslices.filter((t) =>
        t.id === timesliceId
      );
      if (currentTimeslices.length > 0) {
        const currentTimeslice = currentTimeslices[0];
        const updatedNoteIds = [
          ...(currentTimeslice.note_ids || []),
          ...noteIds,
        ];

        await timeslicesStore.updateTimeslice({
          ...currentTimeslice,
          note_ids: updatedNoteIds,
        });
      }
    }

    GlobalErrorHandler.logError(
      new Error(
        `Completed notes migration: ${migratedCount} migrated, ${encryptedCount} encrypted`,
      ),
      "migrateNotes",
      { operation: "migration_complete", migratedCount, encryptedCount },
    );

    return {
      success: true,
      migratedCount,
      encryptedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: `Note migration failed: ${error}`,
    };
  }
}

export async function migrateStates(
  statesStore: {
    insertState: (state: unknown) => Promise<{ id: string } | null>;
    insertStates?: (states: unknown[]) => Promise<{ id: string }[]>;
  },
  timeslicesStore: {
    timeslices: { id: string }[];
    updateTimeslice: (timeslice: unknown) => Promise<unknown>;
  },
  onProgress?: (current: number, total?: number) => void,
): Promise<MigrationResponse> {
  try {
    await ensureConnectionHealth();

    const timesliceMappings =
      (globalThis as Record<string, unknown>).__timesliceMappings as Record<
        string,
        string
      > || {};
    if (Object.keys(timesliceMappings).length === 0) {
      throw new Error(
        "Timeslice mappings not found. Please migrate timeslices first.",
      );
    }

    // Fetch all source states with pagination
    const sourceStates = await fetchStatesWithPagination(
      100, // Page size
      (current, total) => {
        if (onProgress) {
          // Report fetch progress (first half of the process)
          onProgress(
            Math.floor(current / 2),
            total ? Math.floor(total / 2) : undefined,
          );
        }
      },
    );

    if (sourceStates.length === 0) {
      return {
        success: true,
        migratedCount: 0,
      };
    }

    GlobalErrorHandler.logError(
      new Error(`Starting migration of ${sourceStates.length} states`),
      "migrateStates",
      { operation: "start_migration", totalStates: sourceStates.length },
    );

    let migratedCount = 0;
    const batchSize = 50; // Process in smaller batches for states

    // Process states in batches
    for (let i = 0; i < sourceStates.length; i += batchSize) {
      const batch = sourceStates.slice(i, i + batchSize);
      const processedBatch: ProcessedState[] = [];

      // Prepare batch data
      for (const state of batch) {
        // Get timeslice mapping
        const targetTimesliceId = timesliceMappings[state.timeslice_id];

        if (!targetTimesliceId) {
          GlobalErrorHandler.logError(
            new Error(`No timeslice mapping found for state ${state.state_id}`),
            "migrateStates",
            { operation: "skip_unmapped_state", stateId: state.state_id },
          );
          continue;
        }

        // Convert timestamps
        const createdAt = convertMigrationTimestamp(state.created_at);

        // Prepare insert data (only include energy if present)
        const insertData: {
          timeslice_id: string;
          user_id: string;
          created_at: string;
          energy?: number;
        } = {
          timeslice_id: targetTimesliceId,
          user_id: state.user_id,
          created_at: createdAt.localString,
        };

        if (state.energy !== undefined && state.energy !== null) {
          insertData.energy = state.energy;
        }

        processedBatch.push({
          sourceId: state.state_id,
          data: insertData,
        });
      }

      if (processedBatch.length === 0) {
        continue;
      }

      // Insert batch using the store
      try {
        const newStates = statesStore.insertStates
          ? await statesStore.insertStates(
            processedBatch.map((item) => item.data),
          )
          : await Promise.all(
            processedBatch.map((item) => statesStore.insertState(item.data)),
          );

        // Handle both array of states and array of individual results
        const statesArray = Array.isArray(newStates)
          ? newStates.filter(Boolean)
          : [];

        // Update timeslices to reference these states
        for (
          let j = 0;
          j < processedBatch.length && j < statesArray.length;
          j++
        ) {
          const newState = statesArray[j];
          if (newState && newState.id) {
            const targetTimesliceId = processedBatch[j].data.timeslice_id;

            // Update timeslice to reference this state
            const currentTimeslices = timeslicesStore.timeslices.filter((t) =>
              t.id === targetTimesliceId
            );
            if (currentTimeslices.length > 0) {
              const currentTimeslice = currentTimeslices[0];

              await timeslicesStore.updateTimeslice({
                ...currentTimeslice,
                state_id: newState.id,
              });
            }

            migratedCount++;
          }
        }

        GlobalErrorHandler.logError(
          new Error(
            `Successfully migrated batch of ${statesArray.length} states`,
          ),
          "migrateStates",
          {
            operation: "batch_complete",
            batchSize: statesArray.length,
            totalMigrated: migratedCount,
          },
        );
      } catch (batchError) {
        GlobalErrorHandler.logError(
          batchError as Error,
          "migrateStates",
          {
            operation: "batch_failed",
            batchIndex: Math.floor(i / batchSize),
            batchSize: processedBatch.length,
          },
        );

        // Fall back to individual inserts for this batch
        for (const item of processedBatch) {
          try {
            const newState = await statesStore.insertState(item.data);
            if (newState && newState.id) {
              const targetTimesliceId = item.data.timeslice_id;

              // Update timeslice to reference this state
              const currentTimeslices = timeslicesStore.timeslices.filter((t) =>
                t.id === targetTimesliceId
              );
              if (currentTimeslices.length > 0) {
                const currentTimeslice = currentTimeslices[0];

                await timeslicesStore.updateTimeslice({
                  ...currentTimeslice,
                  state_id: newState.id,
                });
              }

              migratedCount++;
            }
          } catch (individualError) {
            GlobalErrorHandler.logError(
              individualError as Error,
              "migrateStates",
              {
                operation: "individual_insert_failed",
                stateId: item.sourceId,
              },
            );
          }
        }
      }

      // Report migration progress (second half of the process)
      if (onProgress) {
        const progressBase = Math.floor(sourceStates.length / 2);
        const currentProgress = Math.floor(
          (migratedCount / sourceStates.length) * progressBase,
        );
        onProgress(progressBase + currentProgress, progressBase * 2);
      }
    }

    GlobalErrorHandler.logError(
      new Error(`Completed states migration: ${migratedCount} migrated`),
      "migrateStates",
      { operation: "migration_complete", migratedCount },
    );

    return {
      success: true,
      migratedCount,
    };
  } catch (error) {
    return {
      success: false,
      error: `State migration failed: ${error}`,
    };
  }
}
