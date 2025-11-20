import { getSession } from "@/lib/session";
import prisma from "@/lib/db";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const records = await prisma.attendance.findMany({
    where: { userId },
    orderBy: { checkIn: "desc" }
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const { height } = page.getSize();

  let y = height - 40;

  page.drawText(`Attendance Report for ${session.user.name}`, {
    x: 40,
    y,
    size: 18,
    font
  });

  y -= 30;

  for (const r of records) {
    const checkIn = new Date(r.checkIn);
    const checkOut = r.checkOut ? new Date(r.checkOut) : new Date();

    const hours =
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    // SAFE ASCII TEXT (pdf-lib utf-8 fix)
    const line = `${checkIn.toDateString()} | ${checkIn.toLocaleTimeString()} -> ${
      r.checkOut ? checkOut.toLocaleTimeString() : "-"
    } | ${hours.toFixed(2)} hrs`;

    page.drawText(line, { x: 40, y, size: 12, font });

    y -= 20;
    if (y < 40) {
      y = height - 40;
      pdf.addPage();
    }
  }

  // 🔥 Create PDF
  const pdfBytes = await pdf.save();

  // 🔥 WRAP IN BLOB (fixes TS + Next.js runtime)
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=attendance.pdf",
    },
  });
}
