import { db as prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/auth/checkAdmin";

export async function PUT(req: Request) {
  const authUser = (req as any).user;
  checkAdmin(authUser);

  const { id, name, status } = await req.json();

  const updated = await prisma.user.update({
    where: { id },
    data: { name, status }
  });

  return Response.json({ success: true, updated });
}
