import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import ProfileClient from "@/app/profile/profile-client";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const metadata: Metadata = {
  title: "Profile | SocialApp",
  description: "View and edit your profile",
};

// Helper function to convert dates to strings in an object
const convertDatesToStrings = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] instanceof Date) {
      newObj[key] = newObj[key].toISOString();
    } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
      newObj[key] = convertDatesToStrings(newObj[key]);
    }
  });
  return newObj;
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !session.user.email) {
    redirect("/login");
  }
  
  // Fetch the latest user data from the database
  let user;
  
  if (session.user.id) {
    // Try to find by ID if available
    user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bannerImage: true,
        bio: true,
        location: true,
        website: true,
        _count: {
          select: {
            posts: true,
            followedBy: true,
            following: true,
          }
        }
      },
    });
  } else {
    // Fallback to finding by email
    user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bannerImage: true,
        bio: true,
        location: true,
        website: true,
        _count: {
          select: {
            posts: true,
            followedBy: true,
            following: true,
          }
        }
      },
    });
  }
  
  if (!user) {
    redirect("/login");
  }
  
  // Fetch user posts
  const posts = await prisma.post.findMany({
    where: {
      userId: user.id,
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
  });
  
  // Convert Date objects to strings in posts
  const postsWithStringDates = posts.map((post: any) => convertDatesToStrings(post));
  
  // Create an enhanced session with the latest user data
  const enhancedSession = {
    ...session,
    user: {
      ...session.user,
      ...user,
    },
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <ProfileClient session={enhancedSession} userPosts={postsWithStringDates} />
    </div>
  );
} 