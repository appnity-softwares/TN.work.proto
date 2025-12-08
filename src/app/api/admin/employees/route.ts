import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const employees = await db.user.findMany({
      where: { role: 'EMPLOYEE' },
      select: { id: true, name: true, employeeCode: true },
    });
    return NextResponse.json({ employees });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}
