
// /src/app/api/reminders/notify/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/sendEmail";
import { meetingEmail } from "@/lib/email/templates/meeting";
import { Role } from "@prisma/client";
import { formatISTDateTime, formatISTTime } from "@/lib/time";

export async function GET() {
  try {
    const now = new Date();
    const reminderTimeStart = new Date(now.getTime() + 60 * 60 * 1000); // 60 minutes from now
    const reminderTimeEnd = new Date(now.getTime() + 65 * 60 * 1000); // 65 minutes from now

    const upcomingReminders = await db.reminder.findMany({
      where: {
        date: {
          gte: reminderTimeStart,
          lt: reminderTimeEnd,
        },
      },
      include: {
        user: true,
        client: true,
      },
    });

    if (upcomingReminders.length === 0) {
      return NextResponse.json({ message: "No upcoming meetings in the next hour to notify for." });
    }

    // Find all admins to notify them as well
    const admins = await db.user.findMany({
        where: { role: Role.ADMIN, email: { not: null } },
        select: { email: true }
    });
    const adminEmails = admins.map(a => a.email!);

    for (const reminder of upcomingReminders) {
      if (reminder.user && reminder.user.email && reminder.client) {
        const html = meetingEmail({
          name: reminder.user.name,
          clientName: reminder.client.name,
          title: reminder.title,
          date: formatISTDateTime(reminder.date),
          time: formatISTTime(reminder.date),
          description: reminder.description,
        });

        // Create a unique list of recipients (user + all admins)
        const recipients = new Set<string>([reminder.user.email, ...adminEmails]);

        await sendEmail({
          to: Array.from(recipients),
          subject: `Meeting Reminder: ${reminder.title}`,
          html,
        });
      }
    }

    return NextResponse.json({
      message: "Emails sent successfully for meetings in the next hour."
    }, {
      status: 200
    });
  } catch (error) {
    console.error("Error sending reminder emails:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, {
      status: 500
    });
  }
}
