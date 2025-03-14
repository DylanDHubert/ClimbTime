import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

type User = {
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
    
    // Search for users by name
    const users = await prisma.user.findMany({
      where: {
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
      select: {
        id: true,
        name: true,
        image: true,
      },
      take: 10,
    });
    
    // For each user, check if the current user is following them
    const usersWithFollowStatus = await Promise.all(
      users.map(async (user: User) => {
        const isFollowing = await prisma.follow.findFirst({
          where: {
            followerId: session.user.id,
            followingId: user.id,
          },
        });
        
        return {
          ...user,
          isFollowing: !!isFollowing,
        };
      })
    );
    
    return NextResponse.json(usersWithFollowStatus);
  } catch (error) {
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 