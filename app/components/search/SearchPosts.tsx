"use client";

import { useState, useEffect } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

type User = {
  id: string;
  name: string | null;
  image: string | null;
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

interface SearchPostsProps {
  onSearchResults: (results: Post[], query: string) => void;
  onClearSearch: () => void;
}

export default function SearchPosts({ onSearchResults, onClearSearch }: SearchPostsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Fetch search results when debounced query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!debouncedQuery.trim()) {
        onClearSearch();
        return;
      }
      
      setIsSearching(true);
      
      try {
        const response = await fetch(`/api/posts/search?query=${encodeURIComponent(debouncedQuery)}`);
        
        if (!response.ok) {
          throw new Error("Failed to search posts");
        }
        
        const data = await response.json();
        onSearchResults(data, debouncedQuery);
      } catch (error) {
        console.error("Error searching posts:", error);
        onSearchResults([], debouncedQuery);
      } finally {
        setIsSearching(false);
      }
    };
    
    fetchSearchResults();
  }, [debouncedQuery, onSearchResults, onClearSearch]);
  
  const handleClearSearch = () => {
    setSearchQuery("");
    onClearSearch();
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:text-white"
          placeholder="Search for posts..."
        />
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
        {isSearching && !searchQuery && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
} 