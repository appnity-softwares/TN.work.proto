"use client";

import { useWorkLogs } from "@/lib/hooks/use-work-logs";
import { AddWorkLogDialog } from "./AddWorkLogDialog";

export function WorkLogs() {
  const { workLogs, isLoading, isError } = useWorkLogs();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading work logs</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Work Logs</h1>
        <AddWorkLogDialog />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {workLogs.map((log: any) => (
          <div key={log.id} className="p-4 border rounded-lg">
            <p>Date: {new Date(log.date).toLocaleDateString()}</p>
            <p>Check In: {log.checkIn}</p>
            <p>Check Out: {log.checkOut}</p>
            <p>Employee: {log.user.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
