"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRightOnRectangleIcon, UserIcon } from "@heroicons/react/24/outline";

export default function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
    router.refresh();
  };
  
  return (
    <header className="bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm"  style={{ backgroundColor: '#E2E473' }}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 bg-black rounded-full overflow-hidden flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-xl text-black font-bold bg-black bg-clip-text text-transparent">ClimbTime</h1>
          </Link>
          
          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {status === "authenticated" ? (
              <>
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-2 text-black dark:text-black hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="font-medium">
                    {session.user.name?.split(' ')[0] || "Profile"}
                  </span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-3 py-1.5 text-black dark:text-black hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Sign out"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 