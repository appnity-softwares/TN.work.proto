import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/* ✅ Generate Token */
export function generateToken(payload: object, expiresIn: string = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/* ✅ Verify Token */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (err) {
    console.error("❌ JWT VERIFY ERROR:", err);
    return null;
  }
}
