import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import UserProfileClient from "./user-profile-client";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const metadata: Metadata = {
  title: "User Profile | SocialApp",
  description: "View user profile",
};

export default async function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const session = await getServerSession(authOptions);
  
  // Ensure params is awaited before using its properties
  const { userId } = await params;
  
  if (!userId) {
    notFound();
  }
  
  // Fetch the user data from the database
  const user = await prisma.user.findUnique({
    where: {
      id: userId
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bannerImage: true,
      bio: true,
      location: true,
      website: true,
      _count: {
        select: {
          posts: true,
          followedBy: true,
          following: true,
        }
      }
    },
  });
  
  if (!user) {
    notFound();
  }
  
  // Check if the current user is following this user
  let isFollowing = false;
  
  if (session?.user?.id) {
    const followRecord = await prisma.follow.findFirst({
      where: {
        followerId: session.user.id as string,
        followingId: userId,
      }
    });
    
    isFollowing = !!followRecord;
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <UserProfileClient 
        user={user} 
        isCurrentUser={session?.user?.id === userId}
        isFollowing={isFollowing}
        currentUserId={session?.user?.id}
      />
    </div>
  );
} 