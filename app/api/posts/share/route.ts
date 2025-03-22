import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

// Schema for share request
const shareSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
});

// Share a post
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = shareSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { postId } = result.data;
    
    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }
    
    // Check if the user already shared this post
    const existingShare = await prisma.share.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });
    
    // If share exists, cancel the share
    if (existingShare) {
      await prisma.share.delete({
        where: {
          id: existingShare.id,
        },
      });
      
      return NextResponse.json(
        { message: "Share removed successfully", shared: false },
        { status: 200 }
      );
    }
    
    // Otherwise, share the post
    await prisma.share.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });
    
    return NextResponse.json(
      { message: "Post shared successfully", shared: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sharing post:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Get share status and count for a post
export async function GET(req: NextRequest) {
  try {
    // Get postId from query params
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }
    
    // Get session for current user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    // Get share count
    const shareCount = await prisma.share.count({
      where: { postId },
    });
    
    // Check if current user shared the post
    let isShared = false;
    if (userId) {
      const userShare = await prisma.share.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      isShared = !!userShare;
    }
    
    return NextResponse.json({
      shareCount,
      isShared,
    });
  } catch (error) {
    console.error("Error getting share info:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 