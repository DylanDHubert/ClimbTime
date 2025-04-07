"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserPlusIcon, UserMinusIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string | null;
  image: string | null;
  _count?: {
    followedBy: number;
  };
};

export default function SuggestedUsers() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [loadingFollow, setLoadingFollow] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      if (!session?.user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch("/api/users/suggested");
        
        if (!response.ok) {
          throw new Error("Failed to fetch suggested users");
        }
        
        const data = await response.json();
        setUsers(data);
        
        // Initialize following status for each user
        const initialStatus: Record<string, boolean> = {};
        const initialLoading: Record<string, boolean> = {};
        
        data.forEach((user: User) => {
          initialStatus[user.id] = false;
          initialLoading[user.id] = false;
        });
        
        setFollowingStatus(initialStatus);
        setLoadingFollow(initialLoading);
        
        // Check follow status for each user
        for (const user of data) {
          const checkResponse = await fetch(`/api/follow/check?targetUserId=${user.id}`);
          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            setFollowingStatus(prev => ({
              ...prev,
              [user.id]: checkData.isFollowing
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestedUsers();
  }, [session]);
  
  const handleFollowToggle = async (userId: string) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    setLoadingFollow(prev => ({
      ...prev,
      [userId]: true
    }));
    
    try {
      const response = await fetch('/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUserId: userId,
          action: followingStatus[userId] ? 'unfollow' : 'follow',
        }),
      });
      
      if (response.ok) {
        setFollowingStatus(prev => ({
          ...prev,
          [userId]: !prev[userId]
        }));
      } else {
        console.error('Failed to follow/unfollow user');
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    } finally {
      setLoadingFollow(prev => ({
        ...prev,
        [userId]: false
      }));
    }
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Suggested Users</h2>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (users.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 dark:text-white">Suggested Users</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Link href={`/profile/${user.id}`} className="flex items-center min-w-0 flex-1 mr-2">
              <div className="relative w-10 h-10 flex-shrink-0 rounded-full overflow-hidden mr-2">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#A4A2FF] to-[#A4A2FF]/80 text-white font-bold text-lg">
                    {user.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user._count?.followedBy || 0} followers
                </p>
              </div>
            </Link>
            <button
              onClick={() => handleFollowToggle(user.id)}
              disabled={loadingFollow[user.id]}
              className={`flex items-center justify-center flex-shrink-0 px-3 py-1 rounded-md text-sm whitespace-nowrap ${
                followingStatus[user.id]
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                  : "bg-[#FDFFA2] text-black shadow-sm hover:bg-[#FDFFA2]/80"
              }`}
            >
              {followingStatus[user.id] ? (
                <>
                  <UserMinusIcon className="h-4 w-4 mr-1" />
                  <span>{loadingFollow[user.id] ? "..." : "Unfollow"}</span>
                </>
              ) : (
                <>
                  <UserPlusIcon className="h-4 w-4 mr-1" />
                  <span>{loadingFollow[user.id] ? "..." : "Follow"}</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 