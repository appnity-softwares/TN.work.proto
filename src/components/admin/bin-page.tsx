'use client';

import { BinManagement } from "@/components/admin/bin-management";
import { MeetingScheduler } from "@/components/admin/MeetingScheduler";
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings";
import { Bin } from "@/lib/types";

interface AdminBinPageProps {
  initialBinItems: Bin[];
}

export function AdminBinPage({ initialBinItems }: AdminBinPageProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <MeetingScheduler />
          <UpcomingMeetings days={7} />
        </div>
        <div className="lg:col-span-2">
          <BinManagement initialBinItems={initialBinItems} />
        </div>
      </div>
    </div>
  );
}
