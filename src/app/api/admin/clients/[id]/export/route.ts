//src/app/api/admin/clients/[id]/export/route.ts
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { PDFDocument, StandardFonts } from "pdf-lib";

interface Params {
  params: { id: string };
}

export async function GET(_req: Request, { params }: Params) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const clientId = params.id;

  const client = await prisma.client.findUnique({
    where: { id: clientId },
    include: {
      employees: {
        include: {
          user: {
            select: { name: true, employeeCode: true },
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
  });

  if (!client) {
    return Response.json({ error: "Client not found" }, { status: 404 });
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
  drawLine(`CLIENT REPORT`, 18);
  drawLine(`Client: ${client.name}`, 14);
  drawLine("");

  drawLine(`Company: ${client.companyName ?? "-"}`);
  drawLine(`Email: ${client.contactEmail ?? "-"}`);
  drawLine(`Phone: ${client.contactPhone ?? "-"}`);
  drawLine(`Status: ${client.status}`);
  drawLine(`Funds: INR ${client.funds ?? 0}`);
  drawLine(`Objective: ${client.objective ?? "-"}`);
  drawLine("");

  // Employees
  drawLine("Assigned Employees:");
  if (client.employees.length === 0) {
    drawLine("- None");
  } else {
    client.employees.forEach(emp => {
      drawLine(`- ${emp.user.name} (${emp.user.employeeCode})`);
    });
  }

  drawLine("");

  // Projects
  drawLine("Projects:");
  if (client.projects.length === 0) {
    drawLine("- None");
  } else {
    client.projects.forEach(p => {
      drawLine(`- ${p.project.name}`);
    });
  }

  drawLine("");

  // Logs
  drawLine("Client Logs:");
  if (client.logs.length === 0) {
    drawLine("- No logs yet");
  } else {
    client.logs.forEach((log, index) => {
      drawLine(`Log ${index + 1}:`);
      drawLine(`  Date: ${log.createdAt.toISOString()}`);

      const by = log.createdBy
        ? `${log.createdBy.name} (${log.createdBy.employeeCode})`
        : "Unknown";

      drawLine(`  By: ${by}`);

      if (log.objective) drawLine(`  Objective: ${log.objective}`);
      if (log.request) drawLine(`  Request: ${log.request}`);
      if (log.response) drawLine(`  Response: ${log.response}`);
      if (log.amount != null) drawLine(`  Amount: INR ${log.amount}`);

      drawLine("");
    });
  }

  const pdfBytes = await pdf.save();

  return new Response(new Uint8Array(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=client-${client.id}.pdf`,
    },
  });
}
