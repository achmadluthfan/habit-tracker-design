import { daysBetween, formatYmd, parseYmd } from "./dates";

export type HabitSchedule =
  | { type: "daily" }
  | { type: "weekly"; weekdays: number[] } // 0=Sun .. 6=Sat
  | { type: "monthly"; dates: number[] }; // 1-31

export function isScheduledDay(ymd: string, schedule: HabitSchedule): boolean {
  const d = parseYmd(ymd);
  if (schedule.type === "daily") return true;
  if (schedule.type === "weekly") return schedule.weekdays.includes(d.getDay());
  if (schedule.type === "monthly") return schedule.dates.includes(d.getDate());
  return false;
}

/** Walk calendar days backwards from anchor; count consecutive scheduled days that have a completion. */
export function currentStreak(
  completionDates: Set<string>,
  schedule: HabitSchedule,
  anchorYmd: string
): number {
  let count = 0;
  const d = parseYmd(anchorYmd);
  for (let i = 0; i < 3650; i++) {
    const key = formatYmd(d);
    if (isScheduledDay(key, schedule)) {
      if (completionDates.has(key)) count += 1;
      else break;
    }
    d.setDate(d.getDate() - 1);
  }
  return count;
}

/** Longest run of consecutive *scheduled* days (calendar consecutive) where each has a completion, within [fromYmd, toYmd]. */
export function longestStreak(
  completionDates: Set<string>,
  schedule: HabitSchedule,
  fromYmd: string,
  toYmd: string
): number {
  let best = 0;
  let run = 0;
  const n = Math.max(0, daysBetween(fromYmd, toYmd));
  const d = parseYmd(fromYmd);
  for (let i = 0; i <= n; i++) {
    const key = formatYmd(d);
    if (isScheduledDay(key, schedule)) {
      if (completionDates.has(key)) {
        run += 1;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    }
    d.setDate(d.getDate() + 1);
  }
  return best;
}

export function completionRate(
  completionDates: Set<string>,
  schedule: HabitSchedule,
  anchorYmd: string,
  windowDays: number
): number {
  const end = parseYmd(anchorYmd);
  const start = parseYmd(anchorYmd);
  start.setDate(start.getDate() - (windowDays - 1));
  let due = 0;
  let done = 0;
  for (let d = new Date(start); d <= end; ) {
    const key = formatYmd(d);
    if (isScheduledDay(key, schedule)) {
      due += 1;
      if (completionDates.has(key)) done += 1;
    }
    d.setDate(d.getDate() + 1);
  }
  if (due === 0) return 100;
  return Math.round((done / due) * 100);
}

export function totalCompletions(completionDates: Set<string>): number {
  return completionDates.size;
}

/** Scheduled days in range that lack a completion (for "missed" UI), newest first optional */
export function missedScheduledDays(
  completionDates: Set<string>,
  schedule: HabitSchedule,
  fromYmd: string,
  toYmd: string
): string[] {
  const out: string[] = [];
  const n = Math.max(0, daysBetween(fromYmd, toYmd));
  const d = parseYmd(fromYmd);
  for (let i = 0; i <= n; i++) {
    const key = formatYmd(d);
    if (isScheduledDay(key, schedule) && !completionDates.has(key)) out.push(key);
    d.setDate(d.getDate() + 1);
  }
  return out;
}
