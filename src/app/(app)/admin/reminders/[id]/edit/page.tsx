import { db } from '@/lib/db';
import { getAuth } from '@/lib/auth/get-auth';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default async function EditReminderPage({ params }: { params: { id: string } }) {
  const session = await getAuth();
  const user = session?.user;
  if (!user) return <p>Unauthorized</p>;

  const reminder = await db.reminder.findUnique({
    where: { id: params.id },
  });

  // We handle null case here so the reminder below is safely non-null
  if (!reminder) {
    return (
      <div className="p-6">
        <p className="text-red-500 font-medium">❌ Reminder Not Found</p>
      </div>
    );
  }

  async function updateReminder(formData: FormData) {
    "use server";

    const clientName = (formData.get("clientName") as string) || "";
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const date = formData.get("date") as string;
    const time = (formData.get("time") as string) || "";

    if (!date) return;

    await db.reminder.update({
      where: { id: reminder!.id },
      data: {
        clientName,
        title,
        description,
        date: new Date(date),
        time,
      },
    });
  }

  return (
    <div className="p-6 space-y-6 max-w-xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Edit Reminder</h1>

      <form action={updateReminder} className="space-y-4">

        <div>
          <label className="text-sm font-medium">Client Name</label>
          <Input
            name="clientName"
            defaultValue={reminder.clientName ?? ""}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Meeting Title</label>
          <Input
            name="title"
            defaultValue={reminder.title ?? ""}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description</label>
          <Textarea
            name="description"
            defaultValue={reminder.description ?? ""}
            className="min-h-[80px]"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Date</label>
          <Input
            name="date"
            type="date"
            defaultValue={
              reminder.date ? format(new Date(reminder.date), "yyyy-MM-dd") : ""
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium">Time</label>
          <Input
            name="time"
            type="time"
            defaultValue={reminder.time ?? ""}
          />
        </div>

        <Button type="submit" className="w-full">
          Update Reminder
        </Button>
      </form>
    </div>
  );
}
