import { PageHeader } from "@/components/page-header";
import { ClockWidget } from "@/components/dashboard/clock-widget";
import { WorkLog } from "@/components/dashboard/work-log";
import { NoticeBoard } from "@/components/dashboard/notice-board";
import { getNotices, getWorkLogsForUser } from "@/lib/data";
import { getSession } from "@/lib/session";
import { User } from "@/lib/types";
import { NoticeType } from "@prisma/client";

export default async function DashboardPage() {
  const session = await getSession();
  const user = session!.user as User;

  const workLogs = await getWorkLogsForUser(user.id);
  const allNotices = await getNotices();
  
  const relevantNotices = allNotices.filter(n => n.type === NoticeType.PUBLIC || n.targetUserId === user.id);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="My Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ClockWidget />
          </div>
          <div className="lg:col-span-2">
            <NoticeBoard notices={relevantNotices} />
          </div>
        </div>
        <WorkLog initialLogs={workLogs} userId={user.id} />
      </div>
    </div>
  );
}
