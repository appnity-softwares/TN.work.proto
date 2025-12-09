import { db as prisma } from "@/lib/db";
import { checkAdmin } from "@/lib/auth/checkAdmin";

export async function DELETE(req: Request) {
  const authUser = (req as any).user;
  checkAdmin(authUser);

  const { id } = await req.json();

  await prisma.user.delete({ where: { id } });

  return Response.json({ success: true });
}
