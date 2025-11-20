"use client"

import { useState } from 'react'
import { DiscussionReply, SessionUser } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { placeholderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from "date-fns";
import { ReplyForm } from './reply-form';

interface ReplyListProps {
    initialReplies: DiscussionReply[];
    currentUser: SessionUser;
    postId: string;
}

export function ReplyList({ initialReplies, currentUser, postId }: ReplyListProps) {
    const [replies, setReplies] = useState(initialReplies);
    const userAvatar = placeholderImages.find((p) => p.id === "user-avatar");

    const handleReplyAdded = (newReply: DiscussionReply) => {
        setReplies(currentReplies => [...currentReplies, newReply]);
    }

    return (
        <Card className="mt-6 glass">
          <CardHeader>
            <CardTitle className="font-headline">Replies ({replies.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {replies.map((reply) => (
                <div key={reply.id} className="flex items-start gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={userAvatar?.imageUrl} alt={reply.user.name} />
                    <AvatarFallback>{reply.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{reply.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-foreground/90">{reply.content}</p>
                  </div>
                </div>
              ))}
               {replies.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No replies yet. Be the first to respond!
                </p>
              )}
            </div>

            <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Join the discussion</h3>
                <ReplyForm postId={postId} onReplyAdded={handleReplyAdded} />
            </div>
          </CardContent>
        </Card>
    )
}
