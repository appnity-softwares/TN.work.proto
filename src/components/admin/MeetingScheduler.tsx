// /src/components/admin/MeetingScheduler.tsx
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export function MeetingScheduler({ onCreated }: { onCreated?: () => void }) {
  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Allow selecting future dates only (calendar will allow any date; we'll validate before submit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !title.trim() || !selectedDate) {
      toast({ variant: "destructive", title: "Missing fields", description: "Client, title and date are required." });
      return;
    }

    // Prevent past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sel = new Date(selectedDate);
    sel.setHours(0, 0, 0, 0);
    if (sel < today) {
      toast({ variant: "destructive", title: "Invalid date", description: "Please pick today or a future date." });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        clientName: clientName.trim(),
        title: title.trim(),
        description: description.trim(),
       date: format(selectedDate, "yyyy-MM-dd"),

        time: time || null,
        notify: true,
      };

      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to create meeting");
      }

      setClientName("");
      setTitle("");
      setDescription("");
      setSelectedDate(undefined);
      setTime("");
      toast({ title: "Meeting scheduled", description: "Reminder saved and email sent (if configured)." });
      if (onCreated) onCreated();
    } catch (err: any) {
      console.error("Create meeting error:", err);
      toast({ variant: "destructive", title: "Error", description: err.message || "Failed to schedule meeting." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">Schedule Client Meeting</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          <Input placeholder="Meeting title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full text-left">
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
               <Calendar
  mode="single"
  selected={selectedDate}
  onSelect={setSelectedDate}
  month={selectedDate || new Date()}      // ⭐ allow navigation
  fromDate={new Date()}                  // ⭐ allow today + future
  toDate={new Date(2100, 0, 1)}          // ⭐ allow far future
  disabled={{ before: new Date() }}      // ⭐ disable past only
/>

              </PopoverContent>
            </Popover>

            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="max-w-[140px]" />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
