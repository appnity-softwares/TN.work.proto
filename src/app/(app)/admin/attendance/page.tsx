import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAttendance } from "@/lib/data";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut } from "lucide-react";

export default async function AttendancePage() {
  const attendanceData = await getAttendance();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Attendance" description="Track employee clock-in and clock-out times." />
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeName}</TableCell>
                    <TableCell>
                      <Badge variant={record.clockOut ? "secondary" : "default"} className={record.clockOut ? "" : "bg-green-500 text-white"}>
                        {record.clockOut ? "Clocked Out" : "Clocked In"}
                      </Badge>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(record.clockIn), "p")}
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                        {record.clockOut ? (
                            <>
                                <LogOut className="h-4 w-4 text-muted-foreground" />
                                {format(new Date(record.clockOut), "p")}
                            </>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
