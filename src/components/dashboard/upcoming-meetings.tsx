// /src/components/dashboard/upcoming-meetings.tsx
"use client";

import { useEffect, useState } from "react";
import { format, isToday, isTomorrow, differenceInHours, differenceInDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type Reminder = {
  id: string;
  clientName: string;
  title: string;
  description?: string | null;
  date: string;
  time?: string | null;
};

/* -------------------------------------------------------
   Helper → Format countdown (in hours or days)
------------------------------------------------------- */
function getCountdown(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date();

  const hours = differenceInHours(target, now);
  const days = differenceInDays(target, now);

  if (hours < 1) return "in less than 1 hour";
  if (hours < 24) return `in ${hours} hour${hours > 1 ? "s" : ""}`;
  return `in ${days} day${days > 1 ? "s" : ""}`;
}

/* -------------------------------------------------------
   Helper → Meeting urgency badge color
------------------------------------------------------- */
function getUrgencyColor(dateStr: string) {
  const target = new Date(dateStr);
  const now = new Date();

  const hours = differenceInHours(target, now);

  if (hours < 0) return "bg-gray-300";          // Past (should not happen)
  if (hours < 6) return "bg-red-600 text-white"; // Critical soon
  if (hours < 24) return "bg-orange-500 text-white"; // Within today
  return "bg-blue-600 text-white";                  // Future
}

/* -------------------------------------------------------
   Group Meetings by Sections
------------------------------------------------------- */
function groupMeetings(list: Reminder[]) {
  const groups: Record<string, Reminder[]> = {
    Today: [],
    Tomorrow: [],
    "This Week": [],
    Later: [],
  };

  list.forEach((r) => {
    const d = new Date(r.date);

    if (isToday(d)) groups.Today.push(r);
    else if (isTomorrow(d)) groups.Tomorrow.push(r);
    else if (differenceInDays(d, new Date()) <= 7) groups["This Week"].push(r);
    else groups.Later.push(r);
  });

  return groups;
}

export function UpcomingMeetings({ days = 7 }: { days?: number }) {
  const [items, setItems] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  /* -------------------------------------------------------
     Fetch upcoming meetings
  ------------------------------------------------------- */
  const loadData = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/reminders/upcoming?days=${days}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed loading meetings");

      const { upcoming } = await res.json();
      setItems(upcoming || []);
    } catch (err) {
      console.error("⛔ Upcoming meetings error:", err);
      toast({
        variant: "destructive",
        title: "Could not load meetings",
      });
    }

    setLoading(false);
  };

  // Initial load + auto-refresh every 60s
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const groups = groupMeetings(items);

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="font-semibold">Upcoming Meetings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

        {!loading && items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No meetings scheduled in the next {days} days.
          </p>
        )}

        {Object.entries(groups).map(([groupName, list]) =>
          list.length === 0 ? null : (
            <div key={groupName} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">
                {groupName}
              </h3>

              {list.map((it) => {
                const urgency = getUrgencyColor(it.date);
                const countdown = getCountdown(it.date);

                return (
                  <div
                    key={it.id}
                    className="border rounded-lg p-4 bg-white/70 hover:bg-white transition cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${it.title} with ${it.clientName} on ${format(
                          new Date(it.date),
                          "PPP"
                        )}${it.time ? ` at ${it.time}` : ""}`
                      );
                      toast({ title: "Copied meeting details" });
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{it.title}</p>
                        <p className="text-sm text-muted-foreground">{it.clientName}</p>

                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(it.date), "PPP")}
                          {it.time ? ` • ${it.time}` : ""}
                        </p>

                        <p className="text-xs mt-1 italic">
                          {countdown}
                        </p>

                        {it.description && (
                          <p className="text-sm mt-2">{it.description}</p>
                        )}
                      </div>

                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${urgency}`}
                      >
                        {groupName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
}
