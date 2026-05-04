"use client";

import { applyReview, type ReviewRating } from "@/lib/sm2";
import {
  accessoryForStreak,
  catColorFromIndex,
  deriveMood,
  xpToLevel,
} from "@/lib/cat";
import {
  completionRate,
  currentStreak,
  longestStreak,
  missedScheduledDays,
  type HabitSchedule,
} from "@/lib/streak";
import { addDays, formatYmd } from "@/lib/dates";
import {
  loadDemoStore,
  saveDemoStore,
  type DemoCard,
  type DemoDeck,
  type DemoHabit,
  type DemoStore,
} from "@/lib/demo";
import { CATEGORIES, categoryColor } from "@/lib/habitly/categories";
import { CatFace } from "@/components/CatFace";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const CAT_NAMES = ["Ember", "Moss", "Dusk", "Sand", "Mist", "Rust"];

type Screen = "dashboard" | "habits" | "cats" | "flashcards";

function todayYmd(): string {
  return formatYmd(new Date());
}

function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const sb = createClient();
    sb.auth.getUser().then((res: { data: { user: User | null } }) => setUser(res.data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_e: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return user;
}

export function HabitlyShell() {
  const user = useAuthUser();
  const [store, setStore] = useState<DemoStore | null>(null);
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [filter, setFilter] = useState<string>("all");
  const [reviewDeck, setReviewDeck] = useState<DemoDeck | null>(null);
  const [reviewQueue, setReviewQueue] = useState<DemoCard[]>([]);
  const [cloudHabits, setCloudHabits] = useState<unknown[] | null>(null);

  const today = useMemo(() => todayYmd(), []);

  useEffect(() => {
    setStore(loadDemoStore(today));
  }, [today]);

  const persist = useCallback((s: DemoStore) => {
    saveDemoStore(s);
    setStore(s);
  }, []);

  useEffect(() => {
    if (!user) {
      setCloudHabits(null);
      return;
    }
    fetch("/api/habits")
      .then((r) => r.json())
      .then((j) => setCloudHabits(j.habits ?? []))
      .catch(() => setCloudHabits([]));
  }, [user]);

  async function signOut() {
    if (!isSupabaseConfigured()) return;
    const sb = createClient();
    await sb.auth.signOut();
  }

  if (!store) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream text-ink-muted">
        Loading…
      </div>
    );
  }

  const isCloud = Boolean(user);

  return (
    <div className="flex min-h-screen flex-col bg-cream font-sans text-ink">
      <div className="flex flex-1 flex-col overflow-hidden pb-[72px]">
        {screen === "dashboard" && (
          <Dashboard
            store={store}
            persist={persist}
            filter={filter}
            setFilter={setFilter}
            today={today}
            onFlashcards={() => setScreen("flashcards")}
            isCloud={isCloud}
            cloudHint={isCloud && cloudHabits ? `${cloudHabits.length} habits synced` : null}
          />
        )}
        {screen === "habits" && <HabitsList store={store} persist={persist} today={today} />}
        {screen === "cats" && <CatsGrid store={store} today={today} />}
        {screen === "flashcards" && (
          <Flashcards
            store={store}
            persist={persist}
            today={today}
            onReview={(deck, cards) => {
              setReviewDeck(deck);
              setReviewQueue(cards);
            }}
          />
        )}
        {reviewDeck && reviewQueue.length > 0 && (
          <ReviewOverlay
            cards={reviewQueue}
            today={today}
            store={store}
            persist={persist}
            onClose={() => {
              setReviewDeck(null);
              setReviewQueue([]);
            }}
          />
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 flex h-[66px] items-center justify-around border-t border-border bg-card">
        {(
          [
            ["dashboard", "Today"],
            ["habits", "Habits"],
            ["cats", "Cats"],
            ["flashcards", "Flashcards"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setScreen(id)}
            className={`flex flex-col items-center gap-0.5 px-5 py-2 text-[11px] font-semibold ${
              screen === id ? "text-accent" : "text-ink-muted"
            }`}
          >
            <span className="text-lg">{id === "dashboard" ? "▦" : id === "habits" ? "≡" : id === "cats" ? "⌓" : "▭"}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="fixed right-3 top-3 z-50 flex items-center gap-2">
        {user ? (
          <>
            <span className="hidden text-xs text-ink-muted sm:inline">{user.email}</span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-ink-mid"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white shadow-sm"
          >
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
}

function Dashboard({
  store,
  persist,
  filter,
  setFilter,
  today,
  onFlashcards,
  isCloud,
  cloudHint,
}: {
  store: DemoStore;
  persist: (s: DemoStore) => void;
  filter: string;
  setFilter: (f: string) => void;
  today: string;
  onFlashcards: () => void;
  isCloud: boolean;
  cloudHint: string | null;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [backfill, setBackfill] = useState<string | null>(null);

  const habits = store.habits.filter((h) => !h.archived_at);
  const filtered = filter === "all" ? habits : habits.filter((h) => h.category === filter);

  const done = habits.filter((h) =>
    store.completions.some((c) => c.habit_id === h.id && c.completed_on === today)
  ).length;
  const total = habits.length;

  const totalDue = store.cards.filter((c) => c.due_date <= today).length;

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  function toggle(habitId: string) {
    const has = store.completions.some((c) => c.habit_id === habitId && c.completed_on === today);
    let completions = store.completions;
    let cats = store.cats;
    if (has) {
      completions = completions.filter((c) => !(c.habit_id === habitId && c.completed_on === today));
      cats = cats.map((c) =>
        c.habit_id === habitId ? { ...c, total_xp: Math.max(0, c.total_xp - 10) } : c
      );
    } else {
      completions = [...completions, { habit_id: habitId, completed_on: today, note: "" }];
      cats = cats.map((c) =>
        c.habit_id === habitId ? { ...c, total_xp: c.total_xp + 10 } : c
      );
    }
    persist({ ...store, completions, cats });
  }

  function setNote(habitId: string, note: string) {
    persist({
      ...store,
      completions: store.completions.map((c) =>
        c.habit_id === habitId && c.completed_on === today ? { ...c, note } : c
      ),
    });
  }

  function addHabit(payload: {
    name: string;
    description: string;
    category: string;
    schedule: HabitSchedule;
    is_flashcard_linked: boolean;
  }) {
    const id = crypto.randomUUID();
    const habit: DemoHabit = {
      id,
      name: payload.name,
      description: payload.description,
      category: payload.category,
      schedule: payload.schedule,
      archived_at: null,
      is_flashcard_linked: payload.is_flashcard_linked,
    };
    persist({
      ...store,
      habits: [...store.habits, habit],
      cats: [...store.cats, { habit_id: id, total_xp: 0 }],
    });
    setShowAdd(false);
  }

  const noteHabit = habits.find((h) => h.id === noteId);

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">
            H
          </div>
          <div>
            <div className="text-sm font-extrabold">Habitly</div>
            <div className="text-xs text-ink-muted">{dateLabel}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white"
        >
          + New habit
        </button>
      </header>

      <main className="space-y-5 p-5">
        {isCloud && cloudHint && (
          <p className="rounded-xl border border-blue/30 bg-blue-light px-3 py-2 text-xs text-blue">{cloudHint}</p>
        )}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-5">
            <svg width="80" height="80" viewBox="0 0 80 80" className="shrink-0">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#f0ebe3" strokeWidth="7" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke="#e8825a"
                strokeWidth="7"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - (total ? done / total : 0))}`}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
              <text x="40" y="44" textAnchor="middle" className="fill-ink text-[13px] font-mono font-bold">
                {done}/{total || 1}
              </text>
            </svg>
            <div className="min-w-[180px] flex-1">
              <h2 className="text-lg font-extrabold">
                {done === total && total > 0 ? "All done!" : `${Math.max(0, total - done)} left today`}
              </h2>
              <p className="mt-1 text-sm text-ink-muted">
                {total ? Math.round((done / total) * 100) : 0}% of today&apos;s habits
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
                  {totalDue} cards due
                </span>
                <button
                  type="button"
                  onClick={onFlashcards}
                  className="rounded-full bg-blue-light px-3 py-1 text-xs font-semibold text-blue"
                >
                  Start review →
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={filter === c.id}
              onClick={() => setFilter(c.id)}
              label={c.label}
              color={c.color}
            />
          ))}
        </div>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {filtered.map((h, i) => (
            <HabitRow
              key={h.id}
              habit={h}
              store={store}
              today={today}
              showBorder={i < filtered.length - 1}
              onToggle={() => toggle(h.id)}
              onNote={() => setNoteId(h.id)}
              onBackfill={() => setBackfill(h.id)}
            />
          ))}
        </section>
      </main>

      {showAdd && <AddHabitModal onClose={() => setShowAdd(false)} onAdd={addHabit} />}
      {noteHabit && (
        <NoteModal
          name={noteHabit.name}
          initial={store.completions.find((c) => c.habit_id === noteHabit.id && c.completed_on === today)?.note ?? ""}
          onClose={() => setNoteId(null)}
          onSave={(t) => {
            setNote(noteHabit.id, t);
            setNoteId(null);
          }}
        />
      )}
      {backfill && (
        <BackfillModal
          onClose={() => setBackfill(null)}
          onPick={(d) => {
            const completions = [...store.completions, { habit_id: backfill, completed_on: d, note: "" }];
            persist({ ...store, completions });
            setBackfill(null);
          }}
        />
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  const col = color ?? "#e8825a";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-[13px] font-semibold transition ${
        active ? "border-transparent" : "border-border text-ink-mid"
      }`}
      style={
        active
          ? { borderColor: col, background: `${col}22`, color: col }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function HabitRow({
  habit,
  store,
  today,
  showBorder,
  onToggle,
  onNote,
  onBackfill,
}: {
  habit: DemoHabit;
  store: DemoStore;
  today: string;
  showBorder: boolean;
  onToggle: () => void;
  onNote: () => void;
  onBackfill: () => void;
}) {
  const sched = habit.schedule;
  const dates = new Set(
    store.completions.filter((c) => c.habit_id === habit.id).map((c) => c.completed_on)
  );
  const streak = currentStreak(dates, sched, today);
  const rate = completionRate(dates, sched, today, 30);
  const done = dates.has(today);
  const col = categoryColor(habit.category);

  return (
    <div className={showBorder ? "border-b border-border" : ""}>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60">
        <button
          type="button"
          onClick={onToggle}
          className={`flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full border-2 transition ${
            done ? "border-transparent text-white" : "border-border-strong bg-transparent"
          }`}
          style={done ? { background: col } : undefined}
        >
          {done && (
            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
              <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`font-semibold ${done ? "text-ink-muted line-through" : ""}`}>{habit.name}</span>
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: `${col}22`, color: col }}
            >
              {CATEGORIES.find((c) => c.id === habit.category)?.label ?? habit.category}
            </span>
            {habit.is_flashcard_linked && (
              <span className="rounded-full bg-blue-light px-2 py-0.5 text-[11px] font-semibold text-blue">
                Flashcard
              </span>
            )}
          </div>
          <div className="mt-1 flex gap-3 font-mono text-xs text-ink-muted">
            <span>{streak > 0 ? `${streak}d streak` : "—"}</span>
            <span>{rate}%</span>
          </div>
        </div>
        <button type="button" onClick={onBackfill} className="text-[11px] font-semibold text-ink-muted underline">
          Past
        </button>
        <button type="button" onClick={onNote} className="p-2 text-ink-muted hover:text-ink-mid" title="Note">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 3h12v9H8l-4 3V3z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function AddHabitModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: {
    name: string;
    description: string;
    category: string;
    schedule: HabitSchedule;
    is_flashcard_linked: boolean;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("health");
  const [scheduleType, setScheduleType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [linkFlash, setLinkFlash] = useState(false);

  function schedule(): HabitSchedule {
    if (scheduleType === "daily") return { type: "daily" };
    if (scheduleType === "weekly") return { type: "weekly", weekdays: [1, 2, 3, 4, 5] };
    return { type: "monthly", dates: [1, 15] };
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold">New habit</h3>
        <label className="mt-4 block text-xs font-semibold text-ink-mid">Name</label>
        <input
          className="mt-1 w-full rounded-xl border border-border bg-cream px-3 py-2 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="mt-3 block text-xs font-semibold text-ink-mid">Description</label>
        <input
          className="mt-1 w-full rounded-xl border border-border bg-cream px-3 py-2 text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-ink-mid">Category</label>
            <select
              className="mt-1 w-full rounded-xl border border-border bg-cream px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-mid">Schedule</label>
            <select
              className="mt-1 w-full rounded-xl border border-border bg-cream px-3 py-2 text-sm"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as typeof scheduleType)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekdays</option>
              <option value="monthly">Monthly (1st & 15th)</option>
            </select>
          </div>
        </div>
        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
          <input type="checkbox" checked={linkFlash} onChange={(e) => setLinkFlash(e.target.checked)} />
          Link to flashcards (Learn English)
        </label>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() =>
              onAdd({
                name: name.trim(),
                description,
                category,
                schedule: schedule(),
                is_flashcard_linked: linkFlash,
              })
            }
            className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function NoteModal({
  name,
  initial,
  onClose,
  onSave,
}: {
  name: string;
  initial: string;
  onClose: () => void;
  onSave: (t: string) => void;
}) {
  const [t, setT] = useState(initial);
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold">Note · {name}</h3>
        <textarea
          className="mt-3 w-full rounded-xl border border-border bg-cream p-3 text-sm"
          rows={4}
          value={t}
          onChange={(e) => setT(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button type="button" onClick={() => onSave(t)} className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function BackfillModal({ onClose, onPick }: { onClose: () => void; onPick: (d: string) => void }) {
  const days: string[] = [];
  for (let i = 1; i <= 14; i++) {
    days.push(addDays(todayYmd(), -i));
  }
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold">Log past day</h3>
        <ul className="mt-3 space-y-1">
          {days.map((d) => (
            <li key={d}>
              <button type="button" className="w-full rounded-lg py-2 text-left text-sm hover:bg-muted" onClick={() => onPick(d)}>
                {d}
              </button>
            </li>
          ))}
        </ul>
        <button type="button" onClick={onClose} className="mt-4 w-full rounded-xl border border-border py-2 text-sm font-semibold">
          Cancel
        </button>
      </div>
    </div>
  );
}

function HabitsList({ store, persist, today }: { store: DemoStore; persist: (s: DemoStore) => void; today: string }) {
  const [sel, setSel] = useState<string | null>(null);
  const habits = store.habits.filter((h) => !h.archived_at);
  const selected = sel ? habits.find((x) => x.id === sel) : undefined;

  useEffect(() => {
    if (sel && !selected) setSel(null);
  }, [sel, selected]);

  if (selected) {
    const h = selected;
    const sched = h.schedule;
    const dates = new Set(store.completions.filter((c) => c.habit_id === h.id).map((c) => c.completed_on));
    const from = addDays(today, -180);
    const streak = currentStreak(dates, sched, today);
    const longest = longestStreak(dates, sched, from, today);
    const rate = completionRate(dates, sched, today, 30);
    const total = dates.size;

    return (
      <div className="flex-1 overflow-y-auto">
        <header className="flex h-14 items-center border-b border-border bg-card px-4">
          <button type="button" className="text-sm font-semibold text-ink-mid" onClick={() => setSel(null)}>
            ← Back
          </button>
          <span className="ml-3 font-bold">{h.name}</span>
        </header>
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            <StatPill label="Current streak" value={`${streak}d`} color="#e8825a" />
            <StatPill label="Longest" value={`${longest}d`} color="#c9a96e" />
            <StatPill label="30d rate" value={`${rate}%`} color="#4caf7d" />
            <StatPill label="Total" value={String(total)} color="#6b9fd4" />
          </div>
          <section className="rounded-2xl border border-border bg-card p-4">
            <h4 className="text-sm font-bold">Heatmap (demo)</h4>
            <p className="mt-1 text-xs text-ink-muted">Full calendar view ships with Supabase-backed completions.</p>
          </section>
          <button
            type="button"
            className="w-full rounded-xl border border-red-200 py-2 text-sm font-semibold text-red-700"
            onClick={() => {
              if (!confirm("Delete habit permanently?")) return;
              persist({
                ...store,
                habits: store.habits.filter((x) => x.id !== h.id),
                completions: store.completions.filter((c) => c.habit_id !== h.id),
                cats: store.cats.filter((c) => c.habit_id !== h.id),
              });
              setSel(null);
            }}
          >
            Delete habit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-14 items-center border-b border-border bg-card px-5">
        <h1 className="font-extrabold">All habits</h1>
      </header>
      <div className="space-y-2 p-4">
        {habits.map((h) => {
          const col = categoryColor(h.category);
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => setSel(h.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:shadow-md"
            >
              <div className="h-9 w-9 shrink-0 rounded-lg" style={{ background: `${col}33` }} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{h.name}</span>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${col}22`, color: col }}>
                    {CATEGORIES.find((c) => c.id === h.category)?.label}
                  </span>
                </div>
                <div className="mt-1 font-mono text-xs text-ink-muted">
                  {currentStreak(
                    new Set(store.completions.filter((c) => c.habit_id === h.id).map((c) => c.completed_on)),
                    h.schedule,
                    today
                  )}
                  d streak
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="min-w-[88px] rounded-xl bg-muted px-4 py-3">
      <div className="font-mono text-xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}

function CatsGrid({ store, today }: { store: DemoStore; today: string }) {
  const habits = store.habits.filter((h) => !h.archived_at);
  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-14 items-center border-b border-border bg-card px-5">
        <h1 className="font-extrabold">Your cats</h1>
      </header>
      <div className="p-5">
        <p className="mb-4 rounded-2xl border border-border bg-gradient-to-br from-accent-light to-gold-light p-4 text-sm text-ink-mid">
          Each habit has a cat. Mood follows your streak; accessories unlock at milestones.
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
          {habits.map((h, i) => {
            const dates = new Set(store.completions.filter((c) => c.habit_id === h.id).map((c) => c.completed_on));
            const streak = currentStreak(dates, h.schedule, today);
            const missed = missedScheduledDays(dates, h.schedule, addDays(today, -7), today).length;
            const mood = deriveMood(streak, missed);
            const acc = accessoryForStreak(streak);
            const cat = store.cats.find((c) => c.habit_id === h.id);
            const { level } = xpToLevel(cat?.total_xp ?? 0);
            const color = catColorFromIndex(i);
            return (
              <div key={h.id} className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
                <CatFace color={color} mood={mood} size={72} accessory={acc} />
                <div className="mt-2 font-bold">{CAT_NAMES[i % CAT_NAMES.length]}</div>
                <div className="text-xs text-ink-muted">{h.name}</div>
                <div className="mt-2 flex flex-wrap justify-center gap-1 text-[10px] font-mono text-ink-muted">
                  <span>Lv.{level}</span>
                  <span>{streak}🔥</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Flashcards({
  store,
  persist,
  today,
  onReview,
}: {
  store: DemoStore;
  persist: (s: DemoStore) => void;
  today: string;
  onReview: (d: DemoDeck, cards: DemoCard[]) => void;
}) {
  const [deckDetail, setDeckDetail] = useState<DemoDeck | null>(null);
  const [showDeck, setShowDeck] = useState(false);
  const [deckName, setDeckName] = useState("");
  const [showCard, setShowCard] = useState(false);
  const totalDue = store.cards.filter((c) => c.due_date <= today).length;

  const cardsInDeck = (id: string) => store.cards.filter((c) => c.deck_id === id);

  if (deckDetail) {
    const cards = cardsInDeck(deckDetail.id);
    return (
      <div className="flex-1 overflow-y-auto">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
          <button type="button" className="text-sm font-semibold" onClick={() => setDeckDetail(null)}>
            ← Back
          </button>
          <span className="font-bold">{deckDetail.name}</span>
          <button type="button" className="text-xs font-bold text-accent" onClick={() => setShowCard(true)}>
            + Card
          </button>
        </header>
        <div className="space-y-2 p-4">
          {cards.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-3 text-sm">
              <div className="font-bold">{c.word}</div>
              <div className="text-ink-muted">{c.meaning.slice(0, 80)}…</div>
              <div className="mt-1 font-mono text-[10px] text-ink-muted">
                EF {c.ease_factor} · due {c.due_date}
              </div>
            </div>
          ))}
        </div>
        {showCard && (
          <AddCardQuick
            onClose={() => setShowCard(false)}
            onAdd={(row) => {
              persist({
                ...store,
                cards: [...store.cards, { ...row, id: crypto.randomUUID(), deck_id: deckDetail.id }],
              });
              setShowCard(false);
            }}
            today={today}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <h1 className="font-extrabold">Flashcards</h1>
        <button type="button" className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white" onClick={() => setShowDeck(true)}>
          + Deck
        </button>
      </header>
      <div className="space-y-4 p-4">
        {totalDue > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-gradient-to-r from-blue-light to-accent-light p-4">
            <div>
              <div className="font-bold">{totalDue} cards due today</div>
              <div className="text-xs text-ink-mid">Across your decks (demo)</div>
            </div>
            <button
              type="button"
              className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white"
              onClick={() => {
                const due = store.cards.filter((c) => c.due_date <= today);
                const deck = store.decks.find((d) => due.some((c) => c.deck_id === d.id)) ?? store.decks[0];
                if (deck) onReview(deck, due.length ? due : store.cards.slice(0, 3));
              }}
            >
              Start session
            </button>
          </div>
        )}
        {store.decks.map((d) => {
          const due = cardsInDeck(d.id).filter((c) => c.due_date <= today).length;
          return (
            <div
              key={d.id}
              role="button"
              tabIndex={0}
              onClick={() => setDeckDetail(d)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDeckDetail(d);
                }
              }}
              className="flex w-full cursor-pointer flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left shadow-sm outline-none ring-accent focus-visible:ring-2"
            >
              <div className="flex justify-between gap-2">
                <span className="font-bold">{d.name}</span>
                {due > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-mono text-white">{due} due</span>
                )}
              </div>
              <p className="text-xs text-ink-muted">{d.description}</p>
              <button
                type="button"
                className={`mt-1 rounded-lg py-2 text-sm font-bold ${due ? "bg-accent text-white" : "border border-border text-ink-mid"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  const q = cardsInDeck(d.id).filter((c) => c.due_date <= today);
                  onReview(d, q.length ? q : cardsInDeck(d.id).slice(0, 2));
                }}
              >
                {due ? `Study ${due}` : "Browse"}
              </button>
            </div>
          );
        })}
      </div>
      {showDeck && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-ink/40 p-4" onClick={() => setShowDeck(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">New deck</h3>
            <input
              className="mt-3 w-full rounded-xl border border-border px-3 py-2"
              placeholder="Name"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setShowDeck(false)} className="rounded-xl border px-4 py-2 text-sm">
                Cancel
              </button>
              <button
                type="button"
                disabled={!deckName.trim()}
                onClick={() => {
                  const id = crypto.randomUUID();
                  persist({
                    ...store,
                    decks: [...store.decks, { id, name: deckName.trim(), description: "" }],
                  });
                  setDeckName("");
                  setShowDeck(false);
                }}
                className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddCardQuick({
  onClose,
  onAdd,
  today,
}: {
  onClose: () => void;
  onAdd: (row: Omit<DemoCard, "id" | "deck_id">) => void;
  today: string;
}) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [pron, setPron] = useState("");
  const [pos, setPos] = useState("noun");
  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold">Add card</h3>
        <input className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Word" value={word} onChange={(e) => setWord(e.target.value)} />
        <textarea className="mt-2 w-full rounded-xl border p-2 text-sm" placeholder="Meaning" value={meaning} onChange={(e) => setMeaning(e.target.value)} />
        <textarea className="mt-2 w-full rounded-xl border p-2 text-sm" placeholder="Example" value={example} onChange={(e) => setExample(e.target.value)} />
        <input className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" placeholder="Pronunciation" value={pron} onChange={(e) => setPron(e.target.value)} />
        <select className="mt-2 w-full rounded-xl border px-3 py-2 text-sm" value={pos} onChange={(e) => setPos(e.target.value)}>
          {["noun", "verb", "adj", "adv", "idiom"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            disabled={!word.trim() || !meaning.trim()}
            onClick={() =>
              onAdd({
                word: word.trim(),
                meaning: meaning.trim(),
                example_sentence: example,
                pronunciation: pron,
                image_url: null,
                audio_url: null,
                part_of_speech: pos,
                ease_factor: 2.5,
                interval_days: 0,
                repetition_count: 0,
                due_date: today,
                last_reviewed_at: null,
              })
            }
            className="rounded-xl bg-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewOverlay({
  cards,
  today,
  store,
  persist,
  onClose,
}: {
  cards: DemoCard[];
  today: string;
  store: DemoStore;
  persist: (s: DemoStore) => void;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [local, setLocal] = useState(cards);
  const [done, setDone] = useState(false);

  const card = local[idx];

  function rate(r: ReviewRating) {
    const nextCard = applyReview(
      {
        easeFactor: card.ease_factor,
        intervalDays: card.interval_days,
        repetitionCount: card.repetition_count,
        dueDate: card.due_date,
        lastReviewedAt: card.last_reviewed_at,
      },
      r,
      today
    );
    const updated = local.map((c) =>
      c.id === card.id
        ? {
            ...c,
            ease_factor: nextCard.easeFactor,
            interval_days: nextCard.intervalDays,
            repetition_count: nextCard.repetitionCount,
            due_date: nextCard.dueDate,
            last_reviewed_at: nextCard.lastReviewedAt,
          }
        : c
    );
    setLocal(updated);
    if (idx + 1 >= updated.length) {
      setDone(true);
      const linked = store.habits.find((h) => h.is_flashcard_linked && !h.archived_at);
      if (linked) {
        const has = store.completions.some((c) => c.habit_id === linked.id && c.completed_on === today);
        let completions = store.completions;
        let cats = store.cats;
        if (!has) {
          completions = [...completions, { habit_id: linked.id, completed_on: today, note: "Flashcard session" }];
          cats = cats.map((c) =>
            c.habit_id === linked.id ? { ...c, total_xp: c.total_xp + 10 } : c
          );
        }
        persist({
          ...store,
          cards: store.cards.map((c) => updated.find((u) => u.id === c.id) ?? c),
          completions,
          cats,
        });
      } else {
        persist({ ...store, cards: store.cards.map((c) => updated.find((u) => u.id === c.id) ?? c) });
      }
    } else {
      setIdx((i) => i + 1);
      setFlipped(false);
    }
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-cream p-8 text-center">
        <div className="text-5xl">✦</div>
        <h2 className="mt-4 text-2xl font-extrabold">Session complete</h2>
        <p className="mt-2 text-sm text-ink-mid">Cards updated with SM-2. Linked habit marked for today.</p>
        <button type="button" className="mt-6 rounded-xl bg-accent px-6 py-3 font-bold text-white" onClick={onClose}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-cream">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
        <button type="button" className="text-sm text-ink-muted" onClick={onClose}>
          ← Exit
        </button>
        <span className="font-mono text-xs text-ink-muted">
          {idx + 1}/{local.length}
        </span>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-md"
        >
          {!flipped ? (
            <>
              <span className="rounded-full bg-blue-light px-3 py-1 text-xs font-semibold text-blue">{card.part_of_speech}</span>
              <div className="mt-3 text-3xl font-extrabold">{card.word}</div>
              {card.pronunciation && <div className="mt-2 font-mono text-sm text-ink-muted">{card.pronunciation}</div>}
              <p className="mt-4 text-xs text-ink-muted">Tap to reveal</p>
            </>
          ) : (
            <>
              <div className="text-lg font-bold">{card.word}</div>
              <p className="mt-3 text-left text-sm leading-relaxed text-ink-mid">{card.meaning}</p>
              <p className="mt-3 rounded-xl bg-muted p-3 text-left text-sm italic text-ink-muted">&quot;{card.example_sentence}&quot;</p>
            </>
          )}
        </button>
      </div>
      <div className="flex gap-2 border-t border-border bg-card p-4">
        {!flipped ? (
          <button type="button" className="flex-1 rounded-xl bg-accent py-3 font-bold text-white" onClick={() => setFlipped(true)}>
            Show answer
          </button>
        ) : (
          (["again", "hard", "good", "easy"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => rate(r)}
              className="flex-1 rounded-xl border-2 py-2 text-xs font-bold capitalize"
              style={{
                borderColor: `${r === "again" ? "#e8825a" : r === "hard" ? "#c9a96e" : r === "good" ? "#4caf7d" : "#6b9fd4"}55`,
                background: `${r === "again" ? "#e8825a" : r === "hard" ? "#c9a96e" : r === "good" ? "#4caf7d" : "#6b9fd4"}18`,
                color: r === "again" ? "#e8825a" : r === "hard" ? "#c9a96e" : r === "good" ? "#4caf7d" : "#6b9fd4",
              }}
            >
              {r}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
