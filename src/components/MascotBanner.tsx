import React from "react";

interface Props {
  globalStreak: number;
  freezes: number;
  overdueCount: number;
}

export function MascotBanner({ globalStreak, freezes, overdueCount }: Props) {
  let state: "success" | "danger" | "normal" = "normal";
  let message = `"¡A mantener esa racha, no hay excusas hoy!"`;

  if (overdueCount > 0) {
    state = "danger";
    message = `"Tienes ${overdueCount} hábito(s) atrasado(s). ¿Vas a perder todo tu progreso por una excusa barata?"`;
  } else if (globalStreak > 0 && globalStreak % 6 === 0) {
    state = "success";
    message = `"¡Felicidades! 6 días perfectos. Te has ganado un congelador. Úsalo sabiamente."`;
  }

  return (
    <div className={`mascot-banner ${state}`}>
      <img src="/rabi.svg" alt="Rabi" className="mascot-img" />
      <div className="mascot-bubble">
        <h3>Rabi</h3>
        <p>{message}</p>
        {freezes > 0 && (
          <div className="freezes-count">❄️ Congeladores disponibles: {freezes}</div>
        )}
      </div>
    </div>
  );
}
