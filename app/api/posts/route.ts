import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// Schema for post creation
const postSchema = z.object({
  content: z.string().min(1, "Content is required").max(500, "Content cannot exceed 500 characters"),
  // Allow any string for imageUrl to support data URLs
  imageUrl: z.string().optional().nullable(),
});

// Create a new post
export async function POST(req: NextRequest) {
  try {
    // Get the session using the auth options
    const session = await getServerSession(authOptions);
    
    console.log("Session in POST /api/posts:", session);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - No session found" },
        { status: 401 }
      );
    }
    
    // Check if user ID exists in session
    if (!session.user.id) {
      console.error("User ID missing from session:", session);
      return NextResponse.json(
        { error: "Unauthorized - User ID missing" },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // Validate input
    const result = postSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.format() },
        { status: 400 }
      );
    }
    
    const { content, imageUrl } = result.data;
    
    // Create post
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl: imageUrl || undefined,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return NextResponse.json(
      { message: "Post created successfully", post },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// Get all posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const feedType = searchParams.get('feedType');
    const session = await getServerSession(authOptions);
    
    // If feedType is 'following' and user is logged in, show only posts from followed users
    if (feedType === 'following' && session?.user?.id) {
      // Get the list of users that the current user follows
      const following = await prisma.follow.findMany({
        where: {
          followerId: session.user.id
        },
        select: {
          followingId: true
        }
      });
      
      // Extract the IDs of followed users
      const followingIds = following.map((follow: { followingId: string }) => follow.followingId);
      
      // If user doesn't follow anyone, include their own posts
      const userIds = followingIds.length > 0 
        ? followingIds 
        : [session.user.id];
      
      // Get posts from followed users
      const posts = await prisma.post.findMany({
        where: {
          userId: {
            in: userIds
          }
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              shares: true,
            },
          },
        },
      });
      
      return NextResponse.json(posts);
    }
    
    // Default: Get all posts
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 