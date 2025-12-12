import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db as prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/sendEmail";
import { getSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { recipientType, recipients = [], role, subject, message } = body;

    if (!subject || !message || !recipientType) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    let users: { id: string; email: string | null; name: string | null }[] = [];

    // --------------------
    // SELECT RECIPIENTS
    // --------------------
    if (recipientType === "single" || recipientType === "multiple") {
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json(
          { message: "No recipients specified" },
          { status: 400 }
        );
      }
      users = await prisma.user.findMany({
        where: { id: { in: recipients } },
        select: { id: true, email: true, name: true },
      });
    } else if (recipientType === "role") {
      if (!role) {
        return NextResponse.json(
          { message: "Role not specified" },
          { status: 400 }
        );
      }
      users = await prisma.user.findMany({
        where: { role },
        select: { id: true, email: true, name: true },
      });
    } else if (recipientType === "all") {
      users = await prisma.user.findMany({
        select: { id: true, email: true, name: true },
      });
    } else {
      return NextResponse.json(
        { message: "Invalid recipientType" },
        { status: 400 }
      );
    }

    // --------------------
    // ONLY USERS WITH EMAIL
    // --------------------
    const recipientsWithEmail = users.filter(
      (u) => typeof u.email === "string" && u.email.trim() !== ""
    );

    const results: Array<{
      id: string;
      email: string | null;
      success: boolean;
      error?: string;
    }> = [];

    // --------------------
    // SEND EMAILS
    // --------------------
    for (const u of recipientsWithEmail) {
      try {
        await sendEmail({
          to: u.email as string,
          subject,
          html: `<p>Hi ${u.name ?? ""},</p>
            <div>${message.replace(/\n/g, "<br/>")}</div>
            <hr/>
            <p>Sent by ${session.user.name}</p>`,
        });

        results.push({ id: u.id, email: u.email, success: true });
      } catch (err: any) {
        results.push({
          id: u.id,
          email: u.email,
          success: false,
          error: err?.message || "Unknown error",
        });
      }
    }

    const withoutEmail = users.filter(
      (u) => !u.email || u.email.trim().length === 0
    );

    // --------------------
    // LOG IN DATABASE
    // --------------------
    await prisma.emailLog.create({
      data: {
        senderId: session.user.id,
        recipients: recipientsWithEmail.map((u) => ({
          id: u.id,
          email: u.email,
        })),
        subject,
        message,
        status: results.every((r) => r.success)
          ? "SUCCESS"
          : results.some((r) => r.success)
          ? "PARTIAL"
          : "FAILED",
      },
    });

     return NextResponse.json({
      message: `Processed ${users.length} users (${recipientsWithEmail.length} with email)`,
      details: results,
      withoutEmail: withoutEmail.map((u) => ({
        id: u.id,
        name: u.name,
      })),
    });
  } catch (err) {
    console.error("Email send error:", err);
    return NextResponse.json(
      { message: "Server error while sending email" },
      { status: 500 }
    );
  }
}

