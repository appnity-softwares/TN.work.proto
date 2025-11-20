import prisma from "@/lib/db";
import { checkAdmin } from "@/lib/auth/checkAdmin";

export async function GET(req: Request) {
  const authUser = (req as any).user;
  checkAdmin(authUser);

  const projects = await prisma.project.findMany({
    include: { users: true }
  });

  return Response.json({ projects });
}
