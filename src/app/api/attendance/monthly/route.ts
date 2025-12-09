
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';

const schema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month');

  const validated = schema.safeParse({ month });

  if (!validated.success) {
    return NextResponse.json({ error: 'Invalid month format. Use YYYY-MM' }, { status: 400 });
  }

  const targetDate = parseISO(`${validated.data.month}-01`);
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);

  try {
    const attendanceRecords = await db.attendance.findMany({
      where: {
        checkIn: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        checkIn: true,
      },
    });

    // We just need to know which days have at least one person present.
    const presentDays = new Set<string>();
    attendanceRecords.forEach(record => {
        const day = record.checkIn.toISOString().split('T')[0]; // YYYY-MM-DD
        presentDays.add(day);
    });

    return NextResponse.json({ presentDays: Array.from(presentDays) });

  } catch (error) {
    console.error('Failed to fetch monthly attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch monthly attendance' }, { status: 500 });
  }
}
