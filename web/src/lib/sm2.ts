/**
 * SM-2–style spaced repetition with Anki-like Again / Hard / Good / Easy.
 * Pure: no I/O. Days-based scheduling for v1 (no intraday learning steps).
 */

import { addDays } from "./dates";

export const SM2_EASE_MIN = 1.3;

export type ReviewRating = "again" | "hard" | "good" | "easy";

export type Sm2CardState = {
  easeFactor: number;
  intervalDays: number;
  repetitionCount: number;
  /** ISO YYYY-MM-DD — next scheduled review */
  dueDate: string;
  lastReviewedAt: string | null;
};

export type Sm2ReviewResult = Sm2CardState;

function clampEase(ef: number): number {
  return Math.max(SM2_EASE_MIN, Math.round(ef * 100) / 100);
}

/**
 * @param reviewDate — calendar day the user pressed the rating (YYYY-MM-DD)
 */
export function applyReview(
  state: Sm2CardState,
  rating: ReviewRating,
  reviewDate: string
): Sm2ReviewResult {
  let { easeFactor: ef, intervalDays: iv, repetitionCount: rep } = state;

  const isNewOrLapsed = rep === 0;

  if (isNewOrLapsed) {
    if (rating === "again") {
      ef = clampEase(ef - 0.2);
      iv = 1;
      rep = 0;
    } else if (rating === "hard") {
      ef = clampEase(ef - 0.15);
      iv = 1;
      rep = 0;
    } else if (rating === "good") {
      iv = 1;
      rep = 1;
    } else {
      // easy
      ef = clampEase(ef + 0.15);
      iv = 4;
      rep = 1;
    }
  } else {
    // graduated review
    if (rating === "again") {
      ef = clampEase(ef - 0.2);
      iv = 1;
      rep = 0;
    } else if (rating === "hard") {
      ef = clampEase(ef - 0.15);
      iv = Math.max(1, Math.round(iv * 1.2));
    } else if (rating === "good") {
      iv = Math.max(1, Math.round(iv * ef));
      rep = rep + 1;
    } else {
      ef = clampEase(ef + 0.15);
      iv = Math.max(1, Math.round(iv * ef * 1.3));
      rep = rep + 1;
    }
  }

  const nextDue = addDays(reviewDate, iv);

  return {
    easeFactor: ef,
    intervalDays: iv,
    repetitionCount: rep,
    dueDate: nextDue,
    lastReviewedAt: reviewDate,
  };
}
