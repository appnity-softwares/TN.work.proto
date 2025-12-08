
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { DetailsForm } from "./details-form";
import { db as prisma } from "@/lib/db";

export default async function MyDetailsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  const user = await (prisma.user.findUnique as any)({
    where: { id: session.user.id },
    select: {
      id: true,
      meta: true,
    },
  });

  // Check if the user has already submitted their details
  if (user?.meta?.detailsSubmitted) {
    return (
      <div>
        <h1 className="text-2xl font-bold">My Details</h1>
        <p className="text-muted-foreground">
          You have already submitted your details. If you need to make changes,
          please contact an administrator.
        </p>
        {/* Display submitted details here */}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">My Details</h1>
      <p className="text-muted-foreground">
        Please fill out your details below. You can only do this once.
      </p>
      <div className="mt-8">
        <DetailsForm user={session.user} />
      </div>
    </div>
  );
}
