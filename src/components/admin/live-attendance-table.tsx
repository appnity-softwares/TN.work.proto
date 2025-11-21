"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, LogIn, LogOut, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

type AttendanceRecord = {
  id: string;
  employeeName: string;
  clockIn: string;
  clockOut: string | null;
};

export function LiveAttendanceTable() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/admin/attendance/live", {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to load attendance");

      const data = await res.json();
      setRecords(data);
    } catch (err) {
      console.error("Attendance Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();

    const interval = setInterval(() => {
      fetchAttendance();
    }, 30000); // 🔥 refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-10">
        Loading live attendance...
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={fetchAttendance}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Now
        </Button>
      </div>

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
          {records.map((record) => {
            const isClockedOut = !!record.clockOut;

            return (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {record.employeeName}
                </TableCell>

                <TableCell>
                  <Badge
                    variant={isClockedOut ? "secondary" : "default"}
                    className={!isClockedOut ? "bg-green-500 text-white" : ""}
                  >
                    {isClockedOut ? "Clocked Out" : "Clocked In"}
                  </Badge>
                </TableCell>

                <TableCell className="flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-muted-foreground" />
                  {format(new Date(record.clockIn), "hh:mm a")}
                </TableCell>

                <TableCell className="flex items-center gap-2">
                  {record.clockOut ? (
                    <>
                      <LogOut className="h-4 w-4 text-muted-foreground" />
                      {format(new Date(record.clockOut), "hh:mm a")}
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
}
