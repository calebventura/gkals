import { BellRing, Smartphone } from "lucide-react";
import { isInstalledPwa, supportsPushNotifications } from "../lib/notifications";

interface NotificationPanelProps {
  onEnable: () => Promise<void>;
  message: string;
}

export function NotificationPanel({ onEnable, message }: NotificationPanelProps) {
  const canUsePush = supportsPushNotifications();
  const installed = isInstalledPwa();

  return (
    <section className="status-panel">
      <div className="status-icon">
        {installed ? <BellRing size={22} /> : <Smartphone size={22} />}
      </div>
      <div>
        <h2>Recordatorios persistentes</h2>
        <p>
          {installed
            ? "Activa push para insistir cuando un habito quede vencido."
            : "En iPhone, instala la PWA en inicio para recibir push."}
        </p>
        {message ? <p className="panel-message">{message}</p> : null}
      </div>
      <button className="secondary-action compact" type="button" onClick={onEnable} disabled={!canUsePush}>
        Activar
      </button>
    </section>
  );
}
