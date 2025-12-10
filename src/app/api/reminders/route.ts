// /src/app/api/reminders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/get-auth";
import { sendMeetingScheduledEmail } from "@/lib/email/hooks";

/**
 * POST -> create a reminder (auto-create client if missing)
 * GET  -> list reminders for optional date (query ?date=YYYY-MM-DD)
 */

export async function POST(req: Request) {
  try {
    const session = await getAuth();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { clientName, title, description, date, time, notify = true } = body;

    if (!clientName || !title || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure date is parseable
    const scheduledDate = new Date(date);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // Do not allow scheduling in the past (allow same-day future time)
    const now = new Date();
    if (scheduledDate < new Date(now.toDateString())) {
      return NextResponse.json({ error: "Cannot schedule meetings in the past" }, { status: 400 });
    }

    // Auto-create client if not exists (create minimal record)
    let client = await db.client.findFirst({ where: { name: clientName } });
    if (!client) {
      client = await db.client.create({
        data: {
          name: clientName,
        },
      });
    }

    // Create reminder
    const reminder = await db.reminder.create({
      data: {
        userId: session.id,
        clientName,
        title,
        description: description || null,
        date: scheduledDate,
        time: time || null,
      },
    });

    // Send meeting email to the creator (admin) if notify true & email exists
    if (notify && session.email) {
      try {
        // Format date/time for email
        const formattedDate = scheduledDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        const formattedTime = time || scheduledDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

        await sendMeetingScheduledEmail({
          user: { id: session.id, name: session.name, email: session.email },
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuth();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const dateParam = url.searchParams.get("date"); // optional

    const where: any = { userId: session.id };

    if (dateParam) {
      // match that date (midnight..next day)
      const start = new Date(dateParam);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      where.date = { gte: start, lt: end };
    }

    const reminders = await db.reminder.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ reminders }, { status: 200 });
  } catch (error) {
    console.error("Fetch reminders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
