"use client";

import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from "date-fns";

export function EmployeeAttendanceCalendar({
  attendance,
  joiningDate,
}: {
  attendance: any[];
  joiningDate: Date;
}) {
  const attendedDates = attendance
    .filter((a) => a.checkIn)
    .map((a) => new Date(a.checkIn));

  return (
    <Calendar
      mode="single"
      selected={joiningDate}
      modifiers={{
        present: attendedDates,
      }}
      modifiersStyles={{
        present: {
          backgroundColor: "#4ade80",
          color: "white",
          borderRadius: "50%",
        },
      }}
      className="rounded-md border shadow"
    />
  );
}
