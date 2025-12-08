"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Notice, User } from "@/lib/types";
import { Bell, Loader2, Lock, PlusCircle, Trash, Users } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "../ui/badge";
import { NoticeType } from "@prisma/client";

interface NoticeManagementProps {
  initialNotices: Notice[];
  employees: User[];
}

async function getAuthToken() {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return null;
  const { token } = await res.json();
  return token;
}

export function NoticeManagement({ initialNotices, employees }: NoticeManagementProps) {
  const [notices, setNotices] = useState(initialNotices);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreateNotice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const message = formData.get("content") as string;
    const targetUserId = formData.get("employeeId") as string;
    const type = targetUserId === "public" ? NoticeType.PUBLIC : NoticeType.PRIVATE;

    const payload = {
      title,
      message,
      type,
      targetUserId: type === NoticeType.PRIVATE ? targetUserId : null,
    };

    try {
      const token = await getAuthToken();
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You are not logged in.",
        });
        return;
      }

      const response = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to post notice.");

      const { notice: newNotice } = await response.json();
      setNotices([newNotice, ...notices]);
      toast({ title: "Notice Posted", description: "The new notice has been created successfully." });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Could not post notice.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notices?id=${id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: result.error || "Could not delete notice",
        });
        return;
      }

      setNotices((prev) => prev.filter((n) => n.id !== id));

      toast({
        variant: "destructive",
        title: "Notice Deleted",
        description: "The notice has been successfully deleted.",
      });
    } catch (error) {
      console.error("❌ Delete Notice Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while deleting the notice.",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* CREATE NOTICE FORM */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <PlusCircle className="h-6 w-6" /> Create Notice
          </CardTitle>
          <CardDescription>Fill out the form to post a new notice.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleCreateNotice}>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea id="content" name="content" required disabled={isSubmitting} />
            </div>
            <div>
              <Label htmlFor="employeeId">Audience</Label>
              <Select name="employeeId" defaultValue="public" disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (All Employees)</SelectItem>
                  {employees.filter((e) => e.role !== "ADMIN").map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Post Notice"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* NOTICE LIST */}
      <NoticeList notices={notices} onDelete={handleDelete} />
    </div>
  );
}

// NoticeList Component
interface NoticeListProps {
  notices: Notice[];
  onDelete: (id: string) => void;
}

function NoticeList({ notices, onDelete }: NoticeListProps) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
          <Bell className="h-6 w-6" /> Posted Notices
        </CardTitle>
        <CardDescription>A list of all created notices.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Audience</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right"></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {notices.map((notice) => (
                <TableRow key={notice.id}>
                    <TableCell className="font-medium">
                        <p>{notice.title}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">{format(new Date(notice.createdAt), "MMM d, yyyy")}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                    <Badge
                        variant={notice.type === "PUBLIC" ? "secondary" : "outline"}
                    >
                        {notice.type === "PUBLIC" ? <Users className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                        {notice.type === "PUBLIC" ? "Public" : "Private"}
                    </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(notice.createdAt), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(notice.id)}
                    >
                        <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
