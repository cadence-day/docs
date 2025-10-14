export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          revoked_at: string | null
          scopes: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          revoked_at?: string | null
          scopes?: Json
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          revoked_at?: string | null
          scopes?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      activities: {
        Row: {
          activity_category_id: string | null
          color: string | null
          id: string | null
          name: string | null
          parent_activity_id: string | null
          status: "ENABLED" | "DISABLED" | "DELETED" | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          activity_category_id?: string | null
          color?: string | null
          id?: string | null
          name?: string | null
          parent_activity_id?: string | null
          status?: "ENABLED" | "DISABLED" | "DELETED" | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          activity_category_id?: string | null
          color?: string | null
          id?: string | null
          name?: string | null
          parent_activity_id?: string | null
          status?: "ENABLED" | "DISABLED" | "DELETED" | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      activity_categories: {
        Row: {
          color: string | null
          id: string | null
          key: string | null
        }
        Insert: {
          color?: string | null
          id?: string | null
          key?: string | null
        }
        Update: {
          color?: string | null
          id?: string | null
          key?: string | null
        }
        Relationships: []
      }
      current_week_kpis: {
        Row: {
          current_value: number | null
          kpi_name: string | null
          status: string | null
          target_value: number | null
          unit: string | null
        }
        Relationships: []
      }
      encryption_legacy: {
        Row: {
          encryption_key: string | null
          legacy_email: string | null
          user_id: string | null
        }
        Insert: {
          encryption_key?: string | null
          legacy_email?: string | null
          user_id?: string | null
        }
        Update: {
          encryption_key?: string | null
          legacy_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: string | null
          message: string | null
          timeslice_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string | null
          message?: string | null
          timeslice_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string | null
          message?: string | null
          timeslice_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          email_enabled: boolean | null
          expo_push_token: string | null
          hours_of_reminders: string[] | null
          id: string | null
          notification_type:
            | ("morning-reminders" | "evening-reminders" | "midday-checkins")[]
            | null
          push_enabled: boolean | null
          sleep_time: string | null
          timezone: string | null
          user_id: string | null
          wake_up_time: string | null
        }
        Insert: {
          email_enabled?: boolean | null
          expo_push_token?: string | null
          hours_of_reminders?: string[] | null
          id?: string | null
          notification_type?:
            | ("morning-reminders" | "evening-reminders" | "midday-checkins")[]
            | null
          push_enabled?: boolean | null
          sleep_time?: string | null
          timezone?: string | null
          user_id?: string | null
          wake_up_time?: string | null
        }
        Update: {
          email_enabled?: boolean | null
          expo_push_token?: string | null
          hours_of_reminders?: string[] | null
          id?: string | null
          notification_type?:
            | ("morning-reminders" | "evening-reminders" | "midday-checkins")[]
            | null
          push_enabled?: boolean | null
          sleep_time?: string | null
          timezone?: string | null
          user_id?: string | null
          wake_up_time?: string | null
        }
        Relationships: []
      }
      states: {
        Row: {
          energy: number | null
          id: string | null
          mood: number | null
          timeslice_id: string | null
          user_id: string | null
        }
        Insert: {
          energy?: number | null
          id?: string | null
          mood?: number | null
          timeslice_id?: string | null
          user_id?: string | null
        }
        Update: {
          energy?: number | null
          id?: string | null
          mood?: number | null
          timeslice_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      timeslices: {
        Row: {
          activity_id: string | null
          end_time: string | null
          id: string | null
          note_ids: string[] | null
          start_time: string | null
          state_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_id?: string | null
          end_time?: string | null
          id?: string | null
          note_ids?: string[] | null
          start_time?: string | null
          state_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_id?: string | null
          end_time?: string | null
          id?: string | null
          note_ids?: string[] | null
          start_time?: string | null
          state_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      weekly_kpi_summary: {
        Row: {
          avg_days_active_per_user: number | null
          avg_energy_score: number | null
          avg_mood_score: number | null
          avg_note_length: number | null
          avg_notes_per_user: number | null
          avg_session_duration: number | null
          avg_sessions_per_user: number | null
          avg_timeslices_per_user: number | null
          avg_unique_activities_per_user: number | null
          data_completeness_rate: number | null
          note_completion_rate: number | null
          state_tracking_rate: number | null
          total_active_users: number | null
          total_activity_minutes: number | null
          total_notes: number | null
          total_timeslices: number | null
          week_end_date: string | null
          week_start_date: string | null
        }
        Relationships: []
      }
      weekly_user_statistics: {
        Row: {
          average_energy_score: number | null
          average_mood_score: number | null
          days_active: number | null
          total_activity_duration_minutes: number | null
          total_notes_created: number | null
          total_timeslices_created: number | null
          unique_activities_used: number | null
          user_id: string | null
          week_end_date: string | null
          week_start_date: string | null
        }
        Insert: {
          average_energy_score?: number | null
          average_mood_score?: number | null
          days_active?: number | null
          total_activity_duration_minutes?: number | null
          total_notes_created?: number | null
          total_timeslices_created?: number | null
          unique_activities_used?: number | null
          user_id?: string | null
          week_end_date?: string | null
          week_start_date?: string | null
        }
        Update: {
          average_energy_score?: number | null
          average_mood_score?: number | null
          days_active?: number | null
          total_activity_duration_minutes?: number | null
          total_notes_created?: number | null
          total_timeslices_created?: number | null
          unique_activities_used?: number | null
          user_id?: string | null
          week_end_date?: string | null
          week_start_date?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      api_key_has_scope: {
        Args: { bearer: string; resource: string; verb: string }
        Returns: boolean
      }
      api_key_owner: {
        Args: { bearer: string }
        Returns: string
      }
      postgres_fdw_disconnect: {
        Args: { "": string }
        Returns: boolean
      }
      postgres_fdw_disconnect_all: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      postgres_fdw_get_connections: {
        Args: Record<PropertyKey, never>
        Returns: Record<string, unknown>[]
      }
      postgres_fdw_handler: {
        Args: Record<PropertyKey, never>
        Returns: unknown
      }
      requesting_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      sha256_hex: {
        Args: { input: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
