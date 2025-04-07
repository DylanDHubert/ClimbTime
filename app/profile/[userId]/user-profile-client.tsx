"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MapPinIcon, GlobeAltIcon, UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import PostCard from "@/app/components/post/PostCard";

type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  bannerImage: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  _count: {
    posts: number;
    followedBy: number;
    following: number;
  };
};

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
  isLiked?: boolean;
};

interface UserProfileClientProps {
  user: UserProfile;
  isCurrentUser: boolean;
  isFollowing: boolean;
  currentUserId: string | undefined;
}

export default function UserProfileClient({ 
  user, 
  isCurrentUser, 
  isFollowing: initialIsFollowing,
  currentUserId
}: UserProfileClientProps) {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(user._count.followedBy);
  const [isLoading, setIsLoading] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  
  // Fetch user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user.id) return;
      
      setIsLoadingPosts(true);
      try {
        const response = await fetch(`/api/posts/user/${user.id}`);
        if (response.ok) {
          const posts = await response.json();
          setUserPosts(posts);
        } else {
          console.error('Failed to fetch user posts');
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };
    
    fetchUserPosts();
  }, [user.id]);
  
  const handleFollowToggle = async () => {
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: user.id,
          action: isFollowing ? 'unfollow' : 'follow',
        }),
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
        router.refresh(); // Refresh the page to update follower counts
      } else {
        console.error('Failed to follow/unfollow user');
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 relative">
          {user.bannerImage ? (
            <Image
              src={user.bannerImage}
              alt="Profile banner"
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          )}
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-4 border-4 border-white dark:border-gray-800 rounded-full overflow-hidden h-32 w-32 bg-white dark:bg-gray-800">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-4xl font-bold">
                {user.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          
          {/* Follow/Edit Button (Small) */}
          {!isCurrentUser && currentUserId && (
            <button 
              onClick={handleFollowToggle}
              disabled={isLoading}
              className={`absolute top-4 right-4 p-2 rounded-full flex items-center space-x-1 ${
                isFollowing 
                  ? 'bg-gray-800 bg-opacity-70 hover:bg-opacity-90' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              {isFollowing ? (
                <UserMinusIcon className="h-5 w-5" />
              ) : (
                <UserPlusIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
        
        {/* Profile Info */}
        <div className="pt-20 px-4 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold dark:text-white">{user.name || "User"}</h1>
              {!isCurrentUser && <p className="text-gray-500 dark:text-gray-400">@{user.id.substring(0, 8)}</p>}
            </div>
            
            {!isCurrentUser && currentUserId && (
              <button 
                onClick={handleFollowToggle}
                disabled={isLoading}
                className={`px-4 py-2 rounded-md font-medium ${
                  isFollowing 
                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600' 
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
                }`}
              >
                {isLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
            
            {isCurrentUser && (
              <Link 
                href="/profile"
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md font-medium"
              >
                Edit Profile
              </Link>
            )}
          </div>
          
          {user.bio && (
            <p className="mt-3 text-gray-700 dark:text-gray-300">{user.bio}</p>
          )}
          
          <div className="mt-3 space-y-1">
            {user.location && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>{user.location}</span>
              </div>
            )}
            
            {user.website && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                <Link 
                  href={user.website.startsWith('http') ? user.website : `https://${user.website}`} 
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  {user.website.replace(/^https?:\/\//, '')}
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex space-x-4">
            <div className="text-center">
              <span className="block font-bold dark:text-white">{user._count.posts}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
            </div>
            <div className="text-center">
              <span className="block font-bold dark:text-white">{followerCount}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
            </div>
            <div className="text-center">
              <span className="block font-bold dark:text-white">{user._count.following}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4 dark:text-white">{isCurrentUser ? 'Your' : 'User\'s'} Posts</h2>
        
        {isLoadingPosts ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isCurrentUser ? "You haven't" : "This user hasn't"} created any posts yet.
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
} 