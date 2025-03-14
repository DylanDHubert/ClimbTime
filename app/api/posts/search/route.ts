import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

type User = {
  id: string;
  name: string | null;
  image: string | null;
};

type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string | Date;
  userId: string;
  user: User;
  _count?: {
    likes: number;
    comments: number;
  };
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
    
    console.log("Post search query:", query);
    
    if (!query.trim()) {
      return NextResponse.json([]);
    }
    
    // Search for posts that contain the query in their content
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: query,
          mode: "insensitive",
        },
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Increased from 10 to 20 for more results
    });
    
    console.log(`Found ${posts.length} posts matching "${query}"`);
    
    // For each post, check if the current user has liked it
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post: any) => {
        const like = await prisma.like.findFirst({
          where: {
            postId: post.id,
            userId: session.user.id,
          },
        });
        
        return {
          ...post,
          createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : post.createdAt,
          isLiked: !!like,
        };
      })
    );
    
    return NextResponse.json(postsWithLikeStatus);
  } catch (error) {
    console.error("Error searching posts:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 