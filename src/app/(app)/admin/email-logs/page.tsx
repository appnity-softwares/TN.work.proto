import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { format } from "date-fns";

export default async function EmailLogsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { name: true, email: true } }
    }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Email Logs</h1>
      <p className="text-muted-foreground">See all outgoing system emails.</p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Sent Emails</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No logs found.
                  </TableCell>
                </TableRow>
              )}

              {logs.map((log) => {
                const rec = (log.recipients as any[]) || [];

                return (
                  <TableRow key={log.id}>
                    <TableCell>{format(log.createdAt, "dd MMM yyyy HH:mm")}</TableCell>
                    <TableCell>{log.sender?.name || "Unknown"}</TableCell>
                    <TableCell>
                      {rec.map((r) => r.email).join(", ")}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                    <TableCell>
                      {log.status === "SUCCESS" && <span className="text-green-600 font-semibold">Success</span>}
                      {log.status === "PARTIAL" && <span className="text-yellow-600 font-semibold">Partial</span>}
                      {log.status === "FAILED" && <span className="text-red-600 font-semibold">Failed</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
