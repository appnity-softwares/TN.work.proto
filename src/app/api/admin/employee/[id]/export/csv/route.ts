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
    include: { attendance: true, workLogs: true },
  });

  if (!user) {
    return Response.json({ error: "Employee not found" }, { status: 404 });
  }

  // Basic profile fields
  const profileData = {
    name: user.name,
    email: user.email,
    employeeCode: user.employeeCode,
    role: user.role,
    status: user.status,
    joinDate: user.joinDate.toISOString(),
  };

  // Flatten attendance records
  const attendanceData = user.attendance.map(record => ({
    checkIn: record.checkIn.toISOString(),
    checkOut: record.checkOut?.toISOString() || "",
  }));

  // Flatten work logs
  const workLogsData = user.workLogs.map(log => ({
    date: log.date.toISOString(),
    description: log.description,
  }));

  const json2csvParser = new Parser();
  const profileCsv = json2csvParser.parse(profileData);
  const attendanceCsv = json2csvParser.parse(attendanceData);
  const workLogsCsv = json2csvParser.parse(workLogsData);

  const csv = `Profile\n${profileCsv}\n\nAttendance\n${attendanceCsv}\n\nWork Logs\n${workLogsCsv}`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=${user.employeeCode}_profile.csv`,
    },
  });
}
