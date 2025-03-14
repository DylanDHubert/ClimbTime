import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to follow users" },
        { status: 401 }
      );
    }
    
    // Get the request body
    const body = await request.json();
    const { targetUserId, action } = body;
    
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target user ID is required" },
        { status: 400 }
      );
    }
    
    if (action !== "follow" && action !== "unfollow") {
      return NextResponse.json(
        { error: "Action must be either 'follow' or 'unfollow'" },
        { status: 400 }
      );
    }
    
    // Prevent users from following themselves
    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }
    
    // Check if the target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    
    if (!targetUser) {
      return NextResponse.json(
        { error: "Target user not found" },
        { status: 404 }
      );
    }
    
    // Handle follow/unfollow action
    if (action === "follow") {
      // Check if already following
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: targetUserId,
          },
        },
      });
      
      if (existingFollow) {
        return NextResponse.json(
          { message: "You are already following this user" },
          { status: 200 }
        );
      }
      
      // Create follow relationship
      await prisma.follow.create({
        data: {
          follower: { connect: { id: session.user.id } },
          following: { connect: { id: targetUserId } },
        },
      });
      
      return NextResponse.json(
        { message: "Successfully followed user" },
        { status: 200 }
      );
    } else {
      // Unfollow action
      // Check if the follow relationship exists
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: targetUserId,
          },
        },
      });
      
      if (!existingFollow) {
        return NextResponse.json(
          { message: "You are not following this user" },
          { status: 200 }
        );
      }
      
      // Delete follow relationship
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: targetUserId,
          },
        },
      });
      
      return NextResponse.json(
        { message: "Successfully unfollowed user" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in follow API:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
} 