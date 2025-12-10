import { sendEmail } from "@/lib/email/send";
import { NextResponse } from "next/server";

export async function GET() {
  const r = await sendEmail(
    "your-email@gmail.com",
    "TaskNity Email Test",
    "<h3>Email service connected successfully.</h3>"
  );

  return NextResponse.json(r);
}
