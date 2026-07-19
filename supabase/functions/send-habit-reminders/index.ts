import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type Habit = {
  id: string;
  user_id: string;
  title: string;
  cadence: "daily" | "weekdays" | "custom";
  schedule_days: number[];
  reminder_time: string;
  reminder_retries: number[];
  tone: "strict" | "hard" | "direct";
  is_paused: boolean;
};

type PushSubscriptionRow = {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY")!;
const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY")!;
const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:ops@example.com";
const cronSecret = Deno.env.get("CRON_SECRET");

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

const supabase = createClient(supabaseUrl, serviceRoleKey);

serve(async (request) => {
  if (cronSecret && request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const eventDate = now.toISOString().slice(0, 10);
  const day = now.getUTCDay();
  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

  const { data: habits, error: habitsError } = await supabase
    .from("habits")
    .select("id,user_id,title,cadence,schedule_days,reminder_time,reminder_retries,tone,is_paused")
    .eq("is_paused", false);

  if (habitsError) {
    return json({ error: habitsError.message }, 500);
  }

  const dueHabits = (habits as Habit[]).filter((habit) =>
    isScheduledToday(habit, day) && dueRetryMinute(habit, currentMinutes) !== null
  );

  if (dueHabits.length === 0) {
    return json({ delivered: 0 });
  }

  const habitIds = dueHabits.map((habit) => habit.id);
  const { data: completedRows } = await supabase
    .from("habit_completions")
    .select("habit_id")
    .in("habit_id", habitIds)
    .eq("completed_on", eventDate);

  const completedHabitIds = new Set((completedRows ?? []).map((row) => row.habit_id));
  const pendingHabits = dueHabits.filter((habit) => !completedHabitIds.has(habit.id));

  let delivered = 0;

  for (const habit of pendingHabits) {
    const retryMinute = dueRetryMinute(habit, currentMinutes);
    if (retryMinute === null) {
      continue;
    }

    const { data: existingEvent } = await supabase
      .from("notification_events")
      .select("id")
      .eq("habit_id", habit.id)
      .eq("event_date", eventDate)
      .eq("retry_minute", retryMinute)
      .maybeSingle();

    if (existingEvent) {
      continue;
    }

    const { data: subscriptions } = await supabase
      .from("notification_subscriptions")
      .select("endpoint,keys")
      .eq("user_id", habit.user_id);

    for (const subscription of (subscriptions ?? []) as PushSubscriptionRow[]) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          },
          JSON.stringify({
            title: `${habit.title} sigue pendiente`,
            body: reminderBody(habit.tone),
            habitId: habit.id,
            tag: `habit-${habit.id}`,
            url: "/"
          })
        );

        delivered += 1;
      } catch (error) {
        await supabase.from("notification_events").insert({
          user_id: habit.user_id,
          habit_id: habit.id,
          event_date: eventDate,
          retry_minute: retryMinute,
          error: error instanceof Error ? error.message : "web-push failed"
        });
        continue;
      }
    }

    await supabase.from("notification_events").insert({
      user_id: habit.user_id,
      habit_id: habit.id,
      event_date: eventDate,
      retry_minute: retryMinute,
      delivered_at: new Date().toISOString()
    });
  }

  return json({ delivered });
});

function isScheduledToday(habit: Habit, utcDay: number) {
  if (habit.cadence === "daily") {
    return true;
  }

  if (habit.cadence === "weekdays") {
    return utcDay >= 1 && utcDay <= 5;
  }

  return habit.schedule_days.includes(utcDay);
}

function dueRetryMinute(habit: Habit, currentMinutes: number) {
  const [hour, minute] = habit.reminder_time.split(":").map(Number);
  const targetMinutes = hour * 60 + minute;

  return (
    habit.reminder_retries.find((retryMinute) => {
      const dueMinute = targetMinutes + retryMinute;
      return currentMinutes >= dueMinute && currentMinutes < dueMinute + 10;
    }) ?? null
  );
}

function reminderBody(tone: Habit["tone"]) {
  const messages: Record<Habit["tone"], string[]> = {
    strict: [
      "Ya vas tarde. Recupera el control.",
      "Tu promesa esta vencida. Responde con accion."
    ],
    hard: [
      "Fallaste el horario. Todavia puedes evitar fallar el dia.",
      "La deuda ya empezo. Pagala con accion."
    ],
    direct: ["Atrasado. Cierralo ahora.", "Se paso la hora. Hazlo igual."]
  };

  const bank = messages[tone];
  return bank[Math.floor(Math.random() * bank.length)];
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json"
    }
  });
}
