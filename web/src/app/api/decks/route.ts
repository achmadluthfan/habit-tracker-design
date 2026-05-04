import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: decks, error } = await supabase
    .from("decks")
    .select("id, name, description, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const deckList = (decks ?? []) as { id: string; name: string; description: string; created_at: string }[];
  const deckIds = deckList.map((d) => d.id);
  const cardStats: Record<string, { count: number; dueToday: number }> = {};
  if (deckIds.length) {
    const today = new Date().toISOString().slice(0, 10);
    const { data: cards } = await supabase
      .from("cards")
      .select("deck_id, due_date")
      .in("deck_id", deckIds);
    for (const c of (cards ?? []) as { deck_id: string; due_date: string }[]) {
      if (!cardStats[c.deck_id]) cardStats[c.deck_id] = { count: 0, dueToday: 0 };
      cardStats[c.deck_id].count += 1;
      if (c.due_date <= today) cardStats[c.deck_id].dueToday += 1;
    }
  }

  const enriched = deckList.map((d) => ({
    ...d,
    cardCount: cardStats[d.id]?.count ?? 0,
    dueToday: cardStats[d.id]?.dueToday ?? 0,
  }));

  const totalDue = enriched.reduce((s, d) => s + d.dueToday, 0);

  return NextResponse.json({ decks: enriched, totalDue });
}

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
  const name = String(body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const description = String(body.description ?? "");

  const { data, error } = await supabase
    .from("decks")
    .insert({ user_id: user.id, name, description })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deck: data });
}
