"use client";

import { useState } from "react";
import PostCard from "@/app/components/post/PostCard";
import FollowerSearch from "./follower-search";

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

export default function ExploreClient() {
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const handleSearchResults = (results: Post[], query: string) => {
    setSearchResults(results);
    setSearchQuery(query);
    setIsSearchActive(true);
  };
  
  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
    setIsSearchActive(false);
  };
  
  return (
    <>
      <div className="mb-6">
        <FollowerSearch 
          onSearchResults={handleSearchResults} 
          onClearSearch={handleClearSearch} 
        />
      </div>
      
      {isSearchActive && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchResults.length > 0 
              ? `Search results for "${searchQuery}"`
              : `No posts found matching "${searchQuery}"`
            }
          </h2>
          
          {searchResults.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Try a different search term or browse all posts below.
              </p>
            </div>
          ) : (
            <div>
              {searchResults.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
} 