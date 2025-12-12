'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Clock, LogIn, LogOut, CalendarIcon } from "lucide-react";
import { format, isValid, isSameDay, startOfMonth } from "date-fns";
import AttendanceTimeline from "@/components/attendance-timeline";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { formatISTTime } from "@/lib/time";

/**
 * Returns a Date object representing "now" in India Standard Time (UTC+5:30).
 * This is computed from the local machine time and works reliably in the browser.
 */
function getIndiaNow(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffsetMs = 5.5 * 60 * 60 * 1000; // 5.5 hours in ms
  return new Date(utc + istOffsetMs);
}

function safeFormat(date: any) {
  const d = new Date(date);
  if (!date || !isValid(d)) return "—";
  return formatISTTime(d);
}

// ✅ One employee → one latest record
function getLatestAttendance(data: any[]) {
  const map = new Map<string, any>();

  data.forEach((log) => {
    const key = log.employeeId || log.employeeName;
    if (!key) return;

    const existing = map.get(key);

    if (
      !existing ||
      new Date(log.clockIn || 0).getTime() >
        new Date(existing.clockIn || 0).getTime()
    ) {
      map.set(key, log);
    }
  });

  return Array.from(map.values());
}

export default function AttendancePage() {
  const router = useRouter();

  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"today" | "date">("today");
  const [view, setView] = useState<"table" | "timeline">("table");
  const [selectedDate, setSelectedDate] = useState<Date | null>(getIndiaNow());
  const [currentMonth, setCurrentMonth] = useState(getIndiaNow());
  const [presentDays, setPresentDays] = useState<string[]>([]);

  const fetchMonthlyData = async (month: Date) => {
    const monthStr = format(month, 'yyyy-MM');
    try {
      const res = await fetch(`/api/attendance/monthly?month=${monthStr}`);
      const data = await res.json();
      if (data.presentDays) {
        setPresentDays(data.presentDays);
      }
    } catch (error) {
      console.error('Failed to fetch monthly attendance:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      let url = "/api/admin/attendance/live";

      if (filter === "today") {
        url += "?day=today";
      } else if (filter === "date" && selectedDate) {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        url += `?date=${dateStr}`;
      }

      const res = await fetch(url, { cache: "no-store" });
      const text = await res.text();
      if (!text) return;

      const data = JSON.parse(text);
      if (!Array.isArray(data)) return;

      const uniqueData = getLatestAttendance(data);
      setAttendance(uniqueData);
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 10000);
    return () => clearInterval(interval);
  }, [filter, selectedDate]);

  useEffect(() => {
    fetchMonthlyData(currentMonth);
  }, [currentMonth]);

  const presentDaysSet = new Set(presentDays.map(day => day.split('T')[0]));

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Attendance"
        description="Track employee attendance in real time."
      />

      <div className="p-6">
        {/* Filters */}
        <div className="flex gap-3 mb-4">
          {/* Today button */}
          <button
            onClick={() => {
              setFilter("today");
              setSelectedDate(getIndiaNow());
            }}
            className={`px-4 py-2 rounded ${
              filter === "today"
                ? "bg-blue-600 text-white"
                : "bg-gray-300"
            }`}
          >
            Today
          </button>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={() => setFilter("date")}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  filter === "date" && selectedDate
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300"
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                {selectedDate && filter === 'date'
                  ? format(selectedDate, "dd MMM yyyy")
                  : "Pick Date"}
              </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate ?? getIndiaNow()}
                onSelect={(date) => {
                  if (!date) return;
                  setSelectedDate(date);
                  setFilter("date");
                }}
                onMonthChange={(month) => setCurrentMonth(month)}
                modifiers={{
                  present: (day) => presentDaysSet.has(format(day, 'yyyy-MM-dd')),
                  absent: (day) => {
                    const month = startOfMonth(currentMonth);
                    const nowInIndia = getIndiaNow();
                    if (day < month || day > nowInIndia) return false; // Only for current month
                    if (isSameDay(day, nowInIndia)) return false; // Today is not absent yet
                    return !presentDaysSet.has(format(day, 'yyyy-MM-dd'));
                  }
                }}
                modifiersClassNames={{
                  present: 'day-present',
                  absent: 'day-absent'
                }}
              />
              <div className="flex justify-around p-2 text-sm border-t">
                  <div className="flex items-center gap-2"><div className="h-4 w-4 bg-present rounded-full"></div>Present</div>
                  <div className="flex items-center gap-2"><div className="h-4 w-4 bg-absent rounded-full"></div>Absent</div>
              </div>
            </PopoverContent>
          </Popover>

          {/* View Buttons */}
          <button
            onClick={() => setView("table")}
            className={`px-4 py-2 rounded ${
              view === "table"
                ? "bg-indigo-600 text-white"
                : "bg-gray-300"
            }`}
          >
            Table View
          </button>

          <button
            onClick={() => setView("timeline")}
            className={`px-4 py-2 rounded ${
              view === "timeline"
                ? "bg-indigo-600 text-white"
                : "bg-gray-300"
            }`}
          >
            Timeline View
          </button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6" />
              Attendance{" "}
              {filter === "today"
                ? "(Today)"
                : selectedDate
                ? `(${format(selectedDate, "dd MMM yyyy")})`
                : ""}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500 py-10">
                Loading...
              </div>
            ) : view === "timeline" ? (
              <AttendanceTimeline data={attendance} />
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
                    <TableRow
                      key={record.id}
                      onClick={() =>
                        router.push(
                          `/admin/employees/${record.employeeId}`
                        )
                      }
                      className="cursor-pointer hover:bg-muted/50 transition"
                    >
                      <TableCell className="font-medium">
                        {record.employeeName}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            record.clockOut ? "secondary" : "default"
                          }
                          className={
                            !record.clockOut
                              ? "bg-green-500 text-white"
                              : ""
                          }
                        >
                          {record.clockOut
                            ? "Clocked Out"
                            : "Clocked In"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <LogIn className="h-4 w-4 text-gray-500" />
                          {safeFormat(record.clockIn)}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.clockOut ? (
                            <>
                              <LogOut className="h-4 w-4 text-gray-500" />
                              {safeFormat(record.clockOut)}
                            </>
                          ) : (
                            <span className="text-gray-500">—</span>
                          )}
                        </div>
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
