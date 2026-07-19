import type { HabitStatus, HabitTone } from "../types";

const completed: Record<HabitTone, string[]> = {
  strict: [
    "Cumpliste. Eso era lo que tocaba.",
    "Bien. Hoy no fallaste.",
    "Hecho. No conviertas esto en una excepcion."
  ],
  hard: [
    "Eso. Cero excusas hoy.",
    "Cumplido. Mantente asi o vuelves a empezar de cero.",
    "Bien. La disciplina no negocia."
  ],
  direct: [
    "Listo. Sigue con el siguiente.",
    "Cumplido. No aflojes.",
    "Hoy sumaste. Mantente encima."
  ]
};

const pending: Record<HabitTone, string[]> = {
  strict: [
    "Todavia esta pendiente. No lo patees mas.",
    "Si dijiste que lo harias, hazlo.",
    "No dejes que una excusa te gane el dia."
  ],
  hard: [
    "Lo estas dejando pasar. Levantate y terminalo.",
    "Cada minuto que lo aplazas es una decision.",
    "No conviertas la flojera en identidad."
  ],
  direct: [
    "Pendiente. Hazlo antes de que se te vaya el dia.",
    "Aun falta. Cierra esto.",
    "No lo negocies tanto. Avanza."
  ]
};

const overdue: Record<HabitTone, string[]> = {
  strict: [
    "Ya vas tarde. Recupera el control.",
    "Tu promesa esta vencida. Responde con accion.",
    "No le regales otro dia a la inercia."
  ],
  hard: [
    "Fallaste el horario. Todavia puedes evitar fallar el dia.",
    "La deuda ya empezo. Pagala con accion.",
    "Si no lo haces ahora, la excusa gana."
  ],
  direct: [
    "Atrasado. Todavia cuenta si lo cierras.",
    "Se paso la hora. Hazlo igual.",
    "No esta perdido. Terminalo."
  ]
};

export function getMotivation(status: HabitStatus, tone: HabitTone, seed: string) {
  const bank =
    status === "done" ? completed[tone] : status === "overdue" ? overdue[tone] : pending[tone];

  return bank[hash(seed) % bank.length];
}

export function getPushReminderCopy(habitTitle: string, tone: HabitTone) {
  const text = getMotivation("overdue", tone, `${habitTitle}-${new Date().getHours()}`);

  return {
    title: `${habitTitle} sigue pendiente`,
    body: text
  };
}

function hash(value: string) {
  let output = 0;
  for (let index = 0; index < value.length; index += 1) {
    output = (output << 5) - output + value.charCodeAt(index);
    output |= 0;
  }

  return Math.abs(output);
}
