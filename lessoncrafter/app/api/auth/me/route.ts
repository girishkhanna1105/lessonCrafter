import { NextResponse,NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req:NextRequest){
    const supabase= await createClient()
    const userid=req.headers.get("x-user-id");
    const user=await supabase.
    from("user")
    .select("name, email")
    .eq("user_id",userid)
    .single()
    return NextResponse.json({
        user
    })
}