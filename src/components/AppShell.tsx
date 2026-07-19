import type { ReactNode } from "react";
import { Bell, LogOut } from "lucide-react";
import type { TabKey } from "../types";
import { BottomNav } from "./BottomNav";

interface AppShellProps {
  activeTab: TabKey;
  children: ReactNode;
  globalStreak?: number;
  onTabChange: (tab: TabKey) => void;
  onSignOut: () => void;
}

export function AppShell({ activeTab, children, globalStreak = 0, onTabChange, onSignOut }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="top-bar">
        <div>
          <p className="eyebrow">Gkals</p>
          <h1>{titleForTab(activeTab)}</h1>
        </div>
        <div className="top-actions">
          <div className="global-streak">
            <span>{globalStreak}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M12 2c0 0-4.5 4.5-4.5 9.5 0 2.2 1.3 4.2 3.2 5.2-.2-1.1.2-2.3 1-3.2 1 1 1.8 2.3 1.8 3.8 0 .5-.1 1-.3 1.4 2.1-.8 3.5-2.8 3.5-5.2C16.7 8.5 12 2 12 2zm-1 18.8c-.3.1-.7.2-1 .2-2.8 0-5-2.2-5-5 0-2.8 2.2-6.6 2.2-6.6.6 1.8 2 3.1 3.8 3.6.1 2.9 2.1 4.7 2.1 4.7-1.3 1.4-2.1 3.1-2.1 3.1z"/>
            </svg>
          </div>
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
