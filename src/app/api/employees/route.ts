import { db as prisma } from "@/lib/db";

export async function GET() {
  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" }
  });

  return Response.json({ employees });
}
