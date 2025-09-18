import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if onboarding is completed
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("onboarding_completed")
    .eq("user_id", data.user.id)
    .single()

  if (!profile?.onboarding_completed) {
    redirect("/onboarding")
  }

  // If onboarding is complete, redirect to dashboard
  redirect("/dashboard")
}
