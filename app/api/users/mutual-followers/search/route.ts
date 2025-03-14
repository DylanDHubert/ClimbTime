import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

type FollowRecord = {
  followerId: string;
};

type FollowingRecord = {
  followingId: string;
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    
    console.log("Mutual followers search query:", query);
    console.log("Current user ID:", session.user.id);
    
    if (!query.trim()) {
      return NextResponse.json([]);
    }
    
    // First, let's check who follows the current user
    const usersWhoFollowMe = await prisma.follow.findMany({
      where: {
        followingId: session.user.id,
      },
      select: {
        followerId: true,
      },
    });
    
    console.log("Users who follow me:", usersWhoFollowMe.length);
    
    // Then, let's check who the current user follows
    const usersIFollow = await prisma.follow.findMany({
      where: {
        followerId: session.user.id,
      },
      select: {
        followingId: true,
      },
    });
    
    console.log("Users I follow:", usersIFollow.length);
    
    // Get the IDs of users who follow me
    const followerIds = usersWhoFollowMe.map((follow: FollowRecord) => follow.followerId);
    
    // Get the IDs of users I follow
    const followingIds = usersIFollow.map((follow: FollowingRecord) => follow.followingId);
    
    // Find the intersection (mutual followers)
    const mutualIds = followerIds.filter((id: string) => followingIds.includes(id));
    
    console.log("Mutual follower IDs:", mutualIds.length);
    
    // Find users who match the search query and are mutual followers
    const mutualFollowers = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              in: mutualIds,
            },
          },
          {
            OR: [
              {
                name: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        image: true,
      },
      take: 10,
    });
    
    console.log("Mutual followers found:", mutualFollowers.length);
    
    return NextResponse.json(mutualFollowers);
  } catch (error) {
    console.error("Error searching mutual followers:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 