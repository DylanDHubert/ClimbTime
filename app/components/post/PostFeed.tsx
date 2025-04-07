"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PostCard from "./PostCard";

type User = {
  id: string;
  name: string | null;
  image: string | null;
};

type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: User;
  _count: {
    likes: number;
    comments: number;
  };
};

type FeedType = "all" | "following";

interface PostFeedProps {
  defaultFeedType?: FeedType;
}

export default function PostFeed({ defaultFeedType = "all" }: PostFeedProps) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<FeedType>(defaultFeedType);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const url = feedType === "following" 
          ? "/api/posts?feedType=following" 
          : "/api/posts";
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }
        
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [feedType]);

  const handleFeedTypeChange = (type: FeedType) => {
    setFeedType(type);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      {session?.user && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleFeedTypeChange("all")}
              className={`px-4 py-2 rounded-md font-medium ${
                feedType === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              All Posts
            </button>
            <button
              onClick={() => handleFeedTypeChange("following")}
              className={`px-4 py-2 rounded-md font-medium ${
                feedType === "following"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              Following
            </button>
          </div>
        </div>
      )}

      {posts.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">
            {feedType === "following" 
              ? "No posts from people you follow" 
              : "No posts yet"}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {feedType === "following" 
              ? "Follow more people to see their posts here!" 
              : "Be the first to share something with the community!"}
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))
      )}
    </div>
  );
} 