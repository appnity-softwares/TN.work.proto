import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log("🔍 Decoded Token:");
    return decoded;
  } catch (err) {
    console.error("❌ JWT VERIFY ERROR:", err);
    return null;
  }
}
