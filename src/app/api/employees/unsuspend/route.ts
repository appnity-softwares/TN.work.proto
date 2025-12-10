// /src/app/api/admin/employees/unsuspend/route.ts
import { NextResponse } from "next/server";
import { unsuspendUser } from "@/app/(app)/admin/employees/actions";

export async function POST(req: Request) {
  const { userId } = await req.json();
  const result = await unsuspendUser(userId);
  return NextResponse.json(result);
}
