import type { HabitSchedule } from "@/lib/streak";

export type DemoHabit = {
  id: string;
  name: string;
  description: string;
  category: string;
  schedule: HabitSchedule;
  archived_at: string | null;
  is_flashcard_linked: boolean;
};

export type DemoCompletion = { habit_id: string; completed_on: string; note: string };
export type DemoCat = { habit_id: string; total_xp: number };

export type DemoCard = {
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
};

export type DemoDeck = {
  id: string;
  name: string;
  description: string;
};

export type DemoStore = {
  habits: DemoHabit[];
  completions: DemoCompletion[];
  cats: DemoCat[];
  decks: DemoDeck[];
  cards: DemoCard[];
};

const STORAGE_KEY = "habitly-demo-v1";

export function seedDemo(today: string): DemoStore {
  const h1 = crypto.randomUUID();
  const h2 = crypto.randomUUID();
  return {
    habits: [
      {
        id: h1,
        name: "Learn English",
        description: "Vocabulary + flashcards",
        category: "learning",
        schedule: { type: "daily" },
        archived_at: null,
        is_flashcard_linked: true,
      },
      {
        id: h2,
        name: "Morning Run",
        description: "",
        category: "fitness",
        schedule: { type: "daily" },
        archived_at: null,
        is_flashcard_linked: false,
      },
    ],
    completions: [{ habit_id: h1, completed_on: today, note: "" }],
    cats: [
      { habit_id: h1, total_xp: 120 },
      { habit_id: h2, total_xp: 40 },
    ],
    decks: [
      {
        id: "d1",
        name: "IELTS Vocab",
        description: "Academic word list",
      },
    ],
    cards: [
      {
        id: "c1",
        deck_id: "d1",
        word: "Meticulous",
        meaning: "Showing great attention to detail.",
        example_sentence: "She was meticulous in her research.",
        pronunciation: "/mɪˈtɪk.jʊ.ləs/",
        image_url: null,
        audio_url: null,
        part_of_speech: "adj",
        ease_factor: 2.5,
        interval_days: 1,
        repetition_count: 1,
        due_date: today,
        last_reviewed_at: null,
      },
    ],
  };
}

export function loadDemoStore(today: string): DemoStore {
  if (typeof window === "undefined") return seedDemo(today);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seedDemo(today);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as DemoStore;
  } catch {
    return seedDemo(today);
  }
}

export function saveDemoStore(store: DemoStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}
