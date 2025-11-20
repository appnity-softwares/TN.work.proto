import { PageHeader } from "@/components/page-header";
import { getDiscussionPosts } from "@/lib/data";
import { DiscussionClient } from "@/components/discussion/discussion-client";
import { getSession } from "@/lib/session";

export default async function DiscussionPage() {
  const posts = await getDiscussionPosts();
  const session = await getSession();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Discussions"
        description="A place for employees to connect and discuss."
      />
      <div className="flex-1 overflow-y-auto p-6">
        <DiscussionClient initialPosts={posts} currentUser={session!.user} />
      </div>
    </div>
  );
}
