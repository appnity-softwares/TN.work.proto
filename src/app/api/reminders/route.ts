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

    // --- FIX #1: Parse date in Indian timezone ---
    // date format: "YYYY-MM-DD"
    const [y, m, d] = date.split("-").map(Number);

    // If time exists, use it; otherwise, set 09:00 AM by default
    let hours = 9, minutes = 0;

    if (time && /^\d{1,2}:\d{2}/.test(time)) {
      const parts = time.split(":");
      hours = Number(parts[0]);
      minutes = Number(parts[1]);
    }

    // Create IST datetime (not UTC)
    const scheduledDateIST = new Date(Date.UTC(y, m - 1, d, hours - 5, minutes - 30));
    // Why hours-5:30? → Converts IST to UTC before saving → so DB stores correct IST moment

    if (isNaN(scheduledDateIST.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }

    // --- FIX #2: Prevent past dates based on IST ---
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + 5.5 * 60 * 60 * 1000);

    if (scheduledDateIST.getTime() < nowIST.getTime()) {
      return NextResponse.json(
        { error: "Cannot schedule meetings in the past" },
        { status: 400 }
      );
    }

    // --- Auto-create client if needed ---
    let client = await db.client.findFirst({
      where: { name: clientName }
    });

    if (!client) {
      client = await db.client.create({
        data: { name: clientName }
      });
    }

    // --- Save reminder (stored in DB as exact IST moment) ---
    const reminder = await db.reminder.create({
      data: {
        userId: user.id,
        clientName,
        title,
        description: description || null,
        date: scheduledDateIST,
        time: time || null
      }
    });

    // --- Optional email notification ---
    if (notify && user.email) {
      try {
        const formattedDate = scheduledDateIST.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric"
        });

        const formattedTime =
          time ||
          scheduledDateIST.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
          });

        await sendMeetingScheduledEmail({
          user: {
            id: user.id,
            name: user.name || "User",
            email: user.email
          },
          clientName,
          title,
          date: formattedDate,
          time: formattedTime,
          description: description || ""
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

// --------------------------------------------------------------
// 📌 GET → Fetch reminders (with accurate Indian timezone filtering)
// --------------------------------------------------------------
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

    // --------------------------------------------------------------
    // 🕒 If ?date=YYYY-MM-DD is provided → filter by full IST day
    // --------------------------------------------------------------
    if (dateParam) {
      const [y, m, d] = dateParam.split("-").map(Number);

      // Start of day in IST → convert to UTC for DB
      const startIST = new Date(Date.UTC(y, m - 1, d, -5, -30));
      const endIST = new Date(Date.UTC(y, m - 1, d + 1, -5, -30));

      where.date = {
        gte: startIST,
        lt: endIST
      };
    }

    // --------------------------------------------------------------
    // 🗂 Fetch reminders
    // --------------------------------------------------------------
    const reminders = await db.reminder.findMany({
      where,
      orderBy: { date: "asc" }
    });

    // --------------------------------------------------------------
    // 🕒 Convert stored UTC → IST before returning
    // --------------------------------------------------------------
    const IST_OFFSET = 5.5 * 60 * 60 * 1000;

    const formatted = reminders.map((r) => {
      const ist = new Date(new Date(r.date).getTime() + IST_OFFSET);

      return {
        ...r,
        dateIST: ist.toISOString().replace("Z", ""), // useful for UI
        dateFormatted: ist.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: true
        })
      };
    });

    return NextResponse.json({ reminders: formatted }, { status: 200 });

  } catch (error) {
    console.error("Fetch reminders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


