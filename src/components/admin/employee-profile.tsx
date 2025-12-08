'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Download, Pencil, Lock, UserX } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

/* ========================
   Safe Date Formatter
======================== */
function safeFormat(dateValue: any, pattern = "dd MMM yyyy") {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return "—";

  return format(date, pattern);
}

export function EmployeeProfile({ user, allAttendance }: any) {
  const [activeTab, setActiveTab] = useState("overview");

  const attendance = user.attendance || [];
  const workLogs = user.workLogs || [];

  // ========= Stats Calculations (Last 30 Days) ==========
  const totalDays = attendance.length;

  const totalHours = attendance.reduce((acc: number, record: any) => {
    const checkIn = new Date(record.checkIn);
    const checkOut = record.checkOut ? new Date(record.checkOut) : null;

    if (isNaN(checkIn.getTime()) || !checkOut) return acc;

    const diff = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
    return acc + diff;
  }, 0);

  const avgHours = totalDays ? totalHours / totalDays : 0;
  const absentDays = Math.max(30 - totalDays, 0);

  const mostActiveDay =
    attendance.length > 0
      ? safeFormat(attendance[0].checkIn, "EEEE")
      : "N/A";

  const isWorking =
    attendance.length > 0 && attendance[0].checkOut === null;

  const suspensionReason = user.meta?.suspensionReason;

  return (
    <div className="p-2 sm:p-6 space-y-6">

      {/* ======= COVER ======= */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="text-2xl">
                {user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{user?.name}</h2>
              <p className="text-xs sm:text-sm text-white/80">
                {user?.employeeCode} • {user?.email}
              </p>

              <div className="flex items-center gap-3 mt-2">
                 <Badge variant={user.status === 'ACTIVE' ? 'default' : user.status === 'SUSPENDED' ? 'secondary' : 'destructive'}>{user.status}</Badge>

                {isWorking && (
                  <span className="animate-pulse text-green-300 text-sm">
                    ● Currently Working
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>

            <Button variant="secondary" size="sm">
              <Lock className="h-4 w-4 mr-2" />
              Reset Password
            </Button>

            <Button variant="secondary" size="sm">
              <UserX className="h-4 w-4 mr-2" />
              Deactivate
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="bg-white text-black"
              onClick={() =>
                window.open(
                  `/api/admin/employee/${user.id}/export`,
                  "_blank"
                )
              }
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* ======= STATS (Last 30 days) ======= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <StatCard title="Working Days (30d)" value={totalDays} />
        <StatCard title="Total Hours (30d)" value={totalHours.toFixed(1)} />
        <StatCard title="Avg Hours / Day (30d)" value={avgHours.toFixed(1)} />
        <StatCard title="Absent Days (30d)" value={absentDays} />
      </div>

      {/* ======= TABS ======= */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-lg mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="worklogs">Work Logs</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card className="mt-4">
            <CardContent className="p-4 sm:p-6 space-y-2">
              <p><strong>Joined:</strong> {safeFormat(user?.joinDate)}</p>
              <p><strong>Role:</strong> {user?.role}</p>
                <p><strong>Status:</strong> <Badge variant={user.status === 'ACTIVE' ? 'default' : user.status === 'SUSPENDED' ? 'secondary' : 'destructive'}>{user.status}</Badge></p>
                {user.status === 'SUSPENDED' && suspensionReason && (
                    <p><strong>Suspension Reason:</strong> {suspensionReason}</p>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar">
            <Calendar attendance={allAttendance} joiningDate={new Date(user.joinDate)} />
        </TabsContent>

        {/* Work Logs */}
        <TabsContent value="worklogs">
          <Card className="mt-4">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {workLogs.length === 0 && (
                <p className="text-sm text-gray-500">No work logs found.</p>
              )}

              {workLogs.map((log: any) => (
                <div key={log.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="font-semibold text-sm">
                    {safeFormat(log.date)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {log.description || "No description"}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights">
          <Card className="mt-4">
            <CardContent className="p-4 sm:p-6 space-y-2 text-sm">
              <p><strong>Most Active Day:</strong> {mostActiveDay}</p>
              <p><strong>Attendance Trend:</strong> Improving ✅</p>
              <p><strong>Consistency Score:</strong> 82%</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ===== Reusable Stats Card ===== */
function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-3 sm:p-5 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  );
}
