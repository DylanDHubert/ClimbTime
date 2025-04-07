"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string | null;
  image: string | null;
};

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

export default function NewConversationModal({
  isOpen,
  onClose,
  currentUserId,
}: NewConversationModalProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isOpen || !searchQuery.trim()) {
      setUsers([]);
      setError(null);
      return;
    }
    
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the mutual followers search endpoint
        const response = await fetch(`/api/users/mutual-followers/search?query=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch users");
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setError("An error occurred while searching for users");
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isOpen, currentUserId]);
  
  const startConversation = async (userId: string) => {
    try {
      setError(null);
      const response = await fetch("/api/messages/conversation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverId: userId,
        }),
      });
      
      if (response.ok) {
        const { conversationId } = await response.json();
        router.push(`/messages/${conversationId}`);
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to start conversation");
      }
    } catch (error) {
      console.error("Error starting conversation:", error);
      setError("An error occurred while starting the conversation");
    }
  };
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2"
                >
                  New Message
                </Dialog.Title>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  You can only message users who follow you and whom you follow.
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-sm">
                    {error}
                  </div>
                )}
                
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-[#A4A2FF] focus:border-[#A4A2FF] dark:text-white"
                    placeholder="Search for mutual followers..."
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A4A2FF]"></div>
                    </div>
                  ) : users.length === 0 && searchQuery ? (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No mutual followers found matching "{searchQuery}"
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map((user) => (
                        <li key={user.id} className="py-2">
                          <button
                            onClick={() => startConversation(user.id)}
                            className="w-full flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                          >
                            <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                              {user.image ? (
                                <Image
                                  src={user.image}
                                  alt={user.name || "User"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#A4A2FF] to-[#A4A2FF]/80 text-white font-bold text-lg">
                                  {user.name?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || "User"}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-200 dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A4A2FF] focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 