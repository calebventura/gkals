import type { Habit, HabitCompletion } from "../types";

const today = new Date().toISOString().slice(0, 10);

export const demoHabits: Habit[] = [
  {
    id: "demo-1",
    userId: "local-demo",
    title: "Entrenar 30 minutos",
    cadence: "weekdays",
    scheduleDays: [1, 2, 3, 4, 5],
    reminderTime: "07:30",
    reminderRetries: [0, 30, 120, 360],
    tone: "strict",
    color: "#ef6f56",
    icon: "dumbbell",
    isPaused: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-2",
    userId: "local-demo",
    title: "Leer 10 paginas",
    cadence: "daily",
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: "21:00",
    reminderRetries: [0, 45, 180],
    tone: "hard",
    color: "#2f8f83",
    icon: "book-open",
    isPaused: false,
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-3",
    userId: "local-demo",
    title: "Tomar agua",
    cadence: "daily",
    scheduleDays: [0, 1, 2, 3, 4, 5, 6],
    reminderTime: "10:00",
    reminderRetries: [0, 60, 180],
    tone: "direct",
    color: "#3e6fb6",
    icon: "droplets",
    isPaused: false,
    createdAt: new Date().toISOString()
  }
];

export const demoCompletions: HabitCompletion[] = [
  {
    id: "completion-demo-2",
    habitId: "demo-2",
    completedOn: today,
    count: 1,
    createdAt: new Date().toISOString()
  }
];
