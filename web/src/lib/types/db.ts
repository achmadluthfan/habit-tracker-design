import { type HabitSchedule } from "@/lib/streak";

export type HabitRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  schedule: HabitSchedule;
  archived_at: string | null;
  is_flashcard_linked: boolean;
  created_at: string;
};

export type CompletionRow = {
  id: string;
  habit_id: string;
  completed_on: string;
  note: string;
  created_at: string;
};

export type CatRow = {
  habit_id: string;
  total_xp: number;
  unlocked_accessories: unknown;
};

export type DeckRow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
};

export type CardRow = {
  id: string;
  deck_id: string;
  word: string;
  meaning: string;
  example_sentence: string;
  pronunciation: string;
  image_url: string | null;
  audio_url: string | null;
  part_of_speech: string;
  ease_factor: number;
  interval_days: number;
  repetition_count: number;
  due_date: string;
  last_reviewed_at: string | null;
  created_at: string;
};

export function parseSchedule(raw: unknown): HabitSchedule {
  if (raw && typeof raw === "object" && "type" in raw) {
    const o = raw as { type: string; weekdays?: number[]; dates?: number[] };
    if (o.type === "daily") return { type: "daily" };
    if (o.type === "weekly" && Array.isArray(o.weekdays))
      return { type: "weekly", weekdays: o.weekdays };
    if (o.type === "monthly" && Array.isArray(o.dates))
      return { type: "monthly", dates: o.dates };
  }
  return { type: "daily" };
}
