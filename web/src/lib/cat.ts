export type CatMood = "happy" | "neutral" | "sad";

export type CatAccessory = "sunglasses" | "crown" | "ribbon" | null;

export function deriveMood(currentStreak: number, missedRecentScheduled: number): CatMood {
  if (missedRecentScheduled >= 2) return "sad";
  if (currentStreak >= 7) return "happy";
  if (currentStreak >= 3) return "neutral";
  if (missedRecentScheduled >= 1) return "sad";
  return "neutral";
}

const XP_PER_LEVEL = 100;

export function xpToLevel(totalXp: number): { level: number; xpInLevel: number } {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  return { level, xpInLevel };
}

export function accessoryForStreak(streak: number): CatAccessory {
  if (streak >= 21) return "ribbon";
  if (streak >= 14) return "crown";
  if (streak >= 7) return "sunglasses";
  return null;
}

export function catColorFromIndex(i: number): string {
  const palette = ["#e8825a", "#4caf7d", "#9b7fd4", "#c9a96e", "#6b9fd4", "#c97a5a"];
  return palette[i % palette.length];
}
