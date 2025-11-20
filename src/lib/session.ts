// src/lib/session.ts
"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import type { SessionUser } from "./types";
import { getUser } from "./data";
import type { User } from "@prisma/client";

const SESSION_COOKIE_NAME = "tn_proto_session";
const secretKey = process.env.JWT_SECRET!;

export async function createSession(user: Omit<User, 'hashedPasscode' | 'joinDate' | 'status'>) {
  console.log("🔐 createSession() - creating session for user:", user.id);

  const payload = { ...user };
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Casts to satisfy TypeScript typings for jsonwebtoken
  const token = jwt.sign(payload as any, secretKey as any, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  } as any);

  // Await cookies() and then set (cast to any to avoid Readonly types complaining)
  const cookieStore = await cookies();
  (cookieStore as any).set(SESSION_COOKIE_NAME, token, {
    expires,
    httpOnly: true,
    path: "/",
  });

  console.log("🔐 Session cookie set");
}

export async function getSession(): Promise<{ user: SessionUser } | null> {
  console.log("🔍 getSession() called");

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  console.log("🍪 Raw session cookie:");

  if (!sessionCookie) {
    console.log("⚠ No session cookie found");
    return null;
  }

  try {
    const payload = jwt.verify(sessionCookie, secretKey as any) as SessionUser;
    console.log("🔓 Decoded session payload:");

    const user = await getUser(payload.id);
    console.log("🧑 User fetched from DB:");

    if (!user) {
      console.log("❌ DB user not found (session invalid)");
      return null;
    }

    return { user: payload };

  } catch (error) {
    console.error("❌ Session verification failed:", error);
    return null;
  }
}

export async function deleteSession() {
  console.log("🗑 deleteSession() called");
  const cookieStore = await cookies();
  (cookieStore as any).set(SESSION_COOKIE_NAME, "", { expires: new Date(0), path: "/" });
  console.log("🗑 Session cookie cleared");
}
