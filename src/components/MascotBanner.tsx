import React from "react";

interface Props {
  globalStreak: number;
  freezes: number;
  overdueCount: number;
}

export function MascotBanner({ globalStreak, freezes, overdueCount }: Props) {
  let state: "success" | "danger" | "normal" = "normal";
  let message = `"¡A mantener esa racha soldado! No hay excusas hoy."`;

  if (overdueCount > 0) {
    state = "danger";
    message = `"Tienes ${overdueCount} hábito(s) atrasado(s). ¿Vas a perder todo tu progreso por una excusa barata? ¡Muévete!"`;
  } else if (globalStreak > 0 && globalStreak % 6 === 0) {
    state = "success";
    message = `"Felicidades soldado. 6 días perfectos. Te has ganado un congelador. Úsalo sabiamente."`;
  }

  return (
    <div className={`mascot-banner ${state}`}>
      <img src="/mascot.jpg" alt="Sargento Hoot" className="mascot-img" />
      <div className="mascot-bubble">
        <h3>Sargento Hoot</h3>
        <p>{message}</p>
        {freezes > 0 && (
          <div className="freezes-count">❄️ Congeladores disponibles: {freezes}</div>
        )}
      </div>
    </div>
  );
}
