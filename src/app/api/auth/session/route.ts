// src/app/api/auth/session/route.ts
import { cookies } from "next/headers";

export async function GET() {
  console.log("GET /api/auth/session");
  const cookieStore = await cookies();
  const cookie = cookieStore.get("tn_proto_session");
  if (!cookie) {
    console.log("⚠ No session cookie found - returning 401");
    return Response.json({ error: "No session found" }, { status: 401 });
  }
  console.log("✅ Session token found");
  return Response.json({ token: cookie.value });
}
