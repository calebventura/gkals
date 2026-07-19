export type HabitCadence = "daily" | "weekdays" | "custom";
export type HabitTone = "strict" | "hard" | "direct";
export type HabitStatus = "done" | "pending" | "overdue" | "paused";
export type TabKey = "today" | "habits" | "progress" | "settings";

export interface Habit {
  id: string;
  userId: string;
  title: string;
  cadence: HabitCadence;
  scheduleDays: number[];
  reminderTime: string;
  reminderRetries: number[];
  tone: HabitTone;
  color: string;
  icon: string;
  isPaused: boolean;
  createdAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  completedOn: string;
  count: number;
  createdAt: string;
}

export interface HabitDraft {
  title: string;
  cadence: HabitCadence;
  scheduleDays: number[];
  reminderTime: string;
  tone: HabitTone;
  color: string;
  icon: string;
}

export interface HabitViewModel extends Habit {
  status: HabitStatus;
  completedToday: boolean;
  todayCompletion?: HabitCompletion;
}
