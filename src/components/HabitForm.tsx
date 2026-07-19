import type { CSSProperties } from "react";
import { FormEvent, useState } from "react";
import { CalendarDays, Flame, Plus } from "lucide-react";
import type { HabitCadence, HabitDraft, HabitTone } from "../types";
import { dayName } from "../lib/reminderRules";

interface HabitFormProps {
  onSave: (draft: HabitDraft) => Promise<void> | void;
}

const colors = ["#ef6f56", "#2f8f83", "#3e6fb6", "#d39b2a", "#7c5cc4"];
const icons = ["flame", "dumbbell", "book-open", "droplets"];
const tones: Array<{ value: HabitTone; label: string }> = [
  { value: "strict", label: "Estricto" },
  { value: "hard", label: "Duro" },
  { value: "direct", label: "Directo" }
];

export function HabitForm({ onSave }: HabitFormProps) {
  const [title, setTitle] = useState("");
  const [cadence, setCadence] = useState<HabitCadence>("daily");
  const [scheduleDays, setScheduleDays] = useState([1, 2, 3, 4, 5]);
  const [reminderTime, setReminderTime] = useState("07:30");
  const [tone, setTone] = useState<HabitTone>("strict");
  const [color, setColor] = useState(colors[0]);
  const [icon, setIcon] = useState(icons[0]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await onSave({
      title,
      cadence,
      scheduleDays: cadence === "daily" ? [0, 1, 2, 3, 4, 5, 6] : scheduleDays,
      reminderTime,
      tone,
      color,
      icon
    });

    setTitle("");
  }

  function toggleDay(day: number) {
    setScheduleDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day].sort()
    );
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <label>
        Habito
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej. caminar 20 minutos"
          required
        />
      </label>

      <div className="field-grid">
        <label>
          Hora
          <input
            type="time"
            value={reminderTime}
            onChange={(event) => setReminderTime(event.target.value)}
            required
          />
        </label>
        <label>
          Tono
          <select value={tone} onChange={(event) => setTone(event.target.value as HabitTone)}>
            {tones.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <fieldset>
        <legend>Frecuencia</legend>
        <div className="segmented">
          {[
            ["daily", "Diario"],
            ["weekdays", "Lun-Vie"],
            ["custom", "Custom"]
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={cadence === value ? "active" : ""}
              onClick={() => setCadence(value as HabitCadence)}
            >
              <CalendarDays size={17} />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {cadence === "custom" ? (
        <div className="day-picker" aria-label="Dias del habito">
          {[0, 1, 2, 3, 4, 5, 6].map((day) => (
            <button
              key={day}
              type="button"
              className={scheduleDays.includes(day) ? "active" : ""}
              onClick={() => toggleDay(day)}
            >
              {dayName(day)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="choice-row" aria-label="Color del habito">
        {colors.map((option) => (
          <button
            key={option}
            type="button"
            className={color === option ? "color-swatch active" : "color-swatch"}
            style={{ "--swatch-color": option } as CSSProperties}
            aria-label={`Color ${option}`}
            onClick={() => setColor(option)}
          />
        ))}
      </div>

      <div className="choice-row" aria-label="Icono del habito">
        {icons.map((option) => (
          <button
            key={option}
            type="button"
            className={icon === option ? "icon-choice active" : "icon-choice"}
            aria-label={`Icono ${option}`}
            onClick={() => setIcon(option)}
          >
            <Flame size={18} />
          </button>
        ))}
      </div>

      <button className="primary-action" type="submit">
        <Plus size={20} />
        Crear habito
      </button>
    </form>
  );
}
