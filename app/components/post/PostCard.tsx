"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, ShareIcon as ShareIconSolid, ChatBubbleLeftIcon as ChatBubbleLeftIconSolid } from "@heroicons/react/24/solid";
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
    shares?: number;
  };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: User;
};

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [likeCount, setLikeCount] = useState(post._count?.likes || 0);
  const [shareCount, setShareCount] = useState(post._count?.shares || 0);
  const [commentCount, setCommentCount] = useState(post._count?.comments || 0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [isCheckingFollow, setIsCheckingFollow] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Check like status and count when component mounts
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/posts/like?postId=${post.id}`);
        if (response.ok) {
          const data = await response.json();
          setLiked(data.isLiked);
          setLikeCount(data.likeCount);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    };
    
    checkLikeStatus();
  }, [post.id, session?.user?.id]);
  
  // Check share status and count when component mounts
  useEffect(() => {
    const checkShareStatus = async () => {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/posts/share?postId=${post.id}`);
        if (response.ok) {
          const data = await response.json();
          setShared(data.isShared);
          setShareCount(data.shareCount);
        }
      } catch (error) {
        console.error("Error checking share status:", error);
      }
    };
    
    checkShareStatus();
  }, [post.id, session?.user?.id]);
  
  // Load comments when the comment section is opened
  useEffect(() => {
    if (!showComments) return;
    
    const loadComments = async () => {
      try {
        const response = await fetch(`/api/posts/comment?postId=${post.id}`);
        if (response.ok) {
          const data = await response.json();
          setComments(data);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };
    
    loadComments();
  }, [post.id, showComments]);
  
  const handleLike = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    // Store current state before updating
    const wasLiked = liked;
    
    // Optimistic UI update
    setLiked(prevLiked => !prevLiked);
    setLikeCount(prevCount => wasLiked ? prevCount - 1 : prevCount + 1);
    
    try {
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update state based on actual server response
        setLiked(data.liked);
      } else {
        // Revert optimistic update on failure
        setLiked(wasLiked);
        setLikeCount(prevCount => wasLiked ? prevCount + 1 : prevCount - 1);
        console.error('Failed to like/unlike post');
      }
    } catch (error) {
      // Revert optimistic update on error
      setLiked(wasLiked);
      setLikeCount(prevCount => wasLiked ? prevCount + 1 : prevCount - 1);
      console.error('Error liking/unliking post:', error);
    }
  };
  
  const handleShare = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    // Store current state before updating
    const wasShared = shared;
    
    // Optimistic UI update
    setShared(prevShared => !prevShared);
    setShareCount(prevCount => wasShared ? prevCount - 1 : prevCount + 1);
    
    try {
      const response = await fetch('/api/posts/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: post.id }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update state based on actual server response
        setShared(data.shared);
      } else {
        // Revert optimistic update on failure
        setShared(wasShared);
        setShareCount(prevCount => wasShared ? prevCount + 1 : prevCount - 1);
        console.error('Failed to share/unshare post');
      }
    } catch (error) {
      // Revert optimistic update on error
      setShared(wasShared);
      setShareCount(prevCount => wasShared ? prevCount + 1 : prevCount - 1);
      console.error('Error sharing/unsharing post:', error);
    }
  };
  
  const handleComment = () => {
    setShowComments(!showComments);
    if (!showComments && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  };
  
  const submitComment = async () => {
    if (!session?.user || !newComment.trim()) {
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: post.id,
          content: newComment.trim(),
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Add the new comment to the list and increment count
        setComments(prevComments => [data.comment, ...prevComments]);
        setCommentCount(prevCount => prevCount + 1);
        setNewComment('');
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
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
                ? "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
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
          <span>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</span>
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
          <span>{shareCount} {shareCount === 1 ? 'share' : 'shares'}</span>
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
            liked 
              ? "text-red-600 dark:text-red-400" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {liked ? (
            <HeartIconSolid className="h-5 w-5" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span>Like</span>
        </button>
        
        <button 
          onClick={handleComment}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
            showComments 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {showComments ? (
            <ChatBubbleLeftIconSolid className="h-5 w-5" />
          ) : (
            <ChatBubbleLeftIcon className="h-5 w-5" />
          )}
          <span>Comment</span>
        </button>
        
        <button 
          onClick={handleShare}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md ${
            shared 
              ? "text-green-600 dark:text-green-400" 
              : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {shared ? (
            <ShareIconSolid className="h-5 w-5" />
          ) : (
            <ShareIcon className="h-5 w-5" />
          )}
          <span>Share</span>
        </button>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          {/* Comment Input */}
          {session?.user && (
            <div className="flex items-center mb-4">
              <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-sm">
                    {session.user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <input
                ref={commentInputRef}
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 py-2 px-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !isSubmittingComment) {
                    e.preventDefault();
                    submitComment();
                  }
                }}
              />
              <button
                onClick={submitComment}
                disabled={isSubmittingComment || !newComment.trim()}
                className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isSubmittingComment ? "Posting..." : "Post"}
              </button>
            </div>
          )}
          
          {/* Comments List */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    {comment.user.image ? (
                      <Image
                        src={comment.user.image}
                        alt={comment.user.name || "User"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-sm">
                        {comment.user.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <Link href={`/profile/${comment.user.id}`} className="font-medium text-gray-900 dark:text-white hover:underline">
                        {comment.user.name || "Anonymous User"}
                      </Link>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 