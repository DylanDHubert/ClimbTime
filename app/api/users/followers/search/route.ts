import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

type UserBasic = {
  id: string;
  name: string | null;
  image: string | null;
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
    
    if (!query.trim()) {
      return NextResponse.json([]);
    }
    
    // Find users who follow the current user and match the search query
    const followers = await prisma.user.findMany({
      where: {
        AND: [
          {
            following: {
              some: {
                followingId: session.user.id,
              },
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
    
    // Check if the current user is following each of these users
    const followersWithFollowStatus = await Promise.all(
      followers.map(async (follower: UserBasic) => {
        const isFollowing = await prisma.follow.findFirst({
          where: {
            followerId: session.user.id,
            followingId: follower.id,
          },
        });
        
        return {
          ...follower,
          isFollowing: !!isFollowing,
        };
      })
    );
    
    return NextResponse.json(followersWithFollowStatus);
  } catch (error) {
    console.error("Error searching followers:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 