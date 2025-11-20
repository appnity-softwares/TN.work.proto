import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export function middleware(req: Request) {
  const protectedRoutes = [
    "/api/admin",
    "/api/attendance",
    "/api/work",
    "/api/notices",
    "/api/errors",
    "/api/employees"
  ];

  const { pathname } = new URL(req.url);

  // Skip auth for login
  if (pathname.startsWith("/api/auth/login")) return NextResponse.next();

  // Check if route needs protection
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) return NextResponse.next();

  const authHeader = req.headers.get("Authorization");
 

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: No token provided" },
      { status: 401 }
    );
  }

  // FIX: Remove quotes if present
  const rawToken = authHeader.split(" ")[1];
  const token = rawToken.replace(/"/g, "").trim();


  const decoded = verifyToken(token);

  if (!decoded) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  (req as any).user = decoded;
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"]
};
