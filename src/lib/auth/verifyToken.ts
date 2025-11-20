import { verifyToken } from "@/lib/auth/jwt";

export function getUserFromRequest(req: Request) {
  const authHeader = req.headers.get("authorization");
  console.log("🔌 AUTH HEADER RAW:");

  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  let token = authHeader.split(" ")[1];

  // 🔥 Remove stray quotes
  token = token.replace(/"/g, "").trim();

  console.log("🔑 TOKEN CLEANED:");

  return verifyToken(token);
}
