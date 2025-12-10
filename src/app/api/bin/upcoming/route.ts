import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/get-auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAuth();
    const user = session?.user;

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const upcomingItems = await db.bin.findMany({
      where: {
        userId: user.id,
        date: {
          gte: tomorrow,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json({ upcomingItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching upcoming bin items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
