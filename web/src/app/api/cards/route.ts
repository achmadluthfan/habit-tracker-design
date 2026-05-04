import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  const deckId = String(body.deckId ?? "");
  if (!deckId) return NextResponse.json({ error: "deckId required" }, { status: 400 });

  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("user_id", user.id)
    .single();

  if (!deck) return NextResponse.json({ error: "Deck not found" }, { status: 404 });

  const today = new Date().toISOString().slice(0, 10);
  const row = {
    deck_id: deckId,
    word: String(body.word ?? "").trim(),
    meaning: String(body.meaning ?? "").trim(),
    example_sentence: String(body.example_sentence ?? ""),
    pronunciation: String(body.pronunciation ?? ""),
    image_url: body.image_url ? String(body.image_url) : null,
    audio_url: body.audio_url ? String(body.audio_url) : null,
    part_of_speech: String(body.part_of_speech ?? "noun"),
    ease_factor: 2.5,
    interval_days: 0,
    repetition_count: 0,
    due_date: today,
    last_reviewed_at: null as string | null,
  };

  if (!row.word || !row.meaning) {
    return NextResponse.json({ error: "word and meaning required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("cards").insert(row).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ card: data });
}
