# Gkals Habits PWA

PWA movil para iPhone, enfocada en programar habitos, marcar cumplimiento diario y repetir recordatorios cuando un habito queda vencido.

## Stack

- React + Vite + TypeScript
- Supabase Auth, Postgres y Edge Functions
- Service worker propio con Web Push
- UI mobile-first para iPhone con safe areas

## Arranque

```bash
npm install
npm run icons
cp .env.example .env
npm run dev
```

Configura en `.env`:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_VAPID_PUBLIC_KEY=
```

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en SQL Editor.
3. En Authentication, desactiva confirmacion de email para que las cuentas se creen sin verificacion.
4. Copia URL y anon key al `.env`.

Para recordatorios push:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set VAPID_PUBLIC_KEY=...
supabase secrets set VAPID_PRIVATE_KEY=...
supabase secrets set VAPID_SUBJECT=mailto:ops@example.com
supabase secrets set CRON_SECRET=...
supabase functions deploy send-habit-reminders
```

Programa la funcion cada 10 minutos desde Supabase Scheduler o un cron externo con header:

```text
Authorization: Bearer $CRON_SECRET
```

## iPhone

Para Web Push en iOS, la app debe estar instalada desde Safari en la pantalla de inicio y servida por HTTPS. La persistencia se implementa repitiendo recordatorios en el backend, usando `requireInteraction` cuando el navegador lo soporte y manteniendo deuda visible dentro de la app.

## Tono de mensajes

El lenguaje agresivo queda centralizado en `src/lib/motivation.ts` y en la funcion `send-habit-reminders`. Hay tres tonos: `strict`, `hard` y `direct`. Cambiar la personalidad no requiere tocar las pantallas.
