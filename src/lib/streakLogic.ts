import type { Habit, HabitCompletion } from "../types";
import { isHabitScheduledToday as isHabitScheduledForDate } from "./reminderRules";

export function calculateHabitStreak(habit: Habit, completions: HabitCompletion[]): number {
  const habitCompletions = completions.filter(c => c.habitId === habit.id);
  const datesSet = new Set(habitCompletions.map(c => c.completedOn));
  
  let streak = 0;
  let currentDate = new Date();
  
  // Check today
  const todayKey = toDateKey(currentDate);
  if (datesSet.has(todayKey)) {
    streak++;
  } else if (isHabitScheduledForDate(habit, currentDate)) {
    // If it's scheduled today and not done, it might be overdue or just pending.
    // If we only count strict unbroken past streaks, we start checking yesterday.
    // However, if today is missed but the day isn't over, the streak from yesterday might still be alive.
  }

  // Go backwards day by day
  currentDate.setDate(currentDate.getDate() - 1);
  
  while (true) {
    const key = toDateKey(currentDate);
    
    if (datesSet.has(key)) {
      streak++;
    } else {
      // If no completion, check if it was scheduled
      if (isHabitScheduledForDate(habit, currentDate)) {
        // Scheduled but missed, streak broken
        break;
      }
      // If not scheduled, it doesn't break the streak, we just skip the day
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
    
    // Safety break to prevent infinite loops if something goes wrong
    if (streak > 10000) break;
  }
  
  return streak;
}

export function calculateGlobalStreak(completions: HabitCompletion[]): number {
  const datesSet = new Set(completions.map(c => c.completedOn));
  
  let streak = 0;
  let currentDate = new Date();
  
  const todayKey = toDateKey(currentDate);
  if (datesSet.has(todayKey)) {
    streak++;
  }
  
  currentDate.setDate(currentDate.getDate() - 1);
  
  while (true) {
    const key = toDateKey(currentDate);
    if (datesSet.has(key)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
