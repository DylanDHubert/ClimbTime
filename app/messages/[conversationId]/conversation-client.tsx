"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { PaperAirplaneIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

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
};

interface ConversationClientProps {
  conversation: Conversation;
  messages: Message[];
  currentUserId: string;
  otherUser: User;
}

export default function ConversationClient({
  conversation,
  messages: initialMessages,
  currentUserId,
  otherUser,
}: ConversationClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Poll for new messages every 5 seconds
  useEffect(() => {
    const fetchNewMessages = async () => {
      try {
        const response = await fetch(`/api/messages/${conversation.id}`);
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    
    const intervalId = setInterval(fetchNewMessages, 5000);
    
    return () => clearInterval(intervalId);
  }, [conversation.id]);
  
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          receiverId: otherUser.id,
          content: newMessage,
        }),
      });
      
      if (response.ok) {
        const sentMessage = await response.json();
        setMessages((prev) => [...prev, sentMessage]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      <div className="bg-white dark:bg-gray-800 rounded-t-lg shadow-md p-4 flex items-center">
        <button
          onClick={() => router.push("/messages")}
          className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </button>
        
        <Link href={`/profile/${otherUser.id}`} className="flex items-center">
          <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
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
          <span className="font-medium text-gray-900 dark:text-white">
            {otherUser.name || "User"}
          </span>
        </Link>
      </div>
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No messages yet. Send a message to start the conversation!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isCurrentUser = message.senderId === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isCurrentUser
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-blue-200" : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      {isCurrentUser && message.read && (
                        <span className="ml-2">• Read</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <form
        onSubmit={sendMessage}
        className="bg-white dark:bg-gray-800 rounded-b-lg shadow-md p-4 flex items-center"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className={`ml-2 p-2 rounded-full ${
            !newMessage.trim() || isSending
              ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isSending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent border-white" />
          ) : (
            <PaperAirplaneIcon className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
} 