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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      capsule_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          room_id: string
          sender_device: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: string
          room_id: string
          sender_device: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          room_id?: string
          sender_device?: string
        }
        Relationships: [
          {
            foreignKeyName: "capsule_events_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      capsules: {
        Row: {
          caption: string
          created_at: string
          id: string
          note: string
          opened_at: string | null
          photo_url: string | null
          room_id: string
          sender_device: string
          sender_name: string | null
          updated_at: string
          voice_seconds: number | null
          voice_url: string | null
        }
        Insert: {
          caption?: string
          created_at?: string
          id?: string
          note?: string
          opened_at?: string | null
          photo_url?: string | null
          room_id: string
          sender_device: string
          sender_name?: string | null
          updated_at?: string
          voice_seconds?: number | null
          voice_url?: string | null
        }
        Update: {
          caption?: string
          created_at?: string
          id?: string
          note?: string
          opened_at?: string | null
          photo_url?: string | null
          room_id?: string
          sender_device?: string
          sender_name?: string | null
          updated_at?: string
          voice_seconds?: number | null
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capsules_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          device_id: string
          endpoint: string
          id: string
          p256dh: string
          room_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          device_id: string
          endpoint: string
          id?: string
          p256dh: string
          room_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          device_id?: string
          endpoint?: string
          id?: string
          p256dh?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          code: string
          created_at: string
          guest_device: string | null
          guest_name: string | null
          host_device: string
          host_name: string | null
          id: string
          paired_at: string | null
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          guest_device?: string | null
          guest_name?: string | null
          host_device: string
          host_name?: string | null
          id?: string
          paired_at?: string | null
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          guest_device?: string | null
          guest_name?: string | null
          host_device?: string
          host_name?: string | null
          id?: string
          paired_at?: string | null
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fold_create_room: {
        Args: { p_device: string; p_name: string }
        Returns: {
          code: string
          created_at: string
          guest_device: string | null
          guest_name: string | null
          host_device: string
          host_name: string | null
          id: string
          paired_at: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fold_get_room: {
        Args: { p_device: string; p_id: string }
        Returns: {
          code: string
          created_at: string
          guest_device: string | null
          guest_name: string | null
          host_device: string
          host_name: string | null
          id: string
          paired_at: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fold_is_member: {
        Args: { p_device: string; p_room: string }
        Returns: boolean
      }
      fold_join_room: {
        Args: { p_code: string; p_device: string; p_name: string }
        Returns: {
          code: string
          created_at: string
          guest_device: string | null
          guest_name: string | null
          host_device: string
          host_name: string | null
          id: string
          paired_at: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "rooms"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fold_list_capsules: {
        Args: { p_device: string; p_room: string }
        Returns: {
          caption: string
          created_at: string
          id: string
          note: string
          opened_at: string | null
          photo_url: string | null
          room_id: string
          sender_device: string
          sender_name: string | null
          updated_at: string
          voice_seconds: number | null
          voice_url: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "capsules"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      fold_mark_opened: {
        Args: { p_device: string; p_id: string }
        Returns: {
          caption: string
          created_at: string
          id: string
          note: string
          opened_at: string | null
          photo_url: string | null
          room_id: string
          sender_device: string
          sender_name: string | null
          updated_at: string
          voice_seconds: number | null
          voice_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "capsules"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      fold_save_push_subscription: {
        Args: {
          p_auth: string
          p_device: string
          p_endpoint: string
          p_p256dh: string
          p_room: string
        }
        Returns: undefined
      }
      fold_send_capsule: {
        Args: {
          p_caption: string
          p_device: string
          p_name: string
          p_note: string
          p_photo: string
          p_room: string
          p_voice: string
          p_voice_seconds: number
        }
        Returns: {
          caption: string
          created_at: string
          id: string
          note: string
          opened_at: string | null
          photo_url: string | null
          room_id: string
          sender_device: string
          sender_name: string | null
          updated_at: string
          voice_seconds: number | null
          voice_url: string | null
        }
        SetofOptions: {
          from: "*"
          to: "capsules"
          isOneToOne: true
          isSetofReturn: false
        }
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
