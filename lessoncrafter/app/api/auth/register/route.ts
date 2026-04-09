import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs"
export async function POST(req:NextRequest){
    const supabase=await createClient();
    const {name, email, phone_no, password, role} = await req.json()
    if(!name || !email || !phone_no || !password){
        return NextResponse.json({
            message:"incomplete details pleaase fill all details then register",
            status:400
        })
    }

    const { data: existingUser } = await supabase
        .from("users")
        .select("user_id")
        .eq("email", email)
        .single();

    if (existingUser) {
        return NextResponse.json(
            { message: "Email already exists" },
            { status: 409 }
        );
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const {data, error} = await supabase.from("users").insert({
        name,
        email,
        password: hashpassword,
        phone_no,
        role: role || 'student'
    })
    if(error){
        console.error(error)
        return NextResponse.json({
            message:"register failed durring db registration(supabase error)",
            status:500
        })
    }
    return NextResponse.json({
        message:"registration succesfull",
        status:200,
        data:data
    })

}