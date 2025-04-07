"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import NewConversationModal from "./components/NewConversationModal";

type User = {
  id: string;
  name: string | null;
  image: string | null;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  receiverId: string;
  read: boolean;
};

type Conversation = {
  id: string;
  initiatorId: string;
  receiverId: string;
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  initiator: User;
  receiver: User;
  messages: Message[];
  unreadCount: number;
};

interface MessagesClientProps {
  conversations: Conversation[];
  currentUserId: string;
}

export default function MessagesClient({ conversations, currentUserId }: MessagesClientProps) {
  const [isNewConversationModalOpen, setIsNewConversationModalOpen] = useState(false);
  
  const getOtherUser = (conversation: Conversation) => {
    return conversation.initiatorId === currentUserId
      ? conversation.receiver
      : conversation.initiator;
  };
  
  const getLastMessage = (conversation: Conversation) => {
    return conversation.messages[0]?.content || "No messages yet";
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsNewConversationModalOpen(true)}
          className="flex items-center gap-2 bg-[#FDFFA2] hover:bg-[#FDFFA2]/80 text-black px-4 py-2 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>New Message</span>
        </button>
      </div>
      
      {conversations.length === 0 ? (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-3 dark:text-white">No conversations yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start a new conversation to connect with other users!
          </p>
          <button
            onClick={() => setIsNewConversationModalOpen(true)}
            className="bg-[#FDFFA2] hover:bg-[#FDFFA2]/80 text-black px-5 py-2.5 rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
          >
            Start a Conversation
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const lastMessage = getLastMessage(conversation);
              
              return (
                <li key={conversation.id}>
                  <Link 
                    href={`/messages/${conversation.id}`}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center p-4">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 flex-shrink-0 shadow-md">
                        {otherUser.image ? (
                          <Image
                            src={otherUser.image}
                            alt={otherUser.name || "User"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#A4A2FF] to-[#A4A2FF]/80 text-white font-bold text-lg">
                            {otherUser.name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {otherUser.name || "User"}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                          </span>
                        </div>
                        
                        <div className="flex items-center mt-1">
                          <p className={`text-sm ${
                            conversation.unreadCount > 0
                              ? "font-semibold text-gray-900 dark:text-white"
                              : "text-gray-500 dark:text-gray-400"
                          } truncate mr-2`}>
                            {lastMessage}
                          </p>
                          
                          {conversation.unreadCount > 0 && (
                            <span className="bg-[#A4A2FF] text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0 shadow-sm">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      
      <NewConversationModal
        isOpen={isNewConversationModalOpen}
        onClose={() => setIsNewConversationModalOpen(false)}
        currentUserId={currentUserId}
      />
    </div>
  );
} 