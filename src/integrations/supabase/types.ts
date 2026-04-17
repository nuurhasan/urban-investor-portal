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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      board_members: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          photo_url: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      facilities: {
        Row: {
          address: string | null
          annual_revenue: number | null
          city: string | null
          country: string | null
          created_at: string
          estimated_value: number | null
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          net_lettable_area: number | null
          net_operating_income: number | null
          occupancy_pct: number | null
          overview_text: string | null
          postcode: string | null
          revenue_per_unit: number | null
          sort_order: number
          state: string | null
          status: string
          thumbnail_url: string | null
          total_units: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          estimated_value?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          net_lettable_area?: number | null
          net_operating_income?: number | null
          occupancy_pct?: number | null
          overview_text?: string | null
          postcode?: string | null
          revenue_per_unit?: number | null
          sort_order?: number
          state?: string | null
          status?: string
          thumbnail_url?: string | null
          total_units?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          annual_revenue?: number | null
          city?: string | null
          country?: string | null
          created_at?: string
          estimated_value?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          net_lettable_area?: number | null
          net_operating_income?: number | null
          occupancy_pct?: number | null
          overview_text?: string | null
          postcode?: string | null
          revenue_per_unit?: number | null
          sort_order?: number
          state?: string | null
          status?: string
          thumbnail_url?: string | null
          total_units?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      facility_photos: {
        Row: {
          caption: string | null
          created_at: string
          facility_id: string
          id: string
          sort_order: number
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          facility_id: string
          id?: string
          sort_order?: number
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          facility_id?: string
          id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_photos_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      facility_unit_mixes: {
        Row: {
          created_at: string
          facility_id: string
          id: string
          monthly_rate: number | null
          sort_order: number
          unit_count: number
          unit_size_sqm: number | null
          unit_type: string
        }
        Insert: {
          created_at?: string
          facility_id: string
          id?: string
          monthly_rate?: number | null
          sort_order?: number
          unit_count?: number
          unit_size_sqm?: number | null
          unit_type: string
        }
        Update: {
          created_at?: string
          facility_id?: string
          id?: string
          monthly_rate?: number | null
          sort_order?: number
          unit_count?: number
          unit_size_sqm?: number | null
          unit_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "facility_unit_mixes_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_documents: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          sort_order: number
          storage_path: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sort_order?: number
          storage_path: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sort_order?: number
          storage_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_metrics: {
        Row: {
          category: string
          created_at: string
          id: string
          label: string
          period: string
          sort_order: number
          updated_at: string
          value: number
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          label: string
          period?: string
          sort_order?: number
          updated_at?: string
          value?: number
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          label?: string
          period?: string
          sort_order?: number
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      growth_pipeline: {
        Row: {
          created_at: string
          estimated_units: number | null
          estimated_value: number | null
          id: string
          location: string | null
          name: string
          notes: string | null
          sort_order: number
          status: Database["public"]["Enums"]["pipeline_status"]
          target_close_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_units?: number | null
          estimated_value?: number | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["pipeline_status"]
          target_close_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_units?: number | null
          estimated_value?: number | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["pipeline_status"]
          target_close_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      kpi_values: {
        Row: {
          created_at: string
          id: string
          label: string
          sort_order: number
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          body: string | null
          created_at: string
          id: string
          key: string
          title: string | null
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          key: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          key?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_user_approved: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "advisor" | "investor"
      approval_status: "pending" | "approved" | "rejected"
      pipeline_status:
        | "prospect"
        | "due_diligence"
        | "under_contract"
        | "completed"
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
    Enums: {
      app_role: ["admin", "advisor", "investor"],
      approval_status: ["pending", "approved", "rejected"],
      pipeline_status: [
        "prospect",
        "due_diligence",
        "under_contract",
        "completed",
      ],
    },
  },
} as const
