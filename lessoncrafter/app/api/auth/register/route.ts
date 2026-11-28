import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
    }

    const { name, email, phone_no, password, role } = body || {};
    if (!name || !email || !phone_no || !password) {
        return NextResponse.json(
            { message: "Incomplete details: please fill all details then register", status: 400 },
            { status: 400 }
        );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
        return NextResponse.json(
            { message: "Please provide a valid email address", status: 400 },
            { status: 400 }
        );
    }

    if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json(
            { message: "Password must be at least 6 characters long", status: 400 },
            { status: 400 }
        );
    }

    // Prevent privilege escalation via self-registration
    const safeRole = role === "teacher" ? "teacher" : "student";

    const { data: existingUser } = await supabase
        .from("users")
        .select("user_id")
        .eq("email", normalizedEmail)
        .single();

    if (existingUser) {
        return NextResponse.json(
            { message: "Email already exists" },
            { status: 409 }
        );
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from("users").insert({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashpassword,
        phone_no: String(phone_no).trim(),
        role: safeRole,
    });
    if (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Registration failed during database registration", status: 500 },
            { status: 500 }
        );
    }
    return NextResponse.json(
        { message: "Registration successful", status: 200, data },
        { status: 200 }
    );
}