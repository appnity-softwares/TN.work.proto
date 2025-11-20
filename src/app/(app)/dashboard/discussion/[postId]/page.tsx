import { getDiscussionPost } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { placeholderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from "date-fns";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { ReplyList } from "@/components/discussion/reply-list";

export default async function PostPage(
  props: { params: Promise<{ postId: string }> }
) {
  const { postId } = await props.params;

  const post = await getDiscussionPost(postId);
  const session = await getSession();

  if (!post) {
    notFound();
  }

  const userAvatar = placeholderImages.find((p) => p.id === "user-avatar");

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Discussion" />
      <div className="flex-1 overflow-y-auto p-6">
        <Card className="glass">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">{post.title}</CardTitle>
            <div className="flex items-center gap-3 pt-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar?.imageUrl} alt={post.user.name} />
                <AvatarFallback>{post.user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{post.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  Posted {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{post.content}</p>
          </CardContent>
        </Card>

        <ReplyList
          initialReplies={post.replies}
          currentUser={session!.user}
          postId={post.id}
        />
      </div>
    </div>
  );
}
