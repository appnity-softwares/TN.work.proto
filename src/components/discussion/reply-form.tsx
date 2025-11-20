"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ReplyFormProps {
  postId: string;
  onReplyAdded: (newReply: any) => void;
}

async function getAuthToken() {
    const res = await fetch('/api/auth/session');
    if (!res.ok) return null;
    const { token } = await res.json();
    return token;
}

export function ReplyForm({ postId, onReplyAdded }: ReplyFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (content.trim() === "") return;
    setIsSubmitting(true);

    try {
        const token = await getAuthToken();
        if (!token) {
            toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in to reply." });
            setIsSubmitting(false);
            return;
        }
      const response = await fetch(`/api/discussion/${postId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post reply.");
      }
      const { reply: newReply } = await response.json();
      onReplyAdded(newReply);
      setContent("");
       toast({
        title: "Reply Posted",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Could not post reply.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="grid gap-2">
        <Textarea
          placeholder="Write your reply..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting && <Loader2 className="animate-spin mr-2" />}
          Post Reply
        </Button>
      </div>
    </form>
  );
}