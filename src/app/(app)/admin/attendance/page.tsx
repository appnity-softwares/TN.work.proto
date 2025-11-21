"use client";

import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut } from "lucide-react";
import { format, isValid } from "date-fns";

// ✅ Safe date formatter
function safeFormat(date: any) {
  const d = new Date(date);
  if (!date || !isValid(d)) return "—";
  return format(d, "hh:mm a");
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch admin attendance data
  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance/admin", {
        cache: "no-store",
      });

      const text = await res.text();

      if (!text) {
        console.error("Empty response from server");
        return;
      }

      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        console.error("Invalid attendance format:", data);
        return;
      }

      setAttendance(data);

    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Initial load + live refresh every 10 seconds
  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 10000); // every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Attendance"
        description="Track employee clock-in and clock-out times in real-time."
      />

      <div className="flex-1 overflow-y-auto p-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Today's Attendance (Live)
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center text-muted-foreground py-10">
                Loading live attendance...
              </div>
            ) : (
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
                  {attendance.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.employeeName}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={record.clockOut ? "secondary" : "default"}
                          className={!record.clockOut ? "bg-green-500 text-white" : ""}
                        >
                          {record.clockOut ? "Clocked Out" : "Clocked In"}
                        </Badge>
                      </TableCell>

                      <TableCell className="flex items-center gap-2">
                        <LogIn className="h-4 w-4 text-muted-foreground" />
                        {safeFormat(record.clockIn)}
                      </TableCell>

                      <TableCell className="flex items-center gap-2">
                        {record.clockOut ? (
                          <>
                            <LogOut className="h-4 w-4 text-muted-foreground" />
                            {safeFormat(record.clockOut)}
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
