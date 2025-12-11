// /src/app/api/reminders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/get-auth";
import { sendMeetingScheduledEmail } from "@/lib/email/hooks";

/**
 * POST → create a reminder (auto-create client if missing)
 * GET  → list reminders (optional ?date=YYYY-MM-DD)
 */

export async function POST(req: Request) {
  try {
    const session = await getAuth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientName, title, description, date, time, notify = true } = body;

    if (!clientName || !title || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate date
    const scheduledDate = new Date(date);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Prevent past-dated meetings (same-day allowed)
    const now = new Date();
    if (scheduledDate < new Date(now.toDateString())) {
      return NextResponse.json(
        { error: "Cannot schedule meetings in the past" },
        { status: 400 }
      );
    }

    // Auto-create client if needed
    let client = await db.client.findFirst({
      where: { name: clientName },
    });

    if (!client) {
      client = await db.client.create({
        data: { name: clientName },
      });
    }

    // Create reminder
    const reminder = await db.reminder.create({
      data: {
        userId: user.id,
        clientName,
        title,
        description: description || null,
        date: scheduledDate,
        time: time || null,
      },
    });

    // Optional meeting email notification
    if (notify && user.email) {
      try {
        const formattedDate = scheduledDate.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        const formattedTime =
          time ||
          scheduledDate.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          });

        await sendMeetingScheduledEmail({
          user: {
            id: user.id,
            name: user.name || "User",
            email: user.email,
          },
          clientName,
          title,
          date: formattedDate,
          time: formattedTime,
          description: description || "",
        });
      } catch (e) {
        console.error("Failed to send meeting email:", e);
      }
    }

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error("Create reminder error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date");

    const where: any = { userId: user.id };

    if (dateParam) {
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);

      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      where.date = {
        gte: start,
        lt: end,
      };
    }

    const reminders = await db.reminder.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    console.error("Fetch reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
