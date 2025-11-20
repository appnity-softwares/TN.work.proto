"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function MyHoursPage() {
  const [todayHours, setTodayHours] = useState(0);
  const [weekly, setWeekly] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    async function load() {
      try {
        // Today
        const t = await fetch("/api/attendance/today").then((r) => r.json());
        setTodayHours(t.hours);

        // Weekly
        const w = await fetch("/api/attendance/weekly").then((r) => r.json());
        setWeekly(w.records || w.data || []);

        // Monthly
        const m = await fetch("/api/attendance/monthly").then((r) => r.json());
        setMonthly(m.data || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    }

    load();
  }, []);

  const handleExport = async (type: "pdf" | "csv") => {
    try {
      toast({ title: `Generating ${type.toUpperCase()}...` });

      const res = await fetch(`/api/attendance/export/${type}`);
      if (!res.ok) throw new Error("Failed to export file");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = type === "pdf" ? "attendance.pdf" : "attendance.csv";
      link.click();

      toast({
        title: `${type.toUpperCase()} Download Ready`,
        description: `Your attendance ${type.toUpperCase()} has been downloaded.`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: err instanceof Error ? err.message : "Unknown error.",
      });
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading your hours...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h1 className="text-3xl font-bold font-headline">My Hours</h1>

        {/* Export Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </motion.div>

      {/* Today's Hours */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-headline">Today's Work Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{todayHours.toFixed(2)} hrs</p>
            <p className="text-sm text-muted-foreground mt-2">
              {format(new Date(), "EEEE, MMMM d")}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-headline">Weekly Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weekly.map((w, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b py-2 last:border-none"
                >
                  <span>{w.label || w.date}</span>
                  <span className="font-semibold">{w.hours?.toFixed(2)} hrs</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-headline">Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthly.map((m, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b py-2 last:border-none"
                >
                  <span>{m.date}</span>
                  <span className="font-semibold">{m.hours?.toFixed(2)} hrs</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
