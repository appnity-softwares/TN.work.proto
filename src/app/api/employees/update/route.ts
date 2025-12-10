// /src/app/api/admin/employees/update/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, name, email, avatar, employeeCode, role } = await req.json();

    await db.user.update({
      where: { id },
      data: {
        name,
        email,
        avatar,
        employeeCode,
        role,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Employee updated successfully.",
    });
  } catch (err: any) {
    console.error("Update employee error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Error updating employee." },
      { status: 500 }
    );
  }
}
