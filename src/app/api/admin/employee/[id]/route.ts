// src/app/api/admin/employee/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/admin/employee/[id] - Get full employee profile for admin/superadmin
export async function GET(req: Request, ctx: { params: { id: string } } | Promise<{ params: { id: string } }>) {
  const { params } = await Promise.resolve(ctx);
  const { id } = params;

  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const employee = await db.user.findUnique({
      where: { id },
      include: {
        attendance: true,
        workLogs: true,
        noticesIssued: true,
        reminders: true,
        // Add more relations as needed
      },
    });
    if (!employee) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ employee });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/admin/employee/[id] - Update employee details (admin/superadmin)
export async function PATCH(req: Request, ctx: { params: { id: string } } | Promise<{ params: { id: string } }>) {
  const session = await getSession();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { params } = await Promise.resolve(ctx);
  const { id } = params;
  const data = await req.json();
  try {
    const updated = await db.user.update({
      where: { id },
      data,
    });
    return NextResponse.json({ success: true, employee: updated });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
