import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import MessagesClient from "./messages-client";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export const metadata: Metadata = {
  title: "Messages | SocialApp",
  description: "Your private conversations",
};

// Define types for the conversation and related entities
type User = {
  id: string;
  name: string | null;
  image: string | null;
};

type Message = {
  id: string;
  content: string;
  createdAt: string | Date;
  senderId: string;
  receiverId: string;
  read: boolean;
};

type Conversation = {
  id: string;
  initiatorId: string;
  receiverId: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  lastMessageAt: string | Date;
  initiator: User;
  receiver: User;
  messages: Message[];
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

export default async function MessagesPage() {
  // Pass authOptions to getServerSession to ensure user ID is available
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/login");
  }
  
  // Ensure user ID is available
  if (!session.user.id) {
    console.error("User ID not available in session");
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Messages</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Unable to load messages</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error loading your conversations. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  try {
    console.log("Prisma client:", Object.keys(prisma));
    console.log("Session user ID:", session.user.id);
    
    // Fetch conversations for the current user
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { initiatorId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });
    
    console.log("Conversations fetched:", conversations.length);
    
    // Count unread messages for each conversation
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation: any) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            receiverId: session.user.id,
            read: false,
          },
        });
        
        return {
          ...convertDatesToStrings(conversation),
          unreadCount,
        };
      })
    );
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Messages</h1>
        </div>
        
        <MessagesClient 
          conversations={conversationsWithUnreadCount} 
          currentUserId={session.user.id} 
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading conversations:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Messages</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Unable to load messages</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            There was an error loading your conversations. Please try again later.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <pre className="text-left text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-auto">
              {error instanceof Error ? error.message : 'Unknown error'}
            </pre>
          )}
        </div>
      </div>
    );
  }
} 