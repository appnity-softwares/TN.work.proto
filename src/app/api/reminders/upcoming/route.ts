// /src/app/api/reminders/upcoming/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/get-auth";

/**
 * GET → upcoming reminders (default next 7 days)
 * Optional query: ?days=30
 */

export async function GET(req: Request) {
  try {
    const session = await getAuth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const daysParam = parseInt(url.searchParams.get("days") || "7", 10);
    const days = Math.max(1, Math.min(365, isNaN(daysParam) ? 7 : daysParam));

    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + days);
    end.setHours(23, 59, 59, 999);

    const upcoming = await db.reminder.findMany({
      where: {
        userId: user.id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
      take: 50,
    });

    return NextResponse.json({ upcoming }, { status: 200 });
  } catch (error) {
    console.error("Upcoming reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
