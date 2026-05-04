import { describe, expect, it } from "vitest";
import { applyReview, SM2_EASE_MIN, type Sm2CardState } from "./sm2";

const base = (over: Partial<Sm2CardState> = {}): Sm2CardState => ({
  easeFactor: 2.5,
  intervalDays: 0,
  repetitionCount: 0,
  dueDate: "2026-05-04",
  lastReviewedAt: null,
  ...over,
});

describe("applyReview — first review (new card, rep=0)", () => {
  const day = "2026-05-04";

  it("Again lowers ease, interval 1, rep stays 0", () => {
    const s = applyReview(base(), "again", day);
    expect(s.easeFactor).toBe(2.3);
    expect(s.intervalDays).toBe(1);
    expect(s.repetitionCount).toBe(0);
    expect(s.dueDate).toBe("2026-05-05");
    expect(s.lastReviewedAt).toBe(day);
  });

  it("Hard lowers ease slightly, interval 1", () => {
    const s = applyReview(base(), "hard", day);
    expect(s.easeFactor).toBe(2.35);
    expect(s.intervalDays).toBe(1);
    expect(s.repetitionCount).toBe(0);
  });

  it("Good sets interval 1 and graduates rep to 1", () => {
    const s = applyReview(base(), "good", day);
    expect(s.easeFactor).toBe(2.5);
    expect(s.intervalDays).toBe(1);
    expect(s.repetitionCount).toBe(1);
    expect(s.dueDate).toBe("2026-05-05");
  });

  it("Easy bumps ease and interval 4", () => {
    const s = applyReview(base(), "easy", day);
    expect(s.easeFactor).toBe(2.65);
    expect(s.intervalDays).toBe(4);
    expect(s.repetitionCount).toBe(1);
    expect(s.dueDate).toBe("2026-05-08");
  });
});

describe("ease floor", () => {
  it("Again cannot drop ease below SM2 minimum", () => {
    const s = applyReview(
      base({ easeFactor: 1.35, repetitionCount: 3, intervalDays: 5 }),
      "again",
      "2026-05-04"
    );
    expect(s.easeFactor).toBe(SM2_EASE_MIN);
  });
});

describe("graduated reviews — consecutive Good", () => {
  it("increases interval using ease factor", () => {
    let s = applyReview(base(), "good", "2026-05-01");
    expect(s.repetitionCount).toBe(1);
    expect(s.intervalDays).toBe(1);
    s = applyReview(s, "good", "2026-05-05");
    expect(s.repetitionCount).toBe(2);
    expect(s.intervalDays).toBe(3); // round(1 * 2.5)
    s = applyReview(s, "good", "2026-05-08");
    expect(s.intervalDays).toBe(8); // round(3 * 2.5)
  });
});

describe("Again resets repetition", () => {
  it("after Good, Again lapses to rep 0", () => {
    let s = applyReview(base(), "good", "2026-05-01");
    s = applyReview(s, "again", "2026-05-05");
    expect(s.repetitionCount).toBe(0);
    expect(s.intervalDays).toBe(1);
    expect(s.easeFactor).toBe(2.3);
  });
});

describe("edge sequence Good → Again → Good", () => {
  it("recovers with Good from lapsed state", () => {
    let s = applyReview(base(), "good", "2026-05-01");
    s = applyReview(s, "again", "2026-05-05");
    expect(s.repetitionCount).toBe(0);
    s = applyReview(s, "good", "2026-05-06");
    expect(s.repetitionCount).toBe(1);
    expect(s.intervalDays).toBe(1);
  });
});

describe("Hard on graduated card", () => {
  it("stretches interval and lowers ease", () => {
    let s = applyReview(base(), "good", "2026-05-01");
    s = { ...s, intervalDays: 10, easeFactor: 2.5, repetitionCount: 2 };
    s = applyReview(s, "hard", "2026-05-10");
    expect(s.intervalDays).toBe(12);
    expect(s.easeFactor).toBe(2.35);
  });
});

describe("Easy on graduated card", () => {
  it("increases ease and interval more than Good", () => {
    let s = applyReview(base(), "good", "2026-05-01");
    s = { ...s, intervalDays: 10, repetitionCount: 2 };
    const good = applyReview({ ...s }, "good", "2026-05-10");
    const easy = applyReview({ ...s }, "easy", "2026-05-10");
    expect(easy.intervalDays).toBeGreaterThan(good.intervalDays);
    expect(easy.easeFactor).toBeGreaterThan(s.easeFactor);
  });
});
