/**
 * Migration Store Utilities
 * Handles the creation and management of migration helper tables and logs
 * These utilities will be used server-side to manage migration state
 */

export interface ActivityMapEntry {
  source_id: string;
  target_id: string;
  created_at: string;
  source_name: string;
  target_name: string;
  migration_type: 'existing' | 'new';
}

export interface TimesliceMapEntry {
  source_id: string;
  target_id: string;
  created_at: string;
  source_activity_id: string;
  target_activity_id: string;
}

export interface NoteMapEntry {
  source_id: string;
  target_id: string;
  created_at: string;
  source_timeslice_id: string;
  target_timeslice_id: string;
  was_encrypted: boolean;
  decryption_successful: boolean;
}

export interface StateMapEntry {
  source_id: string;
  target_id: string;
  created_at: string;
  source_timeslice_id: string;
  target_timeslice_id: string;
}

export interface MigrationLogEntry {
  id: string;
  created_at: string;
  operation: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  meta?: {
    [key: string]: any;
  };
}

export interface MigrationSession {
  id: string;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed' | 'failed';
  source_url: string;
  target_url: string;
  total_activities: number;
  total_timeslices: number;
  total_notes: number;
  total_states: number;
  migrated_activities: number;
  migrated_timeslices: number;
  migrated_notes: number;
  migrated_states: number;
}

/**
 * SQL queries for creating migration helper tables
 */
export const MIGRATION_SCHEMA_SQL = {
  createSchema: `
    CREATE SCHEMA IF NOT EXISTS migration;
  `,

  createActivityMap: `
    CREATE TABLE IF NOT EXISTS migration.activity_map (
      source_id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      source_name TEXT,
      target_name TEXT,
      migration_type TEXT CHECK (migration_type IN ('existing', 'new'))
    );
  `,

  createTimesliceMap: `
    CREATE TABLE IF NOT EXISTS migration.timeslice_map (
      source_id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      source_activity_id TEXT,
      target_activity_id TEXT
    );
  `,

  createNoteMap: `
    CREATE TABLE IF NOT EXISTS migration.note_map (
      source_id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      source_timeslice_id TEXT,
      target_timeslice_id TEXT,
      was_encrypted BOOLEAN DEFAULT FALSE,
      decryption_successful BOOLEAN DEFAULT TRUE
    );
  `,

  createStateMap: `
    CREATE TABLE IF NOT EXISTS migration.state_map (
      source_id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      source_timeslice_id TEXT,
      target_timeslice_id TEXT
    );
  `,

  createLog: `
    CREATE TABLE IF NOT EXISTS migration.log (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      operation TEXT NOT NULL,
      status TEXT CHECK (status IN ('success', 'error', 'warning')),
      message TEXT NOT NULL,
      meta JSONB
    );
  `,

  createSession: `
    CREATE TABLE IF NOT EXISTS migration.session (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
      started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      completed_at TIMESTAMP WITH TIME ZONE,
      status TEXT CHECK (status IN ('in_progress', 'completed', 'failed')),
      source_url TEXT NOT NULL,
      target_url TEXT NOT NULL,
      total_activities INTEGER DEFAULT 0,
      total_timeslices INTEGER DEFAULT 0,
      total_notes INTEGER DEFAULT 0,
      total_states INTEGER DEFAULT 0,
      migrated_activities INTEGER DEFAULT 0,
      migrated_timeslices INTEGER DEFAULT 0,
      migrated_notes INTEGER DEFAULT 0,
      migrated_states INTEGER DEFAULT 0
    );
  `,
};

/**
 * SQL queries for managing migration data
 */
export const MIGRATION_QUERIES = {
  // Activity mapping
  insertActivityMap: `
    INSERT INTO migration.activity_map
    (source_id, target_id, source_name, target_name, migration_type)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (source_id)
    DO UPDATE SET
      target_id = EXCLUDED.target_id,
      target_name = EXCLUDED.target_name,
      migration_type = EXCLUDED.migration_type;
  `,

  getActivityMapping: `
    SELECT * FROM migration.activity_map WHERE source_id = $1;
  `,

  getAllActivityMappings: `
    SELECT * FROM migration.activity_map ORDER BY created_at;
  `,

  // Timeslice mapping
  insertTimesliceMap: `
    INSERT INTO migration.timeslice_map
    (source_id, target_id, source_activity_id, target_activity_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (source_id)
    DO UPDATE SET
      target_id = EXCLUDED.target_id,
      target_activity_id = EXCLUDED.target_activity_id;
  `,

  getTimesliceMapping: `
    SELECT * FROM migration.timeslice_map WHERE source_id = $1;
  `,

  // Note mapping
  insertNoteMap: `
    INSERT INTO migration.note_map
    (source_id, target_id, source_timeslice_id, target_timeslice_id, was_encrypted, decryption_successful)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (source_id)
    DO UPDATE SET
      target_id = EXCLUDED.target_id,
      target_timeslice_id = EXCLUDED.target_timeslice_id,
      was_encrypted = EXCLUDED.was_encrypted,
      decryption_successful = EXCLUDED.decryption_successful;
  `,

  getNoteMapping: `
    SELECT * FROM migration.note_map WHERE source_id = $1;
  `,

  // State mapping
  insertStateMap: `
    INSERT INTO migration.state_map
    (source_id, target_id, source_timeslice_id, target_timeslice_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (source_id)
    DO UPDATE SET
      target_id = EXCLUDED.target_id,
      target_timeslice_id = EXCLUDED.target_timeslice_id;
  `,

  getStateMapping: `
    SELECT * FROM migration.state_map WHERE source_id = $1;
  `,

  // Logging
  insertLog: `
    INSERT INTO migration.log (operation, status, message, meta)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `,

  getLogsByOperation: `
    SELECT * FROM migration.log
    WHERE operation = $1
    ORDER BY created_at DESC;
  `,

  getRecentLogs: `
    SELECT * FROM migration.log
    ORDER BY created_at DESC
    LIMIT $1;
  `,

  // Session management
  createSession: `
    INSERT INTO migration.session
    (source_url, target_url, total_activities, total_timeslices, total_notes, total_states)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `,

  updateSessionProgress: `
    UPDATE migration.session
    SET migrated_activities = $2,
        migrated_timeslices = $3,
        migrated_notes = $4,
        migrated_states = $5
    WHERE id = $1
    RETURNING *;
  `,

  completeSession: `
    UPDATE migration.session
    SET status = $2, completed_at = NOW()
    WHERE id = $1
    RETURNING *;
  `,

  getActiveSession: `
    SELECT * FROM migration.session
    WHERE status = 'in_progress'
    ORDER BY started_at DESC
    LIMIT 1;
  `,

  // Cleanup queries
  clearMappingTables: `
    TRUNCATE migration.activity_map,
             migration.timeslice_map,
             migration.note_map,
             migration.state_map
    RESTART IDENTITY CASCADE;
  `,

  dropMigrationSchema: `
    DROP SCHEMA IF EXISTS migration CASCADE;
  `,

  // Statistics queries
  getMigrationStats: `
    SELECT
      COUNT(*) as total_activities,
      (SELECT COUNT(*) FROM migration.timeslice_map) as total_timeslices,
      (SELECT COUNT(*) FROM migration.note_map) as total_notes,
      (SELECT COUNT(*) FROM migration.state_map) as total_states,
      (SELECT COUNT(*) FROM migration.note_map WHERE was_encrypted = true) as encrypted_notes,
      (SELECT COUNT(*) FROM migration.note_map WHERE was_encrypted = true AND decryption_successful = false) as failed_decryptions
    FROM migration.activity_map;
  `,
};

/**
 * Helper functions for migration operations
 */
export class MigrationStore {
  /**
   * Initialize migration schema and tables
   * @param client - Database client
   */
  static async initializeSchema(client: any): Promise<void> {
    const queries = Object.values(MIGRATION_SCHEMA_SQL);

    for (const query of queries) {
      await client.query(query);
    }
  }

  /**
   * Create a new migration session
   * @param client - Database client
   * @param sessionData - Session initialization data
   */
  static async createSession(
    client: any,
    sessionData: {
      sourceUrl: string;
      targetUrl: string;
      totalActivities: number;
      totalTimeslices: number;
      totalNotes: number;
      totalStates: number;
    }
  ): Promise<MigrationSession> {
    const result = await client.query(MIGRATION_QUERIES.createSession, [
      sessionData.sourceUrl,
      sessionData.targetUrl,
      sessionData.totalActivities,
      sessionData.totalTimeslices,
      sessionData.totalNotes,
      sessionData.totalStates,
    ]);

    return result.rows[0];
  }

  /**
   * Log a migration operation
   * @param client - Database client
   * @param operation - Operation name
   * @param status - Operation status
   * @param message - Log message
   * @param meta - Optional metadata
   */
  static async log(
    client: any,
    operation: string,
    status: 'success' | 'error' | 'warning',
    message: string,
    meta?: any
  ): Promise<MigrationLogEntry> {
    const result = await client.query(MIGRATION_QUERIES.insertLog, [
      operation,
      status,
      message,
      meta ? JSON.stringify(meta) : null,
    ]);

    return result.rows[0];
  }

  /**
   * Check if migration has already been performed
   * @param client - Database client
   * @returns Boolean indicating if migration exists
   */
  static async hasPreviousMigration(client: any): Promise<boolean> {
    try {
      const result = await client.query('SELECT COUNT(*) FROM migration.activity_map');
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      // Schema might not exist yet
      return false;
    }
  }

  /**
   * Get migration statistics
   * @param client - Database client
   */
  static async getStats(client: any): Promise<{
    totalActivities: number;
    totalTimeslices: number;
    totalNotes: number;
    totalStates: number;
    encryptedNotes: number;
    failedDecryptions: number;
  }> {
    const result = await client.query(MIGRATION_QUERIES.getMigrationStats);
    const row = result.rows[0];

    return {
      totalActivities: parseInt(row.total_activities),
      totalTimeslices: parseInt(row.total_timeslices),
      totalNotes: parseInt(row.total_notes),
      totalStates: parseInt(row.total_states),
      encryptedNotes: parseInt(row.encrypted_notes),
      failedDecryptions: parseInt(row.failed_decryptions),
    };
  }
}