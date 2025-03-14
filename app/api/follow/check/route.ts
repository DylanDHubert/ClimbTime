import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { isFollowing: false },
        { status: 200 }
      );
    }
    
    // Get the target user ID from the query parameters
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('targetUserId');
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }
    
    // Check if the current user is following the target user
    const followRecord = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: targetUserId,
        }
      }
    });
    
    return NextResponse.json(
      { isFollowing: !!followRecord },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking follow status:", error);
    return NextResponse.json(
      { error: "An error occurred while checking follow status" },
      { status: 500 }
    );
  }
} 