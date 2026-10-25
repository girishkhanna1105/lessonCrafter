import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export function middleware(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized access: Missing authorization token" },
      { status: 401 }
    );
  }

  try {
    const decoded = verifyToken(token);
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decoded.userId);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch {
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: ["/api/auth/me"],
};
