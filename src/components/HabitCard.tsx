import type { CSSProperties } from "react";
import { BookOpen, Check, Droplets, Dumbbell, Flame, MoreHorizontal } from "lucide-react";
import type { HabitViewModel } from "../types";
import { cadenceLabel } from "../lib/reminderRules";
import { getMotivation } from "../lib/motivation";

interface HabitCardProps {
  habit: HabitViewModel;
  onToggleComplete: (habit: HabitViewModel) => void;
  onEdit?: (habit: HabitViewModel) => void;
}

const iconMap = {
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  droplets: Droplets,
  flame: Flame
};

export function HabitCard({ habit, onToggleComplete, onEdit }: HabitCardProps) {
  const Icon = iconMap[habit.icon as keyof typeof iconMap] ?? Flame;
  const message = getMotivation(habit.status, habit.tone, `${habit.id}-${habit.status}`);

  return (
    <article
      className={`habit-card ${habit.status}`}
      style={{ "--habit-color": habit.color } as CSSProperties}
    >
      <div className="habit-main">
        <div className="habit-icon" aria-hidden="true">
          <Icon size={24} />
        </div>
        <div className="habit-copy">
          <div className="habit-title-row">
            <h2>{habit.title}</h2>
            <button
              className="tiny-icon-button"
              type="button"
              aria-label={`Editar ${habit.title}`}
              onClick={() => onEdit?.(habit)}
            >
              <MoreHorizontal size={19} />
            </button>
          </div>
          <p>{message}</p>
          <div className="habit-meta">
            <span>{habit.reminderTime}</span>
            <span>{cadenceLabel(habit)}</span>
          </div>
        </div>
      </div>

      <button
        className="complete-button"
        type="button"
        aria-pressed={habit.completedToday}
        onClick={() => onToggleComplete(habit)}
        disabled={habit.status === "paused"}
      >
        <Check size={22} />
      </button>
    </article>
  );
}
