// AttendanceCalendar.tsx

"use client";

import { Calendar } from "@/components/ui/calendar";

export function AttendanceCalendar({
  attendance,
  joiningDate,
}: {
  attendance: any[];
  joiningDate: Date;
}) {
  // Days with check-in
  const presentDays = attendance
    ?.filter((a: any) => a.checkIn)
    .map((a: any) => new Date(a.checkIn));

  return (
    <Calendar
      mode="single"
      selected={joiningDate}
      modifiers={{
        present: presentDays,
      }}
      modifiersStyles={{
        present: {
          backgroundColor: "#4ade80",
          color: "white",
          borderRadius: "50%",
        },
      }}
    />
  );
}
