import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { receiverId } = await request.json();
    
    if (!receiverId) {
      return NextResponse.json(
        { error: "Missing receiverId" },
        { status: 400 }
      );
    }
    
    // Check if the receiver exists
    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });
    
    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }
    
    // Check if users follow each other
    const userFollowsReceiver = await prisma.follow.findFirst({
      where: {
        followerId: session.user.id,
        followingId: receiverId,
      },
    });
    
    const receiverFollowsUser = await prisma.follow.findFirst({
      where: {
        followerId: receiverId,
        followingId: session.user.id,
      },
    });
    
    if (!userFollowsReceiver || !receiverFollowsUser) {
      return NextResponse.json(
        { error: "You can only message users who follow you and whom you follow" },
        { status: 403 }
      );
    }
    
    // Check if a conversation already exists between these users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            initiatorId: session.user.id,
            receiverId: receiverId,
          },
          {
            initiatorId: receiverId,
            receiverId: session.user.id,
          },
        ],
      },
    });
    
    if (existingConversation) {
      return NextResponse.json({
        conversationId: existingConversation.id,
      });
    }
    
    // Create a new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        initiatorId: session.user.id,
        receiverId: receiverId,
      },
    });
    
    return NextResponse.json({
      conversationId: newConversation.id,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 