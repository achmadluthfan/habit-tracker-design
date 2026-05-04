import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Log or update completion for a habit on a calendar day */
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
  const habitId = String(body.habitId ?? "");
  const completed_on = String(body.date ?? "").slice(0, 10);
  const note = String(body.note ?? "");

  if (!habitId || !completed_on) {
    return NextResponse.json({ error: "habitId and date required" }, { status: 400 });
  }

  const { data: habit } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", user.id)
    .single();

  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  const { data: existing } = await supabase
    .from("completions")
    .select("id")
    .eq("habit_id", habitId)
    .eq("completed_on", completed_on)
    .maybeSingle();

  const { data, error } = await supabase
    .from("completions")
    .upsert(
      { habit_id: habitId, completed_on, note },
      { onConflict: "habit_id,completed_on" }
    )
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!existing) {
    const { data: cat } = await supabase
      .from("cats")
      .select("total_xp")
      .eq("habit_id", habitId)
      .maybeSingle();
    const nextXp = (cat?.total_xp ?? 0) + 10;
    await supabase.from("cats").upsert({ habit_id: habitId, total_xp: nextXp });
  }

  return NextResponse.json({ completion: data });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const habitId = String(body.habitId ?? "");
  const completed_on = String(body.date ?? "").slice(0, 10);
  const note = String(body.note ?? "");

  const { data, error } = await supabase
    .from("completions")
    .update({ note })
    .eq("habit_id", habitId)
    .eq("completed_on", completed_on)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ completion: data });
}

export async function DELETE(req: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const habitId = searchParams.get("habitId");
  const date = searchParams.get("date");
  if (!habitId || !date) {
    return NextResponse.json({ error: "habitId and date query required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("completions")
    .delete()
    .eq("habit_id", habitId)
    .eq("completed_on", date);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
