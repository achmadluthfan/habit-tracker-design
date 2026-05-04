import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: card } = await supabase
    .from("cards")
    .select("id, deck_id")
    .eq("id", id)
    .single();

  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("id", card.deck_id)
    .eq("user_id", user.id)
    .single();

  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const allowed = [
    "word",
    "meaning",
    "example_sentence",
    "pronunciation",
    "image_url",
    "audio_url",
    "part_of_speech",
    "ease_factor",
    "interval_days",
    "repetition_count",
    "due_date",
    "last_reviewed_at",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const k of allowed) {
    if (body[k] !== undefined) patch[k] = body[k];
  }

  const { data, error } = await supabase.from("cards").update(patch).eq("id", id).select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ card: data });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: card } = await supabase.from("cards").select("id, deck_id").eq("id", id).single();
  if (!card) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: deck } = await supabase
    .from("decks")
    .select("id")
    .eq("id", card.deck_id)
    .eq("user_id", user.id)
    .single();

  if (!deck) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { error } = await supabase.from("cards").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
