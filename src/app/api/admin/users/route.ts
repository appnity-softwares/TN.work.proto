// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { db as prisma } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Failed to fetch users', err);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
