"use client";

import { useState } from "react";
import { Session } from "next-auth";
import Image from "next/image";
import { PencilIcon, MapPinIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import EditProfileModal from "../components/profile/EditProfileModal";
import Link from "next/link";
import PostCard from "@/app/components/post/PostCard";

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

interface ProfileClientProps {
  session: Session & {
    user: {
      bio?: string | null;
      location?: string | null;
      website?: string | null;
      bannerImage?: string | null;
      _count?: {
        posts: number;
        followedBy: number;
        following: number;
      };
    }
  };
  userPosts: Post[];
}

export default function ProfileClient({ session, userPosts }: ProfileClientProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
        {/* Cover Photo */}
        <div className="h-48 relative">
          {session.user?.bannerImage ? (
            <Image
              src={session.user.bannerImage}
              alt="Profile banner"
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
          )}
          
          {/* Profile Picture */}
          <div className="absolute -bottom-16 left-4 border-4 border-white dark:border-gray-800 rounded-full overflow-hidden h-32 w-32 bg-white dark:bg-gray-800">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user?.name || "User"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-4xl font-bold">
                {session.user?.name?.charAt(0) || "U"}
              </div>
            )}
          </div>
          
          {/* Edit Profile Button (Small) */}
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Profile Info */}
        <div className="pt-20 px-4 pb-4">
          <h1 className="text-2xl font-bold dark:text-white">{session.user?.name || "User"}</h1>
          <p className="text-gray-500 dark:text-gray-400">{session.user?.email}</p>
          
          {session.user?.bio && (
            <p className="mt-3 text-gray-700 dark:text-gray-300">{session.user.bio}</p>
          )}
          
          <div className="mt-3 space-y-1">
            {session.user?.location && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span>{session.user.location}</span>
              </div>
            )}
            
            {session.user?.website && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <GlobeAltIcon className="h-4 w-4 mr-1" />
                <Link 
                  href={session.user.website.startsWith('http') ? session.user.website : `https://${session.user.website}`} 
                  target="_blank"
                  className="text-blue-500 hover:underline"
                >
                  {session.user.website.replace(/^https?:\/\//, '')}
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex space-x-4">
            <div className="text-center">
              <span className="block font-bold dark:text-white">{session.user?._count?.posts || 0}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
            </div>
            <div className="text-center">
              <span className="block font-bold dark:text-white">{session.user?._count?.followedBy || 0}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
            </div>
            <div className="text-center">
              <span className="block font-bold dark:text-white">{session.user?._count?.following || 0}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-md"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4 dark:text-white">Your Posts</h2>
        
        {userPosts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            You haven&apos;t created any posts yet.
          </div>
        ) : (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        session={session} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />
    </>
  );
} 