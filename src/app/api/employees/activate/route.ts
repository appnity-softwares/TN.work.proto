// /src/app/api/admin/employees/activate/route.ts
import { NextResponse } from "next/server";
import { activateUser } from "@/app/(app)/admin/employees/actions";

export async function POST(req: Request) {
  const { userId } = await req.json();
  const result = await activateUser(userId);
  return NextResponse.json(result);
}
