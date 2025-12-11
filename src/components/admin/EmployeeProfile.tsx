"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Download,
  Pencil,
  Lock,
  UserX,
  Ban,
  CheckCircle,
} from "lucide-react";

import { AttendanceCalendar } from "@/components/admin/AttendanceCalendar";

import {
  suspendUser,
  unsuspendUser,
  activateUser,
} from "@/app/(app)/admin/employees/actions";

import { ResetPasswordModal } from "@/components/admin/ResetPasswordModal";

/* ======================================
   Safe Date Formatter
====================================== */
function safeFormat(dateValue: any, pattern = "dd MMM yyyy") {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  return isNaN(date.getTime()) ? "—" : format(date, pattern);
}

/* ======================================
   Main Component
====================================== */
export function EmployeeProfile({ user, allAttendance }: any) {
  const [activeTab, setActiveTab] = useState("overview");
  const [resetOpen, setResetOpen] = useState(false);

  const attendance = user.attendance || [];
  const workLogs = user.workLogs || [];

  // ===== Stats (Last 30 Days) =====
  const totalDays = attendance.length;

  const totalHours = attendance.reduce((acc: number, record: any) => {
    const checkIn = new Date(record.checkIn);
    const checkOut = record.checkOut ? new Date(record.checkOut) : null;
    if (isNaN(checkIn.getTime()) || !checkOut) return acc;
    return acc + (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
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

  /* ======================================
      ACTION HANDLERS
  ====================================== */

  const handleSuspend = async () => {
    const reason = prompt("Enter suspension reason:");
    if (!reason) return;

    await suspendUser(user.id, reason);
    window.location.reload();
  };

  const handleUnsuspend = async () => {
    await unsuspendUser(user.id);
    window.location.reload();
  };

  const handleActivate = async () => {
    await activateUser(user.id);
    window.location.reload();
  };

  const handlePasswordReset = async () => {
    setResetOpen(true);
  };

  /* ======================================
      RENDER
  ====================================== */
  return (
    <div className="p-4 sm:p-7 space-y-7 max-w-5xl mx-auto">

      {/* ======================================
          HEADER SECTION
      ====================================== */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Avatar + Basic Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border-2 border-white shadow-md">
              <AvatarImage src={user.avatar || ""} />
              <AvatarFallback className="text-3xl">
                {user?.name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">{user?.name}</h2>
              <p className="text-sm text-white/80">
                {user.employeeCode} • {user.email || "No Email"}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <Badge
                  variant={
                    user.status === "ACTIVE"
                      ? "default"
                      : user.status === "SUSPENDED"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {user.status}
                </Badge>

                {isWorking && (
                  <span className="animate-pulse text-green-300 text-sm">
                    ● Working now
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap gap-2 justify-center">

            <Button variant="secondary" size="sm">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>

            <Button variant="secondary" size="sm" onClick={handlePasswordReset}>
              <Lock className="h-4 w-4 mr-2" /> Send Reset Link
            </Button>

            {user.status === "SUSPENDED" ? (
              <Button variant="secondary" size="sm" onClick={handleUnsuspend}>
                <CheckCircle className="h-4 w-4 mr-2" /> Unsuspend
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleSuspend}>
                <Ban className="h-4 w-4 mr-2" /> Suspend
              </Button>
            )}

            {user.status === "INACTIVE" ? (
              <Button variant="secondary" size="sm" onClick={handleActivate}>
                <CheckCircle className="h-4 w-4 mr-2" /> Activate
              </Button>
            ) : (
              <Button variant="secondary" size="sm">
                <UserX className="h-4 w-4 mr-2" /> Deactivate
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              className="bg-white text-black"
              onClick={() =>
                window.open(`/api/admin/employee/${user.id}/export`, "_blank")
              }
            >
              <Download className="h-4 w-4 mr-2" /> Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Working Days (30d)" value={totalDays} />
        <StatCard title="Total Hours (30d)" value={totalHours.toFixed(1)} />
        <StatCard title="Avg Hours / Day" value={avgHours.toFixed(1)} />
        <StatCard title="Absent Days" value={absentDays} />
      </div>

      {/* TABS SECTION */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-lg mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="worklogs">Work Logs</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <Card className="mt-4">
            <CardContent className="p-6 space-y-2">
              <p><strong>Joined:</strong> {safeFormat(user.joinDate)}</p>
              <p><strong>Role:</strong> {user.role}</p>

              <p>
                <strong>Status:</strong>{" "}
                <Badge
                  variant={
                    user.status === "ACTIVE"
                      ? "default"
                      : user.status === "SUSPENDED"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {user.status}
                </Badge>
              </p>

              {user.status === "SUSPENDED" && suspensionReason && (
                <p><strong>Suspension Reason:</strong> {suspensionReason}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar */}
        <TabsContent value="calendar">
          <AttendanceCalendar
            attendance={allAttendance}
            joiningDate={new Date(user.joinDate)}
          />
        </TabsContent>

        {/* Work Logs */}
        <TabsContent value="worklogs">
          <Card className="mt-4">
            <CardContent className="p-6 space-y-4">
              {workLogs.length === 0 ? (
                <p className="text-sm text-gray-500">No work logs found.</p>
              ) : (
                workLogs.map((log: any) => (
                  <div key={log.id} className="border rounded-lg p-4">
                    <p className="font-semibold text-sm">
                      {safeFormat(log.date)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {log.description}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights */}
        <TabsContent value="insights">
          <Card className="mt-4">
            <CardContent className="p-6 space-y-2 text-sm">
              <p><strong>Most Active Day:</strong> {mostActiveDay}</p>
              <p><strong>Attendance Trend:</strong> Improving</p>
              <p><strong>Consistency Score:</strong> 82%</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* PASSWORD RESET MODAL */}
      <ResetPasswordModal
        open={resetOpen}
        onOpenChange={setResetOpen}
        user={user}
      />
    </div>
  );
}

/* ======================================
   Reusable Stats Card
====================================== */
function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-xs sm:text-sm text-muted-foreground">{title}</p>
        <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  );
}
