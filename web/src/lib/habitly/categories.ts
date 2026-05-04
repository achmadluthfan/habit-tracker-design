export const CATEGORIES = [
  { id: "health", label: "Health", color: "#4caf7d" },
  { id: "learning", label: "Learning", color: "#6b9fd4" },
  { id: "mindful", label: "Mindful", color: "#9b7fd4" },
  { id: "fitness", label: "Fitness", color: "#e8825a" },
  { id: "creative", label: "Creative", color: "#c9a96e" },
] as const;

export function categoryColor(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.color ?? "#9e8e80";
}
