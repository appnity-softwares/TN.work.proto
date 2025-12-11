// /src/app/api/reminders/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/get-auth";
import { sendMeetingScheduledEmail } from "@/lib/email/hooks";

/**
 * GET → Fetch single reminder
 * PATCH → Update reminder
 * DELETE → Delete reminder
 */

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const reminder = await db.reminder.findUnique({ where: { id } });

    if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (reminder.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ reminder }, { status: 200 });
  } catch (err) {
    console.error("GET reminder error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();

    const reminder = await db.reminder.findUnique({ where: { id } });
    if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (reminder.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Build update payload
    const updates: any = {};

    if (typeof body.clientName === "string") updates.clientName = body.clientName;
    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.description === "string") updates.description = body.description;
    if (typeof body.time === "string") updates.time = body.time;

    if (typeof body.date === "string") {
      const d = new Date(body.date);
      if (isNaN(d.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      updates.date = d;
    }

    const updated = await db.reminder.update({
      where: { id },
      data: updates
    });

    // Optional email notification
    if (body.notify && user.email) {
      const formattedDate = updated.date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      const formattedTime =
        updated.time ||
        updated.date.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit"
        });

      await sendMeetingScheduledEmail({
        user: {
          id: user.id,
          name: user.name || "User",
          email: user.email
        },
        clientName: updated.clientName,
        title: updated.title,
        date: formattedDate,
        time: formattedTime,
        description: updated.description || ""
      }).catch(err => console.error("Meeting email send failed:", err));
    }

    return NextResponse.json({ reminder: updated }, { status: 200 });
  } catch (err) {
    console.error("PATCH reminder error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuth();
    const user = session?.user;

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const reminder = await db.reminder.findUnique({ where: { id } });

    if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (reminder.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.reminder.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE reminder error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
