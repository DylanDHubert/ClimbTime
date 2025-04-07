import { getServerSession } from "next-auth";
import Link from "next/link";
import PostFeed from "@/app/components/post/PostFeed";
import { PlusCircleIcon } from "@heroicons/react/24/outline";

export default async function Home() {
  const session = await getServerSession();

  return (
    <div className="max-w-2xl mx-auto">
      {session ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">Your Feed</h1>
            <Link 
              href="/post" 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors shadow-sm"
            >
              <PlusCircleIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Create Post</span>
            </Link>
          </div>
          
          <PostFeed defaultFeedType="following" />
        </div>
      ) : (
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Welcome to ClimbTime</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed">
            Connect with friends, share your moments, and discover interesting content from people around the world.
          </p>
          <div className="flex justify-center space-x-4 mb-16">
            <Link
              href="/login"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition shadow-sm"
            >
              Sign Up
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
              <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">👥</div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Connect</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Find and connect with friends, family, and interesting people.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
              <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">📸</div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Share</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Share your photos, thoughts, and experiences with your network.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md">
              <div className="text-blue-600 dark:text-blue-400 text-4xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Discover</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Discover new content and stay updated with what matters to you.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
