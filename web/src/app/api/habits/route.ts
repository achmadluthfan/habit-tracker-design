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

  const { data: habits, error } = await supabase
    .from("habits")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const habitRows = (habits ?? []) as { id: string }[];
  const habitIds = habitRows.map((h) => h.id);
  let completions: { habit_id: string; completed_on: string; note: string }[] = [];
  if (habitIds.length) {
    const { data: comp, error: cErr } = await supabase
      .from("completions")
      .select("habit_id, completed_on, note")
      .in("habit_id", habitIds);
    if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
    completions = (comp ?? []) as { habit_id: string; completed_on: string; note: string }[];
  }

  let cats: { habit_id: string; total_xp: number }[] = [];
  if (habitIds.length) {
    const { data: catRows } = await supabase
      .from("cats")
      .select("habit_id, total_xp")
      .in("habit_id", habitIds);
    cats = (catRows ?? []) as { habit_id: string; total_xp: number }[];
  }

  return NextResponse.json({ habits: habits ?? [], completions, cats });
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
  const category = String(body.category ?? "health");
  const schedule = body.schedule ?? { type: "daily" };
  const is_flashcard_linked = Boolean(body.is_flashcard_linked);

  const { data, error } = await supabase
    .from("habits")
    .insert({
      user_id: user.id,
      name,
      description,
      category,
      schedule,
      is_flashcard_linked,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const habit = data as { id: string };

  await supabase.from("cats").upsert({ habit_id: habit.id, total_xp: 0 });

  return NextResponse.json({ habit: data });
}
