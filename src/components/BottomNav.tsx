import { BarChart3, CalendarCheck, ListChecks, Settings } from "lucide-react";
import type { TabKey } from "../types";

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const navItems: Array<{ key: TabKey; label: string; icon: typeof CalendarCheck }> = [
  { key: "today", label: "Hoy", icon: CalendarCheck },
  { key: "habits", label: "Habitos", icon: ListChecks },
  { key: "progress", label: "Progreso", icon: BarChart3 },
  { key: "settings", label: "Ajustes", icon: Settings }
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            key={item.key}
            type="button"
            className={activeTab === item.key ? "active" : ""}
            onClick={() => onTabChange(item.key)}
          >
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
