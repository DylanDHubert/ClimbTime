import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import PostFeed from "@/app/components/post/PostFeed";
import SuggestedUsers from "@/app/components/user/SuggestedUsers";
import ExploreClient from "./explore-client";

export const metadata: Metadata = {
  title: "Explore | SocialApp",
  description: "Discover new content and users",
};

export default async function ExplorePage() {
  const session = await getServerSession(authOptions);
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Explore</h1>
      </div>
      
      <ExploreClient />
      
      {session?.user && (
        <div className="mb-6">
          <SuggestedUsers />
        </div>
      )}
      
      <PostFeed defaultFeedType="all" />
    </div>
  );
} 