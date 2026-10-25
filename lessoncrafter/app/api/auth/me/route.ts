import { NextResponse,NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req:NextRequest){
    const supabase= await createClient()
    const userid=req.headers.get("x-user-id");
    const { data: user, error } = await supabase
      .from("users")
      .select("user_id, name, email, role")
      .eq("user_id", userid)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
}