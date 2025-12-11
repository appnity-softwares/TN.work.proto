// /src/app/api/reminders/[id]/ics/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/get-auth";

function escapeICSText(s: string) {
  return s.replace(/(\r\n|\n|\r)/g, "\\n").replace(/,/g, "\\,");
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const reminder = await db.reminder.findUnique({ where: { id } });

    if (!reminder) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Ensure admin can only access their own reminders
    if (reminder.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse date + time
    const date = new Date(reminder.date);
    let startUTC = date;

    if (reminder.time) {
      const match = reminder.time.match(/^(\d{1,2}):(\d{2})/);
      if (match) {
        const d = new Date(date);
        d.setHours(parseInt(match[1]), parseInt(match[2]), 0, 0);
        startUTC = d;
      }
    }

    const end = new Date(startUTC.getTime() + 60 * 60 * 1000);

    const dtstamp = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
    const dtstart = startUTC
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
    const dtend = end
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TaskNity//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:tasknity-reminder-${reminder.id}@tasknity`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${escapeICSText(reminder.title)}`,
      `DESCRIPTION:${escapeICSText(
        `${reminder.description || ""}\nClient: ${reminder.clientName}`
      )}`,
      `LOCATION:${escapeICSText(reminder.clientName)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename=meeting-${reminder.id}.ics`,
      },
    });
  } catch (err) {
    console.error("ICS Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
