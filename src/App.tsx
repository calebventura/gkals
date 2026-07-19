import { useEffect, useMemo, useState } from "react";
import { Plus, RotateCcw } from "lucide-react";
import { AuthScreen } from "./components/AuthScreen";
import { AppShell } from "./components/AppShell";
import { HabitCard } from "./components/HabitCard";
import { HabitForm } from "./components/HabitForm";
import { NotificationPanel } from "./components/NotificationPanel";
import { Stats } from "./components/Stats";
import { demoCompletions, demoHabits } from "./data/demo";
import { useAuth } from "./hooks/useAuth";
import { registerPushSubscription } from "./lib/notifications";
import { formatDateKey, getHabitStatus, isHabitScheduledToday } from "./lib/reminderRules";
import { calculateGlobalStreak, calculateHabitStreak } from "./lib/streakLogic";
import { supabase } from "./lib/supabase";
import type { Habit, HabitCompletion, HabitDraft, HabitViewModel, TabKey } from "./types";
import { MascotBanner } from "./components/MascotBanner";

export default function App() {
  const { session, loading, isSupabaseConfigured, signIn, signOut, signUp } = useAuth();
  const [demoMode, setDemoMode] = useState(!isSupabaseConfigured);
  const [activeTab, setActiveTab] = useState<TabKey>("today");
  const [habits, setHabits] = useState<Habit[]>(demoHabits);
  const [completions, setCompletions] = useState<HabitCompletion[]>(demoCompletions);
  const [streakFreezes, setStreakFreezes] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [notice, setNotice] = useState("");

  const globalStreak = calculateGlobalStreak(completions);

  const userId = session?.user.id ?? (demoMode ? "local-demo" : "");
  const isLocal = demoMode || !session || !supabase;

  useEffect(() => {
    if (!session || !supabase) {
      setHabits(demoHabits);
      setCompletions(demoCompletions);
      return;
    }

    void loadRemoteData(session.user.id);
  }, [session]);

  const habitViews = useMemo<HabitViewModel[]>(() => {
    return habits.map((habit) => {
      const status = getHabitStatus(habit, completions);
      const todayCompletion = completions.find(
        (completion) =>
          completion.habitId === habit.id && completion.completedOn === formatDateKey()
      );

      return {
        ...habit,
        status,
        completedToday: Boolean(todayCompletion),
        todayCompletion
      };
    });
  }, [habits, completions]);

  const todayHabits = habitViews.filter((habit) => isHabitScheduledToday(habit) || habit.status === "done");
  const overdueCount = habitViews.filter((habit) => habit.status === "overdue").length;

  async function loadRemoteData(remoteUserId: string) {
    const [
      { data: habitRows, error: habitsError }, 
      { data: completionRows, error: completionsError },
      { data: profileRows }
    ] = await Promise.all([
        supabase!
          .from("habits")
          .select("*")
          .eq("user_id", remoteUserId)
          .order("reminder_time", { ascending: true }),
        supabase!
          .from("habit_completions")
          .select("*")
          .eq("user_id", remoteUserId)
          .order("created_at", { ascending: false }),
        supabase!
          .from("profiles")
          .select("streak_freezes")
          .eq("id", remoteUserId)
          .single()
      ]);

    if (habitsError || completionsError) {
      setNotice(habitsError?.message ?? completionsError?.message ?? "No se pudo cargar.");
      return;
    }

    setHabits(
      habitRows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        title: row.title,
        cadence: row.cadence as any,
        scheduleDays: row.schedule_days,
        reminderTime: row.reminder_time.slice(0, 5),
        reminderRetries: row.reminder_retries,
        tone: row.tone as any,
        color: row.color,
        icon: row.icon,
        isPaused: row.is_paused,
        createdAt: row.created_at
      }))
    );

    setCompletions(
      completionRows.map((row) => ({
        id: row.id,
        habitId: row.habit_id,
        completedOn: row.completed_on,
        count: row.count,
        proofUrl: row.proof_url,
        proofType: row.proof_type as any,
        isFreeze: row.is_freeze,
        createdAt: row.created_at
      }))
    );

    if (profileRows) {
      setStreakFreezes(profileRows.streak_freezes || 0);
    }
  }

  async function handleCreateHabit(draft: HabitDraft) {
    const habit: Habit = {
      id: crypto.randomUUID(),
      userId,
      title: draft.title,
      cadence: draft.cadence,
      scheduleDays: draft.scheduleDays,
      reminderTime: draft.reminderTime,
      reminderRetries: [0, 30, 120, 360],
      tone: draft.tone,
      color: draft.color,
      icon: draft.icon,
      isPaused: false,
      createdAt: new Date().toISOString()
    };

    setHabits((current) => [habit, ...current]);
    setIsCreating(false);
    setActiveTab("today");

    if (!isLocal) {
      const { error } = await supabase!.from("habits").insert({
        id: habit.id,
        user_id: habit.userId,
        title: habit.title,
        cadence: habit.cadence,
        schedule_days: habit.scheduleDays,
        reminder_time: habit.reminderTime,
        reminder_retries: habit.reminderRetries,
        tone: habit.tone,
        color: habit.color,
        icon: habit.icon,
        is_paused: habit.isPaused
      });

      if (error) {
        setNotice(error.message);
      }
    }
  }

  async function handleToggleComplete(habit: HabitViewModel, proofFile?: File) {
    if (habit.completedToday && habit.todayCompletion) {
      setCompletions((current) => current.filter((completion) => completion.id !== habit.todayCompletion?.id));

      if (!isLocal) {
        const { error } = await supabase!
          .from("habit_completions")
          .delete()
          .eq("id", habit.todayCompletion.id);

        if (error) {
          setNotice(error.message);
        }
      }

      return;
    }

    let proofUrl = null;
    let proofType: "image" | "audio" | "none" = "none";

    if (proofFile && !isLocal) {
      const ext = proofFile.name.split('.').pop();
      const filename = `${userId}/${habit.id}-${Date.now()}.${ext}`;
      const { data, error } = await supabase!.storage.from("habit_proofs").upload(filename, proofFile);
      if (error) {
        setNotice("Error subiendo prueba: " + error.message);
      } else if (data) {
        const { data: publicData } = supabase!.storage.from("habit_proofs").getPublicUrl(filename);
        proofUrl = publicData.publicUrl;
        proofType = proofFile.type.startsWith("audio") ? "audio" : "image";
      }
    }

    const completion: HabitCompletion = {
      id: crypto.randomUUID(),
      habitId: habit.id,
      completedOn: formatDateKey(),
      count: 1,
      proofUrl,
      proofType,
      isFreeze: false,
      createdAt: new Date().toISOString()
    };

    const newCompletions = [completion, ...completions];
    setCompletions(newCompletions);
    
    // Check if global streak just hit a multiple of 6
    const oldStreak = calculateGlobalStreak(completions);
    const newStreak = calculateGlobalStreak(newCompletions);
    
    let newFreezes = streakFreezes;
    if (newStreak > oldStreak && newStreak > 0 && newStreak % 6 === 0) {
      newFreezes = streakFreezes + 1;
      setStreakFreezes(newFreezes);
      // Give them the freezer
      if (!isLocal) {
        supabase!.from("profiles").update({ streak_freezes: newFreezes }).eq("id", userId).then();
      }
    }

    if (!isLocal) {
      const { error } = await supabase!.from("habit_completions").insert({
        id: completion.id,
        user_id: userId,
        habit_id: completion.habitId,
        completed_on: completion.completedOn,
        count: completion.count,
        proof_url: proofUrl,
        proof_type: proofType,
        is_freeze: false
      });

      if (error) {
        setNotice(error.message);
      }
    }
  }

  async function handleEnableNotifications() {
    setNotice("");

    try {
      await registerPushSubscription(userId);
      setNotice("Notificaciones activadas. Si fallas, la app insistira.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "No se pudo activar push.");
    }
  }

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="app-mark">G</div>
      </main>
    );
  }

  if (!session && !demoMode) {
    return (
      <AuthScreen
        isSupabaseConfigured={isSupabaseConfigured}
        onDemoStart={() => setDemoMode(true)}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    );
  }

  return (
    <AppShell activeTab={activeTab} globalStreak={globalStreak} onTabChange={setActiveTab} onSignOut={isLocal ? () => setDemoMode(false) : signOut}>
      {activeTab === "today" ? (
        <div className="stack">
          <section className="today-hero">
            <div>
              <p className="eyebrow">Pendientes vencidos</p>
              <span>{overdueCount}</span>
            </div>
            <button className="primary-action compact" type="button" onClick={() => setIsCreating(true)}>
              <Plus size={19} />
              Nuevo
            </button>
          </section>

          {notice ? <p className="notice">{notice}</p> : null}

          <MascotBanner globalStreak={globalStreak} freezes={streakFreezes} overdueCount={overdueCount} />

          <div className="habit-list">
            {todayHabits.map((habit) => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                streak={calculateHabitStreak(habit, completions)}
                onToggleComplete={handleToggleComplete} 
              />
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "habits" ? (
        <div className="stack">
          {isCreating ? (
            <HabitForm onSave={handleCreateHabit} />
          ) : (
            <button className="primary-action" type="button" onClick={() => setIsCreating(true)}>
              <Plus size={20} />
              Crear habito
            </button>
          )}

          <div className="habit-list">
            {habitViews.map((habit) => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                streak={calculateHabitStreak(habit, completions)}
                onToggleComplete={handleToggleComplete} 
              />
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === "progress" ? (
        <div className="stack">
          <Stats habits={habits} completions={completions} />
          <section className="status-panel">
            <div className="status-icon">
              <RotateCcw size={22} />
            </div>
            <div>
              <h2>Ritmo actual</h2>
              <p>{overdueCount > 0 ? "Hay deuda pendiente. Cierrala hoy." : "No hay deuda vencida."}</p>
            </div>
          </section>
        </div>
      ) : null}

      {activeTab === "settings" ? (
        <div className="stack">
          <NotificationPanel onEnable={handleEnableNotifications} message={notice} />
          <section className="settings-list">
            <div>
              <span>Cuenta</span>
              <strong>{isLocal ? "Demo local" : session?.user.email}</strong>
            </div>
            <div>
              <span>Tono</span>
              <strong>Estricto por defecto</strong>
            </div>
            <div>
              <span>Instalacion</span>
              <strong>iPhone PWA</strong>
            </div>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
