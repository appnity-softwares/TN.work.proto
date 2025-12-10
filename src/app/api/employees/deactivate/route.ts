// /src/app/api/admin/employees/deactivate/route.ts
import { NextResponse } from "next/server";
import { deactivateUser } from "@/app/(app)/admin/employees/actions";

export async function POST(req: Request) {
  const { userId } = await req.json();
  const result = await deactivateUser(userId);
  return NextResponse.json(result);
}
