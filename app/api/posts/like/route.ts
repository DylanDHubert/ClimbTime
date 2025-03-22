import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { z } from "zod";

// Schema for like/unlike request
const likeSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
});

// Like or unlike a post
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
    const result = likeSchema.safeParse(body);
    
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
    
    // Check if the user already liked this post
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });
    
    // If like exists, unlike the post
    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
      
      return NextResponse.json(
        { message: "Post unliked successfully", liked: false },
        { status: 200 }
      );
    }
    
    // Otherwise, like the post
    await prisma.like.create({
      data: {
        userId: session.user.id,
        postId,
      },
    });
    
    return NextResponse.json(
      { message: "Post liked successfully", liked: true },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Get like status and count for a post
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
    
    // Get like count
    const likeCount = await prisma.like.count({
      where: { postId },
    });
    
    // Check if current user liked the post
    let isLiked = false;
    if (userId) {
      const userLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      isLiked = !!userLike;
    }
    
    return NextResponse.json({
      likeCount,
      isLiked,
    });
  } catch (error) {
    console.error("Error getting like info:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 