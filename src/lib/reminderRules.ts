import type { Habit, HabitCompletion, HabitStatus } from "../types";

export function formatDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function isHabitScheduledToday(habit: Habit, date = new Date()) {
  if (habit.isPaused) {
    return false;
  }

  const day = date.getDay();

  if (habit.cadence === "daily") {
    return true;
  }

  if (habit.cadence === "weekdays") {
    return day >= 1 && day <= 5;
  }

  return habit.scheduleDays.includes(day);
}

export function getHabitStatus(
  habit: Habit,
  completions: HabitCompletion[],
  date = new Date()
): HabitStatus {
  if (habit.isPaused || !isHabitScheduledToday(habit, date)) {
    return "paused";
  }

  const completedToday = completions.some(
    (completion) => completion.habitId === habit.id && completion.completedOn === formatDateKey(date)
  );

  if (completedToday) {
    return "done";
  }

  return hasReminderTimePassed(habit.reminderTime, date) ? "overdue" : "pending";
}

export function hasReminderTimePassed(reminderTime: string, date = new Date()) {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const target = new Date(date);
  target.setHours(hours, minutes, 0, 0);

  return date.getTime() > target.getTime();
}

export function cadenceLabel(habit: Habit) {
  if (habit.cadence === "daily") {
    return "Diario";
  }

  if (habit.cadence === "weekdays") {
    return "Lun a Vie";
  }

  return habit.scheduleDays.map(dayName).join(", ");
}

export function dayName(day: number) {
  return ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][day] ?? "Dia";
}
