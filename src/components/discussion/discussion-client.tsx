"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DiscussionPost, SessionUser } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { Loader2, MessageSquare, PlusCircle } from "lucide-react";

interface DiscussionClientProps {
  initialPosts: DiscussionPost[];
  currentUser: SessionUser;
}

export function DiscussionClient({ initialPosts, currentUser }: DiscussionClientProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    try {
      const response = await fetch("/api/discussion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to create post.");
      }

      const { post: newPost } = await response.json();
      
      // Manually construct the new post with user and empty replies
      const postWithUser = { ...newPost, user: currentUser, replies: [] };

      setPosts([postWithUser, ...posts]);
      toast({
        title: "Post Created",
        description: "Your new discussion post has been added.",
      });
      setOpen(false);
       (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Could not create post.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            All Discussions
          </CardTitle>
          <CardDescription>Click on a post to view the full discussion and reply.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
              <DialogDescription>
                Fill in the details for your new post.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePost}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required disabled={isSubmitting} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    required
                    rows={6}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="animate-spin mr-2" />}
                  Create Post
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Topic</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Replies</TableHead>
              <TableHead className="text-right">Last Activity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post) => (
              <TableRow key={post.id} className="cursor-pointer">
                <TableCell className="font-medium">
                  <Link
                    href={`/dashboard/discussion/${post.id}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </Link>
                </TableCell>
                <TableCell>{post.user.name}</TableCell>
                <TableCell>{post.replies?.length ?? 0}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
