import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { PDFDocument, StandardFonts } from "pdf-lib";

export async function GET() {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const clients = await prisma.client.findMany({
    include: {
      employees: {
        include: {
          user: {
            select: {
              name: true,
              employeeCode: true,
            },
          },
        },
      },
      projects: {
        include: {
          project: true,
        },
      },
      logs: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              name: true,
              employeeCode: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!clients || clients.length === 0) {
    return Response.json({ error: "No clients found" }, { status: 404 });
  }

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  let page = pdf.addPage();
  let { height } = page.getSize();
  let y = height - 40;

  const drawLine = (text: string, size = 12) => {
    page.drawText(text, { x: 40, y, size, font });
    y -= size + 6;

    if (y < 40) {
      page = pdf.addPage();
      ({ height } = page.getSize());
      y = height - 40;
    }
  };

  // HEADER
  drawLine("STUDIO TN — ALL CLIENTS EXPORT", 18);
  drawLine("------------------------------------");
  drawLine("");

  for (const client of clients) {
    drawLine(`Client: ${client.name}`, 16);
    drawLine(`Status: ${client.status}`);
    drawLine(`Objective: ${client.objective || "-"}`);
    drawLine(`Funds: INR ${client.funds ?? 0}`);
    drawLine(`Created At: ${client.createdAt.toISOString()}`);
    drawLine("");

    // Employees
    drawLine("Assigned Employees:", 13);
    if (client.employees.length === 0) {
      drawLine("- None");
    } else {
      for (const emp of client.employees) {
        drawLine(`- ${emp.user.name} (${emp.user.employeeCode})`);
      }
    }

    drawLine("");

    // Projects
    drawLine("Linked Projects:", 13);
    if (client.projects.length === 0) {
      drawLine("- None");
    } else {
      for (const cp of client.projects) {
        drawLine(`- ${cp.project.name}`);
      }
    }

    drawLine("");

    // Logs
    drawLine("Logs:", 13);

    if (client.logs.length === 0) {
      drawLine("- No logs.");
    } else {
      client.logs.forEach((log, index) => {
        drawLine(`Log #${index + 1}`, 12);
        drawLine(`  Date: ${log.createdAt.toISOString()}`);

        const by = log.createdBy
          ? `${log.createdBy.name} (${log.createdBy.employeeCode})`
          : "Unknown";

        drawLine(`  By: ${by}`);

        if (log.objective) drawLine(`  Objective: ${log.objective}`);
        if (log.request) drawLine(`  Request: ${log.request}`);
        if (log.response) drawLine(`  Response: ${log.response}`);
        if (log.amount) drawLine(`  Amount: INR ${log.amount}`);

        drawLine("");
      });
    }

    drawLine("-----------------------------------");
    drawLine("");
  }

  const pdfBytes = await pdf.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], {
    type: "application/pdf",
  });

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=all-clients.pdf",
    },
  });
}

