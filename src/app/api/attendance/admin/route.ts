import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getSession();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const records = await prisma.attendance.findMany({
      include: {
        user: true,
      },
      orderBy: {
        checkIn: "desc",
      },
    });

    const formatted = records.map((r) => ({
      id: r.id,
      employeeName: r.user?.name || "Unknown",
      userId: r.userId,
      clockIn: r.checkIn ? r.checkIn.toISOString() : null,
      clockOut: r.checkOut ? r.checkOut.toISOString() : null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Admin attendance error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
