import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { applyReview, type ReviewRating } from "@/lib/sm2";

function isRating(x: string): x is ReviewRating {
  return x === "again" || x === "hard" || x === "good" || x === "easy";
}

/** Submit batch review: body { reviews: { cardId, rating }[], completeSession?: boolean } */
export async function POST(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const reviews = Array.isArray(body.reviews) ? body.reviews : [];
  const completeSession = Boolean(body.completeSession);
  const today = new Date().toISOString().slice(0, 10);

  for (const r of reviews) {
    const cardId = String(r.cardId ?? "");
    const rating = String(r.rating ?? "");
    if (!cardId || !isRating(rating)) continue;

    const { data: card } = await supabase.from("cards").select("*").eq("id", cardId).single();
    if (!card) continue;

    const { data: deck } = await supabase
      .from("decks")
      .select("id")
      .eq("id", card.deck_id)
      .eq("user_id", user.id)
      .single();

    if (!deck) continue;

    const next = applyReview(
      {
        easeFactor: Number(card.ease_factor),
        intervalDays: Number(card.interval_days),
        repetitionCount: Number(card.repetition_count),
        dueDate: card.due_date,
        lastReviewedAt: card.last_reviewed_at,
      },
      rating,
      today
    );

    await supabase
      .from("cards")
      .update({
        ease_factor: next.easeFactor,
        interval_days: next.intervalDays,
        repetition_count: next.repetitionCount,
        due_date: next.dueDate,
        last_reviewed_at: next.lastReviewedAt,
      })
      .eq("id", cardId);
  }

  if (completeSession) {
    const { data: linked } = await supabase
      .from("habits")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_flashcard_linked", true)
      .is("archived_at", null)
      .limit(1)
      .maybeSingle();

    if (linked) {
      const { data: existed } = await supabase
        .from("completions")
        .select("id")
        .eq("habit_id", linked.id)
        .eq("completed_on", today)
        .maybeSingle();

      if (!existed) {
        await supabase.from("completions").insert({
          habit_id: linked.id,
          completed_on: today,
          note: "Flashcard session",
        });

        const { data: cat } = await supabase
          .from("cats")
          .select("total_xp")
          .eq("habit_id", linked.id)
          .maybeSingle();
        const nextXp = (cat?.total_xp ?? 0) + 10;
        await supabase.from("cats").upsert({ habit_id: linked.id, total_xp: nextXp });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
