"use client";

import { LogIn, LogOut, Clock } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function AttendanceTimeline({ data }: { data: any[] }) {
  const router = useRouter();

  // 🔹 Filter: one latest record per employee
  const uniqueEmployees = getLatestAttendance(data);

  const handleCardClick = (employeeId?: string) => {
    if (!employeeId) return;
    router.push(`/admin/employees/${employeeId}`);
  };

  return (
    <div className="space-y-10 border-l-2 border-gray-300 ml-4 pl-6">
      {uniqueEmployees.length === 0 ? (
        <p className="text-gray-500 text-center py-10">No attendance found</p>
      ) : (
        uniqueEmployees.map((item) => (
          <div key={item.id} className="relative">
            <div className="absolute -left-3 top-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow"></div>

            {/* ✅ LOGIC ONLY: Click Redirect */}
            <div
              onClick={() => handleCardClick(item.employeeId)}
              className="bg-white shadow-md p-5 rounded-xl border border-gray-200"
            >
              <h3 className="text-lg font-semibold">
                {item.employeeName}
              </h3>

              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <LogIn className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">Clock In</p>
                    <p className="text-gray-600">
                      {item.clockIn
                        ? format(new Date(item.clockIn), "hh:mm a")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium">Clock Out</p>
                    <p className="text-gray-600">
                      {item.clockOut
                        ? format(new Date(item.clockOut), "hh:mm a")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-gray-600">
                      {item.clockOut
                        ? calculateDuration(item.clockIn, item.clockOut)
                        : "Still Working"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* END redirect logic */}
          </div>
        ))
      )}
    </div>
  );
}

function calculateDuration(start: string, end: string) {
  const diffMs = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs / (1000 * 60)) % 60);
  return `${hours}h ${mins}m`;
}

// 🔹 Keep only ONE latest log per employee
function getLatestAttendance(data: any[]) {
  const map = new Map<string, any>();

  data.forEach((log) => {
    const key = log.employeeId ?? log.employeeName;
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
