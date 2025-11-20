"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, LogIn, LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

async function getAuthToken() {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return null;
  const { token } = await res.json();
  return token;
}

export function ClockWidget() {
  const [status, setStatus] = useState<"in" | "out">("out");
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);
  const [todayHours, setTodayHours] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  // Load current attendance status + today's hours
  useEffect(() => {
    async function loadStatus() {
      try {
        // 🔹 Fetch attendance status
        const statusRes = await fetch("/api/attendance/status");
        const statusData = await statusRes.json();
        setStatus(statusData.status);

        // 🔹 Fetch today's work hours
        const hrsRes = await fetch("/api/attendance/today");
        const hrsData = await hrsRes.json();
        setTodayHours(hrsData.hours);
      } catch (err) {
        console.error("Failed to fetch attendance status:", err);
      }
    }

    loadStatus();

    // Live update every 1 min if clocked in
    const t = setInterval(loadStatus, 60000);
    return () => clearInterval(t);
  }, []);

  const handleClockAction = async (type: "checkin" | "checkout") => {
    setIsLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You are not logged in.",
        });
        return;
      }

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) throw new Error(`Failed to ${type}`);

      const result = await response.json();
      const now = new Date();

      setStatus(result.status === "checked_in" ? "in" : "out");
      setLastActionTime(now);

      // Refresh today’s hours
      const hrsRes = await fetch("/api/attendance/today");
      const hrsData = await hrsRes.json();
      setTodayHours(hrsData.hours);

      toast({
        title: type === "checkin" ? "Clocked In" : "Clocked Out",
        description: `You ${
          type === "checkin" ? "clocked in" : "clocked out"
        } at ${now.toLocaleTimeString()}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Clock className="h-6 w-6" />
          Time Clock
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center gap-4">
        {status === "out" ? (
          <Button
            size="lg"
            className="w-full"
            onClick={() => handleClockAction("checkin")}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            Clock In
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            className="w-full"
            onClick={() => handleClockAction("checkout")}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Clock Out
          </Button>
        )}

        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            {status === "in"
              ? "You are currently clocked in."
              : "You are currently clocked out."}
          </p>

          <p className="text-sm text-muted-foreground">
            Today’s Hours: {todayHours.toFixed(2)} hrs
          </p>

          {lastActionTime && (
            <p className="text-xs text-muted-foreground">
              Last action: {lastActionTime.toLocaleTimeString()}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
