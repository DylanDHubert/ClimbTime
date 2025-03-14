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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <PlusCircleIcon className="h-5 w-5" />
          <span>New Message</span>
        </button>
      </div>
      
      {conversations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">No conversations yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start a new conversation to connect with other users!
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => {
              const otherUser = getOtherUser(conversation);
              const lastMessage = getLastMessage(conversation);
              
              return (
                <li key={conversation.id}>
                  <Link 
                    href={`/messages/${conversation.id}`}
                    className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center p-4">
                      <div className="relative h-12 w-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                        {otherUser.image ? (
                          <Image
                            src={otherUser.image}
                            alt={otherUser.name || "User"}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg">
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
                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
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