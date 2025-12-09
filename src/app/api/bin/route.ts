import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth/get-auth';
import { db } from '@/lib/db';
import { BinType } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getAuth();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, type, date } = await req.json(); // Add date to the destructuring
    if (!content || !type) {
      return NextResponse.json({ error: 'Missing content or type' }, { status: 400 });
    }

    if (!Object.values(BinType).includes(type as BinType)) {
        return NextResponse.json({ error: 'Invalid bin type' }, { status: 400 });
    }

    const binItem = await db.bin.create({
      data: {
        content,
        type: type as BinType,
        date: date ? new Date(date) : null, // Handle the optional date
        userId: session.id,
      },
    });

    return NextResponse.json({ binItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating bin item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getAuth();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    const whereClause: any = { userId: session.id };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      whereClause.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    const binItems = await db.bin.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ binItems }, { status: 200 });
  } catch (error) {
    console.error('Error fetching bin items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAuth();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    await db.bin.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Bin item deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting bin item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
