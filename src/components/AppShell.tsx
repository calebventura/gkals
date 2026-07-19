import type { ReactNode } from "react";
import { Bell, LogOut } from "lucide-react";
import type { TabKey } from "../types";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  activeTab: TabKey;
  children: ReactNode;
  onTabChange: (tab: TabKey) => void;
  onSignOut: () => void;
}

export function AppShell({ activeTab, children, onTabChange, onSignOut }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Gkals</p>
          <h1>{titleForTab(activeTab)}</h1>
        </div>
        <div className="top-actions">
          <button className="icon-button" type="button" aria-label="Notificaciones">
            <Bell size={21} />
          </button>
          <button className="icon-button" type="button" aria-label="Salir" onClick={onSignOut}>
            <LogOut size={21} />
          </button>
        </div>
      </header>

      <div className="screen-content">{children}</div>
      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

function titleForTab(tab: TabKey) {
  if (tab === "habits") {
    return "Habitos";
  }

  if (tab === "progress") {
    return "Progreso";
  }

  if (tab === "settings") {
    return "Ajustes";
  }

  return "Hoy";
}
