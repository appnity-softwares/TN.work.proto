import { getSession } from "@/lib/session";
import { db as prisma } from "@/lib/db";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employeeId = params.id;

  const user = await prisma.user.findUnique({
    where: { id: employeeId }
  });

  if (!user) {
    return Response.json({ error: "Employee not found" }, { status: 404 });
  }

  const attendanceRecords = await prisma.attendance.findMany({
    where: { userId: employeeId },
    orderBy: { checkIn: "desc" }
  });

  const workLogs = await prisma.workLog.findMany({
    where: { userId: employeeId },
    orderBy: { date: "desc" }
  });

  const pdf = await PDFDocument.create();
  let page = pdf.addPage();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();

  let y = height - 40;

  // 🧾 TITLE
  page.drawText(`Employee Profile Report`, { x: 40, y, size: 18, font });
  y -= 25;

  page.drawText(`Name: ${user.name}`, { x: 40, y, size: 12, font });
  y -= 15;
  page.drawText(`Employee Code: ${user.employeeCode}`, { x: 40, y, size: 12, font });
  y -= 30;

  // 📅 Attendance Section
  page.drawText("Attendance Records:", { x: 40, y, size: 14, font });
  y -= 20;

  for (const r of attendanceRecords) {
    const checkIn = new Date(r.checkIn);
    const checkOut = r.checkOut ? new Date(r.checkOut) : new Date();

    const hours =
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    const line = `${checkIn.toDateString()} | ${checkIn.toLocaleTimeString()} -> ${
      r.checkOut ? checkOut.toLocaleTimeString() : "-"
    } | ${hours.toFixed(2)} hrs`;

    page.drawText(line, { x: 40, y, size: 11, font });
    y -= 15;

    if (y < 60) {
      page = pdf.addPage();
      y = height - 40;
    }
  }

  y -= 20;

  // 📝 Work Logs Section
  page.drawText("Daily Work Logs:", { x: 40, y, size: 14, font });
  y -= 20;

  for (const log of workLogs) {
    const line = `${new Date(log.date).toDateString()} - ${log.description}`;

    page.drawText(line, { x: 40, y, size: 11, font });
    y -= 15;

    if (y < 60) {
      page = pdf.addPage();
      y = height - 40;
    }
  }

  // ✅ Correct export (same logic as your working exporter)
  const pdfBytes = await pdf.save();

  const blob = new Blob(
    [new Uint8Array(pdfBytes)],
    { type: "application/pdf" }
  );

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=${user.employeeCode}_profile.pdf`,
    },
  });
}
