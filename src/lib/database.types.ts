export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type HabitRow = {
  id: string;
  user_id: string;
  title: string;
  cadence: "daily" | "weekdays" | "custom";
  schedule_days: number[];
  reminder_time: string;
  reminder_retries: number[];
  tone: "strict" | "hard" | "direct";
  color: string;
  icon: string;
  is_paused: boolean;
  created_at: string;
  updated_at: string;
};

type HabitInsert = {
  id?: string;
  user_id: string;
  title: string;
  cadence?: "daily" | "weekdays" | "custom";
  schedule_days?: number[];
  reminder_time?: string;
  reminder_retries?: number[];
  tone?: "strict" | "hard" | "direct";
  color?: string;
  icon?: string;
  is_paused?: boolean;
  created_at?: string;
  updated_at?: string;
};

type CompletionRow = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_on: string;
  count: number;
  created_at: string;
};

type CompletionInsert = {
  id?: string;
  habit_id: string;
  user_id: string;
  completed_on: string;
  count?: number;
  created_at?: string;
};

type NotificationSubscriptionRow = {
  id: string;
  user_id: string;
  endpoint: string;
  keys: Record<string, string>;
  user_agent: string | null;
  created_at: string;
};

type NotificationSubscriptionInsert = {
  id?: string;
  user_id: string;
  endpoint: string;
  keys: Record<string, string>;
  user_agent?: string | null;
  created_at?: string;
};

export interface Database {
  public: {
    Tables: {
      habits: {
        Row: HabitRow;
        Insert: HabitInsert;
        Update: Partial<HabitInsert>;
        Relationships: [];
      };
      habit_completions: {
        Row: CompletionRow;
        Insert: CompletionInsert;
        Update: Partial<CompletionInsert>;
        Relationships: [];
      };
      notification_subscriptions: {
        Row: NotificationSubscriptionRow;
        Insert: NotificationSubscriptionInsert;
        Update: Partial<NotificationSubscriptionInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
