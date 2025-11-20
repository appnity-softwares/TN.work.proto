import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Lock } from "lucide-react";
import { Notice } from "@/lib/types";
import { format } from "date-fns";

interface NoticeBoardProps {
  notices: Notice[];
}

export function NoticeBoard({ notices }: NoticeBoardProps) {
  return (
    <Card className="glass h-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notice Board
        </CardTitle>
        <CardDescription>
          Announcements and updates from the admin team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
          <div className="space-y-4">
            {notices.length > 0 ? (
              notices.map((notice) => (
                <div key={notice.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{notice.title}</h4>
                    {notice.type === 'PRIVATE' && (
                      <Lock className="h-4 w-4 text-muted-foreground" title="Private Notice" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notice.message}
                  </p>
                   <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(notice.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">
                No new notices.
              </p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
