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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      loan_applications: {
        Row: {
          county: string | null
          created_at: string
          disbursement_date: string | null
          disbursement_status: string | null
          excise_duty_amount: number
          full_name: string
          id: string
          interest_rate: number | null
          loan_amount_requested: number
          loan_purpose: string | null
          monthly_income: string | null
          mpesa_number: string | null
          national_id: string | null
          payment_completed_at: string | null
          payment_status: string | null
          phone_number: string
          qualification_status: string | null
          qualified_amount: number
          repayment_amount: number | null
          repayment_date: string | null
          repayment_status: string | null
          sub_county: string | null
          updated_at: string
        }
        Insert: {
          county?: string | null
          created_at?: string
          disbursement_date?: string | null
          disbursement_status?: string | null
          excise_duty_amount: number
          full_name: string
          id?: string
          interest_rate?: number | null
          loan_amount_requested: number
          loan_purpose?: string | null
          monthly_income?: string | null
          mpesa_number?: string | null
          national_id?: string | null
          payment_completed_at?: string | null
          payment_status?: string | null
          phone_number: string
          qualification_status?: string | null
          qualified_amount: number
          repayment_amount?: number | null
          repayment_date?: string | null
          repayment_status?: string | null
          sub_county?: string | null
          updated_at?: string
        }
        Update: {
          county?: string | null
          created_at?: string
          disbursement_date?: string | null
          disbursement_status?: string | null
          excise_duty_amount?: number
          full_name?: string
          id?: string
          interest_rate?: number | null
          loan_amount_requested?: number
          loan_purpose?: string | null
          monthly_income?: string | null
          mpesa_number?: string | null
          national_id?: string | null
          payment_completed_at?: string | null
          payment_status?: string | null
          phone_number?: string
          qualification_status?: string | null
          qualified_amount?: number
          repayment_amount?: number | null
          repayment_date?: string | null
          repayment_status?: string | null
          sub_county?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mpesa_payments: {
        Row: {
          account_name: string | null
          amount: number
          checkout_request_id: string | null
          created_at: string
          customer_name: string | null
          id: string
          mpesa_message: string
          package_id: string | null
          paybill_number: string | null
          payment_date: string | null
          payment_status: string | null
          phone_number: string | null
          transaction_code: string | null
          updated_at: string
          user_id: string | null
          verified_at: string | null
        }
        Insert: {
          account_name?: string | null
          amount: number
          checkout_request_id?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          mpesa_message: string
          package_id?: string | null
          paybill_number?: string | null
          payment_date?: string | null
          payment_status?: string | null
          phone_number?: string | null
          transaction_code?: string | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Update: {
          account_name?: string | null
          amount?: number
          checkout_request_id?: string | null
          created_at?: string
          customer_name?: string | null
          id?: string
          mpesa_message?: string
          package_id?: string | null
          paybill_number?: string | null
          payment_date?: string | null
          payment_status?: string | null
          phone_number?: string | null
          transaction_code?: string | null
          updated_at?: string
          user_id?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string
          clicked_at: string | null
          created_at: string
          delivery_status: string
          id: string
          loan_application_id: string | null
          notification_type: string
          phone_number: string
          sent_at: string
          title: string
        }
        Insert: {
          body: string
          clicked_at?: string | null
          created_at?: string
          delivery_status?: string
          id?: string
          loan_application_id?: string | null
          notification_type?: string
          phone_number: string
          sent_at?: string
          title: string
        }
        Update: {
          body?: string
          clicked_at?: string | null
          created_at?: string
          delivery_status?: string
          id?: string
          loan_application_id?: string | null
          notification_type?: string
          phone_number?: string
          sent_at?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notification_logs_loan_application"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_amount: number
          bonus_credited_at: string | null
          created_at: string
          id: string
          loan_completed: boolean
          loan_completed_at: string | null
          referral_code: string
          referred_phone: string
          referrer_phone: string
          status: string
        }
        Insert: {
          bonus_amount?: number
          bonus_credited_at?: string | null
          created_at?: string
          id?: string
          loan_completed?: boolean
          loan_completed_at?: string | null
          referral_code: string
          referred_phone: string
          referrer_phone: string
          status?: string
        }
        Update: {
          bonus_amount?: number
          bonus_credited_at?: string | null
          created_at?: string
          id?: string
          loan_completed?: boolean
          loan_completed_at?: string | null
          referral_code?: string
          referred_phone?: string
          referrer_phone?: string
          status?: string
        }
        Relationships: []
      }
      savings_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_application_id: string | null
          mpesa_transaction_code: string | null
          phone_number: string
          status: string
          transaction_type: string
          user_savings_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_application_id?: string | null
          mpesa_transaction_code?: string | null
          phone_number: string
          status?: string
          transaction_type?: string
          user_savings_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_application_id?: string | null
          mpesa_transaction_code?: string | null
          phone_number?: string
          status?: string
          transaction_type?: string
          user_savings_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "savings_transactions_loan_application_id_fkey"
            columns: ["loan_application_id"]
            isOneToOne: false
            referencedRelation: "loan_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "savings_transactions_user_savings_id_fkey"
            columns: ["user_savings_id"]
            isOneToOne: false
            referencedRelation: "user_savings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          is_active: boolean
          p256dh_key: string
          phone_number: string
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          is_active?: boolean
          p256dh_key: string
          phone_number: string
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          is_active?: boolean
          p256dh_key?: string
          phone_number?: string
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_savings: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          loan_limit_multiplier: number
          national_id: string | null
          phone_number: string
          referral_code: string | null
          referral_earnings: number
          total_savings: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          loan_limit_multiplier?: number
          national_id?: string | null
          phone_number: string
          referral_code?: string | null
          referral_earnings?: number
          total_savings?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          loan_limit_multiplier?: number
          national_id?: string | null
          phone_number?: string
          referral_code?: string | null
          referral_earnings?: number
          total_savings?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_payment_status: {
        Args: { request_id: string }
        Returns: {
          amount: number
          payment_status: string
          verified_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
