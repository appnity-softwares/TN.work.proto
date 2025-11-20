import { PageHeader } from "@/components/page-header";
import { NoticeManagement } from "@/components/admin/notice-management";
import { getNotices, getUsers } from "@/lib/data";

export default async function NoticesPage() {
  const notices = await getNotices();
  const employees = await getUsers();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Notice System"
        description="Post public announcements or private notices to employees."
      />
      <div className="flex-1 overflow-y-auto p-6">
        <NoticeManagement initialNotices={notices} employees={employees} />
      </div>
    </div>
  );
}
