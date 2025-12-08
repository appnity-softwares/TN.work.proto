import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AddWorkLogSchema } from '@/lib/schema';

export async function GET() {
  const workLogs = await db.workLog.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json({ workLogs });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { date, checkIn, checkOut, userId } = AddWorkLogSchema.parse(body);

  const attendance = await db.attendance.create({
    data: {
      userId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
    },
  });

  return NextResponse.json({ attendance });
}
