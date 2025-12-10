// /src/components/admin/ReminderItem.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { EditReminderModal } from "./EditReminderModal";
import { googleCalendarUrl } from "@/lib/calendar";
import { useToast } from "@/hooks/use-toast";

export function ReminderItem({ reminder, onDeleted, onUpdated }: {
  reminder: any;
  onDeleted?: () => void;
  onUpdated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Delete this reminder?")) return;
    try {
      const res = await fetch(`/api/reminders/${reminder.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast({ title: "Deleted" });
      if (onDeleted) onDeleted();
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Could not delete" });
    }
  };

  const start = new Date(reminder.date);
  let startWithTime = start;
  if (reminder.time) {
    const m = reminder.time.match(/^(\d{1,2}):(\d{2})/);
    if (m) {
      const d = new Date(start);
      d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
      startWithTime = d;
    }
  }
  const end = new Date(startWithTime.getTime() + 60 * 60 * 1000);

  const gcal = googleCalendarUrl({
    title: reminder.title,
    details: reminder.description || "",
    location: reminder.clientName || "",
    start: startWithTime,
    end,
  });

  return (
    <div className="border rounded p-3 flex justify-between items-start">
      <div>
        <div className="font-semibold">{reminder.title}</div>
        <div className="text-sm text-muted-foreground">{reminder.clientName}</div>
        <div className="text-xs text-muted-foreground mt-1">{format(startWithTime, "PPP")}{reminder.time ? ` • ${reminder.time}` : ""}</div>
        {reminder.description && <div className="mt-2 text-sm">{reminder.description}</div>}
      </div>

      <div className="flex flex-col gap-2">
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Edit</Button>
        <a href={`/api/reminders/${reminder.id}/ics`} target="_blank" rel="noreferrer">
          <Button size="sm" variant="ghost">Download .ics</Button>
        </a>
        <a href={gcal} target="_blank" rel="noreferrer">
          <Button size="sm" variant="ghost">Add to Google</Button>
        </a>
        <Button size="sm" variant="destructive" onClick={handleDelete}>Delete</Button>
      </div>

      <EditReminderModal open={open} onOpenChange={setOpen} reminderId={reminder.id} onUpdated={onUpdated} />
    </div>
  );
}
