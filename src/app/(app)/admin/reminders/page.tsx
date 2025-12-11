import { getAuth } from "@/lib/auth/get-auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MeetingScheduler } from "@/components/admin/MeetingScheduler";
import { UpcomingMeetings } from "@/components/dashboard/upcoming-meetings";
import Link from "next/link";
import { format } from "date-fns";
import { Trash, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function AdminRemindersPage() {
  const session = await getAuth();
  if (!session || !session.user) redirect("/");

  const user = session.user; // <-- FIX

  if (user.role !== "ADMIN") redirect("/dashboard");

  const reminders = await db.reminder.findMany({
    where: { userId: user.id },  // <-- NOW works
    orderBy: { date: "desc" },
    take: 50,
  });


  async function deleteReminder(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (!id) return;
    await db.reminder.delete({ where: { id } });
  }

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT SIDE PANEL */}
        <div className="lg:col-span-1 space-y-6">
          <MeetingScheduler />
          <UpcomingMeetings days={7} />
        </div>

        {/* RIGHT SIDE REMINDERS LIST */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">All Reminders</h2>
                <Link href="/admin/bin" className="underline text-sm">
                  + Add New Reminder
                </Link>
              </div>

              {reminders.length === 0 ? (
                <p className="text-muted-foreground">No reminders found.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className="flex justify-between p-3 border rounded-md bg-card"
                    >
                      <div>
                        <p className="font-medium">{rem.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {rem.clientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(rem.date), "PP")}{" "}
                          {rem.time ? `- ${rem.time}` : ""}
                        </p>
                        {rem.description && (
                          <p className="text-xs mt-1">{rem.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/admin/reminders/${rem.id}/edit`}>
                          <Button variant="outline" size="icon">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>

                        <form action={deleteReminder}>
                          <input type="hidden" name="id" value={rem.id} />
                          <Button variant="destructive" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
