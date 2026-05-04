/** YYYY-MM-DD calendar math in local timezone (habit day keys). */

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(ymd: string, days: number): string {
  const d = parseYmd(ymd);
  d.setDate(d.getDate() + days);
  return formatYmd(d);
}

export function daysBetween(a: string, b: string): number {
  const da = parseYmd(a).getTime();
  const db = parseYmd(b).getTime();
  return Math.round((db - da) / 86400000);
}

export function todayYmd(): string {
  return formatYmd(new Date());
}
