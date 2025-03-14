"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

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
  _count?: {
    likes: number;
    comments: number;
  };
};

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(true);
  
  // Check if the current user is following the post author
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!session?.user?.id || session.user.id === post.user.id) {
        setIsCheckingFollow(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/follow/check?targetUserId=${post.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFollowing(data.isFollowing);
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setIsCheckingFollow(false);
      }
    };
    
    checkFollowStatus();
  }, [session, post.user.id]);
  
  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
    
    // TODO: Implement actual like functionality with API
  };
  
  const handleFollowToggle = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    // Don't allow following yourself
    if (session.user.id === post.user.id) {
      return;
    }
    
    setIsLoadingFollow(true);
    
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: post.user.id,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        console.error('Failed to follow/unfollow user');
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setIsLoadingFollow(false);
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-4">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href={`/profile/${post.user.id}`} className="relative w-12 h-12 rounded-full overflow-hidden mr-3 border-2 border-white dark:border-gray-700 shadow-sm hover:opacity-90 transition-opacity">
            {post.user.image ? (
              <Image
                src={post.user.image}
                alt={post.user.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg">
                {post.user.name?.charAt(0) || "U"}
              </div>
            )}
          </Link>
          <div>
            <Link href={`/profile/${post.user.id}`} className="font-medium text-gray-900 dark:text-white hover:underline">
              {post.user.name || "Anonymous User"}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        {/* Follow/Unfollow Button */}
        {session?.user && session.user.id !== post.user.id && !isCheckingFollow && (
          <button
            onClick={handleFollowToggle}
            disabled={isLoadingFollow}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm ${
              isFollowing
                ? "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                : "bg-blue-600 text-white"
            }`}
          >
            {isFollowing ? (
              <>
                <UserMinusIcon className="h-4 w-4 mr-1" />
                <span>{isLoadingFollow ? "Loading..." : "Unfollow"}</span>
              </>
            ) : (
              <>
                <UserPlusIcon className="h-4 w-4 mr-1" />
                <span>{isLoadingFollow ? "Loading..." : "Follow"}</span>
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Post Content */}
      <div className="px-4 pb-3">
        <p className="whitespace-pre-line text-gray-800 dark:text-gray-200">{post.content}</p>
      </div>
      
      {/* Post Image (if any) */}
      {post.imageUrl && (
        <div className="relative h-80 w-full border-t border-b border-gray-100 dark:border-gray-700">
          <Image
            src={post.imageUrl}
            alt="Post image"
            fill
            className="object-cover"
          />
        </div>
      )}
      
      {/* Post Stats */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>{likeCount} likes</span>
          <span>{post._count?.comments || 0} comments</span>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
            liked 
              ? "text-red-600 dark:text-red-400" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          {liked ? (
            <HeartIconSolid className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span>Like</span>
        </button>
        
        <button className="flex items-center space-x-1 px-3 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <ChatBubbleLeftIcon className="h-5 w-5" />
          <span>Comment</span>
        </button>
        
        <button className="flex items-center space-x-1 px-3 py-1 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <ShareIcon className="h-5 w-5" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
} 