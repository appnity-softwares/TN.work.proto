import { getSession } from "@/lib/session";
import { db as prisma } from "@/lib/db";
import { NextRequest } from "next/server";
import { Parser } from "json2csv";

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
    where: { id: employeeId },
    include: {
      attendance: {
        select: {
          id: true,
          checkIn: true,
          checkOut: true,
        }
      },
      workLogs: {
        select: {
          id: true,
          date: true,
          description: true,
        }
      }
    }
  });

  if (!user) {
    return Response.json({ error: "Employee not found" }, { status: 404 });
  }

  // Basic profile data
  const profileData = [{
    name: user.name ?? "",
    employeeCode: user.employeeCode ?? "",
    role: user.role ?? "",
    status: user.status ?? "",
    joinDate: user.joinDate ? user.joinDate.toISOString() : "",
  }];

  // Attendance CSV ready format
  const attendanceData = user.attendance.map((record) => ({
    id: record.id,
    checkIn: record.checkIn ? record.checkIn.toISOString() : "",
    checkOut: record.checkOut ? record.checkOut.toISOString() : "",
  }));

  // Work Logs CSV ready format
  const workLogsData = user.workLogs.map((log) => ({
    id: log.id,
    date: log.date ? log.date.toISOString() : "",
    description: log.description ?? "",
  }));

  const parser = new Parser();

  const profileCsv = parser.parse(profileData);
  const attendanceCsv = parser.parse(attendanceData);
  const workLogsCsv = parser.parse(workLogsData);

  const final = `Profile\n${profileCsv}\n\nAttendance\n${attendanceCsv}\n\nWork Logs\n${workLogsCsv}`;

  return new Response(final, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${user.employeeCode || "employee"}_export.csv`,
    },
  });
}
