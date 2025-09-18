// app/api/auth/profile/route.ts (use anon key w/ RLS)
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PATCH(req: Request) {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const updates = await req.json()
  const { data: profile, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  return NextResponse.json({ profile })
}
