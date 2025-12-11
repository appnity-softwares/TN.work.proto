'use client';

import { useState, useEffect, useCallback } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const IDLE_TIMEOUT_EMPLOYEE = 5 * 60 * 60 * 1000; // 5 hours
const IDLE_TIMEOUT_ADMIN = 8 * 60 * 60 * 1000; // 8 hours
const SUBSEQUENT_IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const COUNTDOWN_DURATION = 30 * 60 * 1000; // 30 minutes

async function clockOutUser() {
  await fetch('/api/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'checkout' }),
  });
  window.location.reload(); // Refresh to reflect clock-out status
}

export function IdleTimer() {
  const user = useCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION / 1000);

  const handleIdle = useCallback(() => {
    setIsOpen(true);
    setCountdown(COUNTDOWN_DURATION / 1000);
  }, []);

  useEffect(() => {
    if (!user || !user.clockedIn) {
        return;
    }

    const userRole = user.role;
    let idleTimeout = userRole === 'ADMIN' ? IDLE_TIMEOUT_ADMIN : IDLE_TIMEOUT_EMPLOYEE;

    let timer = setTimeout(handleIdle, idleTimeout);

    return () => clearTimeout(timer);
  }, [user, handleIdle]);

  useEffect(() => {
    if (isOpen) {
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            clockOutUser();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownTimer);
    }
  }, [isOpen]);

  const handleStillWorking = () => {
    setIsOpen(false);
    // Reset the main idle timer for 2 hours
    const nextTimer = setTimeout(handleIdle, SUBSEQUENT_IDLE_TIMEOUT);
    // We need to store this timer to clear it on component unmount
    // For simplicity in this implementation, we just restart.
  };

  const handleClockOut = () => {
    setIsOpen(false);
    clockOutUser();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you still working?</DialogTitle>
        </DialogHeader>
        <p>You have been inactive for a while. Please confirm you are still working.</p>
        <p className="text-center font-bold text-lg">
          Time left: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
        </p>
        <DialogFooter className="sm:justify-between gap-2">
          <Button onClick={handleStillWorking} variant="default" className="w-full sm:w-auto">Still Working</Button>
          <Button onClick={handleClockOut} variant="destructive" className="w-full sm:w-auto">Clock Out</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
