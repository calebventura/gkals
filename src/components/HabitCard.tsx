import type { CSSProperties } from "react";
import { BookOpen, Check, Droplets, Dumbbell, Flame, MoreHorizontal } from "lucide-react";
import type { HabitViewModel } from "../types";
import { cadenceLabel } from "../lib/reminderRules";
import { getMotivation } from "../lib/motivation";

interface HabitCardProps {
  habit: HabitViewModel;
  streak: number;
  onToggleComplete: (habit: HabitViewModel, proofFile?: File) => void;
  onEdit?: (habit: HabitViewModel) => void;
}

const iconMap = {
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  droplets: Droplets,
  flame: Flame
};

import { useRef } from "react";

export function HabitCard({ habit, streak, onToggleComplete, onEdit }: HabitCardProps) {
  const Icon = iconMap[habit.icon as keyof typeof iconMap] ?? Flame;
  const message = getMotivation(habit.status, habit.tone, `${habit.id}-${habit.status}`);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCompleteClick = () => {
    if (habit.completedToday) {
      // Un-toggle
      onToggleComplete(habit);
    } else {
      // Trigger file picker
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onToggleComplete(habit, file);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          <div className="streak-badge">
            <Flame size={12} />
            Racha: {streak} {streak === 1 ? "día" : "días"}
          </div>
        </div>
      </div>

      <input 
        type="file" 
        accept="image/*,audio/*" 
        capture="environment" 
        style={{ display: "none" }} 
        ref={fileInputRef} 
        onChange={handleFileChange}
      />
      <button
        className="complete-button"
        type="button"
        aria-pressed={habit.completedToday}
        onClick={handleCompleteClick}
        disabled={habit.status === "paused"}
      >
        <Check size={22} />
      </button>
    </article>
  );
}
