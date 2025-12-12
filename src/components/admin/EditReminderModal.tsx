"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// -----------------------------
//  PROPS — FIXED TYPES
// -----------------------------
interface EditReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminderId: string | null;
  onUpdated?: () => void;
}

interface ReminderData {
  id: string;
  clientName: string | null;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
}

export function EditReminderModal({
  open,
  onOpenChange,
  reminderId,
  onUpdated,
}: EditReminderModalProps) {
  const [loading, setLoading] = useState(false);
  const [rem, setRem] = useState<ReminderData | null>(null);

  const [clientName, setClientName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [notify, setNotify] = useState(true);

  const { toast } = useToast();

  // -----------------------------
  // FETCH REMINDER
  // -----------------------------
  useEffect(() => {
    if (!open || !reminderId) return;

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/reminders/${reminderId}`);
        if (!res.ok) throw new Error("Failed to fetch reminder");

        const json = await res.json();
        const r: ReminderData = json.reminder;

        setRem(r);
        setClientName(r.clientName || "");
        setTitle(r.title || "");
        setDescription(r.description || "");
        setDate(r.date ? new Date(r.date) : undefined);
        setTime(r.time || "");
      } catch (err) {
        toast({ variant: "destructive", title: "Failed to load reminder" });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, reminderId, toast]);

  // -----------------------------
  // SAVE CHANGES
  // -----------------------------
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!reminderId) return;

    const payload = {
      clientName,
      title,
      description,
      date: date ? date.toISOString() : undefined,
      time,
      notify,
    };

    setLoading(true);

    try {
      const res = await fetch(`/api/reminders/${reminderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast({ title: "Reminder updated" });
      onOpenChange(false);
      onUpdated?.();
    } catch (err) {
      toast({ variant: "destructive", title: "Update failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Reminder</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-3">
          <Input
            value={clientName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setClientName(e.target.value)
            }
            placeholder="Client name"
            required
          />

          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(e.target.value)
            }
            placeholder="Title"
            required
          />

          <Textarea
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDescription(e.target.value)
            }
            placeholder="Description"
          />

          <div className="flex gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full text-left">
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  month={date || new Date()}
                  fromDate={new Date()}
                  toDate={new Date(2100, 0, 1)}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>

            <Input
              type="time"
              value={time}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTime(e.target.value)
              }
              className="max-w-[140px]"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="notify"
              type="checkbox"
              checked={notify}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNotify(e.target.checked)
              }
            />
            <label htmlFor="notify">Notify via email</label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
