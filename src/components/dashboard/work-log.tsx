"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BookUser, Loader2 } from "lucide-react";
import { WorkLog as WorkLogType } from "@/lib/types";
import { format } from "date-fns";

interface WorkLogProps {
  initialLogs: WorkLogType[];
  userId: string;
}

async function getAuthToken() {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return null;
    const { token } = await res.json();
    return token;
}


export function WorkLog({ initialLogs, userId }: WorkLogProps) {
  const [logs, setLogs] = useState<WorkLogType[]>(initialLogs);
  const [newLog, setNewLog] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLog.trim() === "") {
      toast({
        variant: "destructive",
        title: "Empty Log",
        description: "Cannot submit an empty work log.",
      });
      return;
    }
    setIsSubmitting(true);

    try {
        const token = await getAuthToken();
        if (!token) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You are not logged in." });
            return;
        }

        const response = await fetch('/api/work', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ description: newLog }),
        });

        if (!response.ok) {
            throw new Error('Failed to submit work log.');
        }

        const { log: newLogEntry } = await response.json();
        
        setLogs([newLogEntry, ...logs]);
        setNewLog("");
        toast({
            title: "Log Submitted",
            description: "Your work log has been successfully saved.",
        });

    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: error instanceof Error ? error.message : "Could not save log.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <BookUser className="h-6 w-6" />
          Daily Work Log
        </CardTitle>
        <CardDescription>
          Detail your tasks and accomplishments for the day.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            placeholder="What did you work on today?"
            value={newLog}
            onChange={(e) => setNewLog(e.target.value)}
            rows={4}
            disabled={isSubmitting}
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Log"}
          </Button>
        </CardFooter>
      </form>
      <Separator className="my-4" />
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">Recent Logs</h3>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{log.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(log.date), "Pp")}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No logs submitted yet today.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
