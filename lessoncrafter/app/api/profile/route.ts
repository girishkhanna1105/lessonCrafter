import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { userId, role, profileData } = await req.json();

  if (!userId || !role || !profileData) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const tableName = role === 'teacher' ? 'teacher_profiles' : 'student_profiles';

  // 🔄 Sync the role in the users table first
  const { error: roleError } = await supabase
    .from("users")
    .update({ role })
    .eq("user_id", userId);

  if (roleError) {
    console.error("Role sync error:", roleError);
  }

  const { data, error } = await supabase
    .from(tableName)
    .upsert({
      user_id: userId,
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Failed to update profile", error }, { status: 500 });
  }

  return NextResponse.json({
    message: "Profile updated successfully",
    profile: data
  });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const role = searchParams.get("role");

  if (!userId || !role) {
    return NextResponse.json({ message: "UserId and Role are required" }, { status: 400 });
  }

  const tableName = role === 'teacher' ? 'teacher_profiles' : 'student_profiles';

  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
    return NextResponse.json({ message: "Error fetching profile", error }, { status: 500 });
  }

  return NextResponse.json({
    hasProfile: !!data,
    profile: data || null
  });
}
