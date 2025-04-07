"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

type User = {
  id: string;
  name: string | null;
  image: string | null;
  isFollowing?: boolean;
};

type Post = {
  id: string;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  user: User;
  _count?: {
    likes: number;
    comments: number;
  };
};

interface FollowerSearchProps {
  onSearchResults: (results: Post[], query: string) => void;
  onClearSearch: () => void;
}

export default function FollowerSearch({ onSearchResults, onClearSearch }: FollowerSearchProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    users: User[];
    posts: Post[];
  }>({ users: [], posts: [] });
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside the search component
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch search results when debounced query changes
  useEffect(() => {
    if (!session?.user || !debouncedQuery.trim()) {
      setSearchResults({ users: [], posts: [] });
      return;
    }
    
    const fetchSearchResults = async () => {
      setIsSearching(true);
      try {
        console.log("Searching for:", debouncedQuery);
        
        // Search for posts by content
        const postsResponse = await fetch(`/api/posts/search?query=${encodeURIComponent(debouncedQuery)}`);
        
        // Search for users by name
        const usersResponse = await fetch(`/api/users/search?query=${encodeURIComponent(debouncedQuery)}`);
        
        console.log("Posts response status:", postsResponse.status);
        console.log("Users response status:", usersResponse.status);
        
        if (postsResponse.ok && usersResponse.ok) {
          const posts = await postsResponse.json();
          const users = await usersResponse.json();
          
          console.log("Found posts:", posts.length);
          console.log("Found users:", users.length);
          
          setSearchResults({
            posts,
            users: users.filter((user: User) => user.id !== session.user.id),
          });
          
          setShowResults(true);
        } else {
          console.error("Error in search responses:", 
            postsResponse.status, await postsResponse.text(),
            usersResponse.status, await usersResponse.text());
        }
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchSearchResults();
  }, [debouncedQuery, session?.user]);
  
  const handleUserClick = async (userId: string) => {
    if (!userId) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/posts/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        // Only update if we have actual results
        if (data && data.length > 0) {
          const userName = searchResults.users.find(u => u.id === userId)?.name || 'user';
          onSearchResults(data, `posts from ${userName}`);
          setShowResults(false);
        } else {
          // If no posts found, just close the dropdown without updating the main results
          setShowResults(false);
        }
      }
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handlePostsClick = () => {
    // Only update if we have actual results and a valid query
    if (searchResults.posts.length > 0 && debouncedQuery.trim()) {
      onSearchResults(searchResults.posts, debouncedQuery);
      setShowResults(false);
    }
  };
  
  const handleClear = () => {
    setSearchQuery("");
    setDebouncedQuery("");
    setSearchResults({ users: [], posts: [] });
    setShowResults(false);
    
    // Only call onClearSearch if isSearchActive is true in the parent component
    // This prevents unnecessary re-renders
    if (searchResults.posts.length > 0 || searchResults.users.length > 0) {
      onClearSearch();
    }
  };
  
  return (
    <div ref={searchRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim() && setShowResults(true)}
          placeholder="Search posts and users..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        
        {searchQuery && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {showResults && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent"></div>
            </div>
          ) : (searchResults.users.length === 0 && searchResults.posts.length === 0) ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No results found matching "{debouncedQuery}"
            </div>
          ) : (
            <div>
              {searchResults.posts.length > 0 && (
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handlePostsClick}
                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {searchResults.posts.length} posts matching "{debouncedQuery}"
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Click to view all matching posts
                    </p>
                  </button>
                </div>
              )}
              
              {searchResults.users.length > 0 && (
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                    Users
                  </h3>
                  <ul>
                    {searchResults.users.map((user) => (
                      <li key={user.id} className="px-2 py-1">
                        <div className="flex items-center justify-between">
                          <Link 
                            href={`/profile/${user.id}`}
                            className="flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-md w-full"
                          >
                            <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
                              {user.image ? (
                                <Image
                                  src={user.image}
                                  alt={user.name || "User"}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold text-lg">
                                  {user.name?.charAt(0) || "U"}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.name || "User"}
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={() => handleUserClick(user.id)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded ml-2"
                          >
                            View Posts
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 