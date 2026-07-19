import type { Habit, HabitCompletion } from "../types";
import { formatDateKey } from "../lib/reminderRules";

interface StatsProps {
  habits: Habit[];
  completions: HabitCompletion[];
}

export function Stats({ habits, completions }: StatsProps) {
  const today = formatDateKey();
  const completedToday = completions.filter((completion) => completion.completedOn === today).length;
  const activeHabits = habits.filter((habit) => !habit.isPaused).length;
  const completionRate = activeHabits === 0 ? 0 : Math.round((completedToday / activeHabits) * 100);
  const totalCompletions = completions.length;

  return (
    <section className="stats-grid">
      <article>
        <span>{completionRate}%</span>
        <p>Hoy</p>
      </article>
      <article>
        <span>{activeHabits}</span>
        <p>Activos</p>
      </article>
      <article>
        <span>{totalCompletions}</span>
        <p>Cierres</p>
      </article>
    </section>
  );
}
