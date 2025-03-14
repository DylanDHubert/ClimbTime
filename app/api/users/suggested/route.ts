import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get users that the current user is not following
    // Exclude the current user
    // Limit to 6 users
    // Order by follower count (most popular first)
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: {
          not: session.user.id,
          notIn: (await prisma.follow.findMany({
            where: {
              followerId: session.user.id
            },
            select: {
              followingId: true
            }
          })).map((follow: { followingId: string }) => follow.followingId)
        }
      },
      select: {
        id: true,
        name: true,
        image: true,
        _count: {
          select: {
            followedBy: true
          }
        }
      },
      orderBy: {
        followedBy: {
          _count: 'desc'
        }
      },
      take: 6
    });
    
    return NextResponse.json(suggestedUsers);
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 