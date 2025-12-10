// /src/app/api/reminders/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuth } from "@/lib/auth/get-auth";
import { sendMeetingScheduledEmail } from "@/lib/email/hooks";

/**
 * GET    -> fetch single reminder
 * PATCH  -> update reminder (body: { clientName?, title?, description?, date?, time?, notify? })
 * DELETE -> delete reminder
 */

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuth();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const reminder = await db.reminder.findUnique({ where: { id } });

    if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (reminder.userId !== session.id) {
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
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();

    const reminder = await db.reminder.findUnique({ where: { id } });
    if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (reminder.userId !== session.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updates: any = {};
    if (typeof body.clientName === "string") updates.clientName = body.clientName;
    if (typeof body.title === "string") updates.title = body.title;
    if (typeof body.description === "string") updates.description = body.description;
    if (typeof body.time === "string") updates.time = body.time;
    if (typeof body.date === "string") {
      const parsed = new Date(body.date);
      if (isNaN(parsed.getTime())) {
        return NextResponse.json({ error: "Invalid date" }, { status: 400 });
      }
      updates.date = parsed;
    }

    const updated = await db.reminder.update({
      where: { id },
      data: updates,
    });

    // optionally re-send meeting email if notify === true
    if (body.notify && session.email) {
      const formattedDate = updated.date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      const formattedTime = updated.time || updated.date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

      await sendMeetingScheduledEmail({
        user: { id: session.id, name: session.name, email: session.email },
        clientName: updated.clientName,
        title: updated.title,
        date: formattedDate,
        time: formattedTime,
        description: updated.description || "",
      }).catch((e) => console.error("Resend meeting email failed:", e));
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
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const reminder = await db.reminder.findUnique({ where: { id } });
    if (!reminder) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (reminder.userId !== session.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.reminder.delete({ where: { id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE reminder error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
