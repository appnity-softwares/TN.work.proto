// src/app/api/admin/email/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db as prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/sendEmail'; // adjust if named/export differs
import { getSession } from '@/lib/session';

// Expected body:
// {
//   recipientType: 'single'|'multiple'|'role'|'all',
//   recipients?: string[] (userIds),
//   role?: 'EMPLOYEE'|'ADMIN',
//   subject: string,
//   message: string
// }

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientType, recipients = [], role, subject, message } = body;

    if (!subject || !message || !recipientType) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    let users: { id: string; email?: string; name?: string }[] = [];

    if (recipientType === 'single' || recipientType === 'multiple') {
      if (!Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json({ message: 'No recipients specified' }, { status: 400 });
      }
      users = await prisma.user.findMany({
        where: { id: { in: recipients } },
        select: { id: true, email: true, name: true },
      });
    } else if (recipientType === 'role') {
      if (!role) {
        return NextResponse.json({ message: 'Role not specified' }, { status: 400 });
      }
      users = await prisma.user.findMany({
        where: { role },
        select: { id: true, email: true, name: true },
      });
    } else if (recipientType === 'all') {
      users = await prisma.user.findMany({
        select: { id: true, email: true, name: true },
      });
    } else {
      return NextResponse.json({ message: 'Invalid recipientType' }, { status: 400 });
    }

    // filter users with valid emails
    const recipientsWithEmail = users.filter((u) => u.email && u.email.trim().length > 0);

    const results: Array<{ id: string; email?: string; success: boolean; error?: string }> = [];

    for (const u of recipientsWithEmail) {
      try {
        // Attempt to send. Adjust sendEmail signature as per your project.
        // Commonly sendEmail({ to, subject, html, text })
        await sendEmail({
          to: u.email as string,
          subject,
          html: `<p>Hi ${u.name || ''},</p><div>${message.replace(/\n/g, '<br/>')}</div><hr/><p>Sent by ${session.user.name}</p>`,
          text: `${message}\n\nSent by ${session.user.name}`,
        });

        results.push({ id: u.id, email: u.email, success: true });
      } catch (err: any) {
        console.error(`Failed to send email to ${u.email}`, err);
        results.push({ id: u.id, email: u.email, success: false, error: String(err?.message || err) });
      }
    }

    // Also collect users without emails to let admin know
    const withoutEmail = users.filter((u) => !u.email || u.email.trim().length === 0);

    return NextResponse.json({
      message: `Processed ${users.length} users (${recipientsWithEmail.length} with email)`,
      details: results,
      withoutEmail: withoutEmail.map((u) => ({ id: u.id, name: u.name })),
    });
  } catch (err: any) {
    console.error('Admin email route error', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
