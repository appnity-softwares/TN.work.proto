import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getErrorLogs } from "@/lib/data";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default async function ErrorLogPage() {
  const errorLogs = await getErrorLogs();

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Error Logs" description="Review system and application errors." />
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              System Error Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.timestamp), "Pp")}</TableCell>
                    <TableCell>
                      <Badge variant={log.type === "API" ? "destructive" : "secondary"}>
                        {log.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{log.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
