
// /src/app/api/reminders/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/get-auth";
import { sendMeetingScheduledEmail } from "@/lib/email/hooks";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay } from "date-fns";
import { formatISTDate, formatISTTime, formatISTDateTime } from "@/lib/time";

const INDIA_TIME_ZONE = "Asia/Kolkata";


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

    // Construct a complete ISO-like string with timezone context
    // Default to 09:00 if time is not provided
    const timeString = time || "09:00";
    const dateTimeString = `${date}T${timeString}:00`;

    // Create a timezone-aware date
    const scheduledDate = fromZonedTime(dateTimeString, INDIA_TIME_ZONE);


    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json({ error: "Invalid date/time format" }, { status: 400 });
    }

    const now = new Date();
    if (scheduledDate.getTime() < now.getTime()) {
      return NextResponse.json(
        { error: "Cannot schedule meetings in the past" },
        { status: 400 }
      );
    }

    let client = await db.client.findFirst({
      where: { name: clientName },
    });

    if (!client) {
      client = await db.client.create({
        data: { name: clientName },
      });
    }

    const reminder = await db.reminder.create({
      data: {
        userId: user.id,
        clientName,
        title,
        description: description || null,
        date: scheduledDate,
        time: timeString,
      },
    });

    if (notify && user.email) {
      try {
        await sendMeetingScheduledEmail({
          user: {
            id: user.id,
            name: user.name || "User",
            email: user.email,
          },
          clientName,
          title,
          date: formatISTDate(scheduledDate),
          time: formatISTTime(scheduledDate),
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
      
      const zonedDate = fromZonedTime(dateParam, INDIA_TIME_ZONE);

      const start = startOfDay(zonedDate);
      const end = endOfDay(zonedDate);

      where.date = {
        gte: start,
        lt: end,
      };
    }

    const reminders = await db.reminder.findMany({
      where,
      orderBy: { date: "asc" },
    });

    const formatted = reminders.map((r) => ({
      ...r,
      dateFormatted: formatISTDateTime(r.date),
    }));

    return NextResponse.json({ reminders: formatted }, { status: 200 });
  } catch (error) {
    console.error("Fetch reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
