"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Download, Clock } from "lucide-react";
import { format } from "date-fns";

export function EmployeeProfile({ user }: { user: any }) {
  const handleExport = () => {
    window.open(`/api/admin/employee/${user.id}/export`, "_blank");
  };

  const totalHours = user.attendance.reduce((acc: number, record: any) => {
    if (!record.checkOut) return acc;
    const diff =
      new Date(record.checkOut).getTime() -
      new Date(record.checkIn).getTime();

    return acc + diff / (1000 * 60 * 60);
  }, 0);

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <p className="text-muted-foreground text-sm">
              Code: {user.employeeCode}
            </p>
            <Badge>{user.role}</Badge>
          </div>

          <Button onClick={handleExport} className="flex gap-2">
            <Download className="h-4 w-4" />
            Export Profile
          </Button>
        </CardHeader>
      </Card>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Total Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {user.attendance.length} records
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Total Work Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {user.workLogs.length} entries
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader>
            <CardTitle>Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            {totalHours.toFixed(2)} hrs
          </CardContent>
        </Card>
      </div>

      {/* ATTENDANCE */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Attendance History</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {user.attendance.map((a: any) => (
            <div
              key={a.id}
              className="flex justify-between border-b pb-2 text-sm"
            >
              <span>{format(new Date(a.checkIn), "dd MMM yyyy")}</span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {format(new Date(a.checkIn), "hh:mm a")} →{" "}
                {a.checkOut
                  ? format(new Date(a.checkOut), "hh:mm a")
                  : "Still Working"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* WORK LOGS */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Daily Work Logs</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {user.workLogs.map((log: any) => (
            <div key={log.id} className="border-b pb-2">
              <p className="font-medium">
                {format(new Date(log.date), "dd MMM yyyy")}
              </p>
              <p className="text-sm text-muted-foreground">
                {log.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
