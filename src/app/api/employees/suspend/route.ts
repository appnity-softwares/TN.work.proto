// /src/app/api/admin/employees/suspend/route.ts
import { NextResponse } from "next/server";
import { suspendUser } from "@/app/(app)/admin/employees/actions";

export async function POST(req: Request) {
  const { userId, reason } = await req.json();
  const result = await suspendUser(userId, reason);
  return NextResponse.json(result);
}
