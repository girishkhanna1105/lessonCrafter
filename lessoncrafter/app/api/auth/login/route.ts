import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { signToken } from "@/lib/jwt";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password required" },
      { status: 400 }
    );
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("user_id, name, password, role")
    .eq("email", email)
    .single();

  if (error || !user) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return NextResponse.json(
      { message: "Invalid email or password" },
      { status: 401 }
    );
  }

  const token = signToken({ userId: user.user_id });

  return NextResponse.json({
    token,
    user: {
      id: user.user_id,
      email,
      name: user.name,
      role: user.role
    },
  });
}
