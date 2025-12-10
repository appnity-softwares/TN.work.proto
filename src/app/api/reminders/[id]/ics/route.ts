// /src/app/api/reminders/[id]/ics/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/get-auth";

/**
 * Returns an .ics text for the reminder id
 */

function escapeICSText(s: string) {
  return s.replace(/(\r\n|\n|\r)/g, "\\n").replace(/,/g, "\\,");
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuth();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const rem = await db.reminder.findUnique({ where: { id } });
    if (!rem) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (rem.userId !== session.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const start = new Date(rem.date);
    // If time present and parseable, try to merge time (time string like "15:30" or "3:30 PM")
    let startUTC = start;
    if (rem.time) {
      // attempt to parse HH:MM (24h)
      const m = rem.time.match(/^(\d{1,2}):(\d{2})/);
      if (m) {
        const d = new Date(start);
        d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
        startUTC = d;
      }
    }

    const end = new Date(startUTC.getTime() + 60 * 60 * 1000); // default 1 hour event

    const uid = `tasknity-reminder-${rem.id}@tasknity`;
    const dtstamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtstart = startUTC.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const dtend = end.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const summary = escapeICSText(rem.title);
    const description = escapeICSText(`${rem.description || ""}\nClient: ${rem.clientName}`);
    const location = escapeICSText(rem.clientName);

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//TaskNity//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${dtstart}`,
      `DTEND:${dtend}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    return new NextResponse(ics, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename=meeting-${rem.id}.ics`,
      },
    });
  } catch (err) {
    console.error("ICS error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
