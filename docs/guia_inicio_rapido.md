# Guía de Inicio Rápido - Gkals

Esta guía te ayudará a levantar todo el ecosistema de tu aplicación en tu entorno local.

## Requisitos Previos
1. **Docker** debe estar abierto y ejecutándose (requerido para el motor de base de datos y Storage de Supabase en local).
2. **Node.js** instalado.

---

## Paso 1: Levantar el Backend (Supabase Local)
Todo el sistema de base de datos, perfiles de usuario, y el `Storage` (donde se guardan las fotos de las rachas) funciona con Supabase. 

Abre una terminal y ejecuta:
```bash
cd /home/kali/projects/gkals
npx supabase start
```

*Nota: La primera vez puede tomar un par de minutos mientras Docker levanta los contenedores. Al finalizar, la consola te mostrará las credenciales locales (Studio URL, API URL, anon key). Tu base de datos y tu bucket `habit_proofs` ya están configurados allí.*

*(Cuando termines de trabajar y quieras apagar el backend, simplemente usa el comando `npx supabase stop`)*.

---

## Paso 2: Levantar el Frontend (React / Vite)
Abre **una nueva pestaña** en tu terminal (sin cerrar la de Supabase) para arrancar la aplicación gráfica:

```bash
cd /home/kali/projects/gkals
npm install
npm run dev
```

La consola te indicará que el servidor está corriendo (usualmente en `http://localhost:5173`).

---

## Paso 3: Probar la Aplicación
1. Abre tu navegador y dirígete a **[http://localhost:5173](http://localhost:5173)**.
2. Si prefieres no crear una cuenta real aún, la app detectará automáticamente si estás en un entorno local y te permitirá entrar en "Modo Demo" para probar los hábitos y rachas.
3. ¡Crea un hábito, márcalo como completado para subir una prueba, y revisa cómo Rabi (tu mascota) reacciona a tus rachas globales!
