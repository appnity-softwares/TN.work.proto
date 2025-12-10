// /src/components/admin/ResetPasswordModal.tsx
"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function ResetPasswordModal({ user, open, onOpenChange }: { user: any; open: boolean; onOpenChange: (v: boolean) => void; }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: "Reset link sent", description: data.message || "Email dispatched" });
        onOpenChange(false);
      } else {
        toast({ variant: "destructive", title: "Error", description: data.message || "Failed" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Network error", description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Reset Link</DialogTitle>
        </DialogHeader>

        <p>Send a password reset link to <strong>{user?.name}</strong> ({user?.email || "no-email"})?</p>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSend} disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
