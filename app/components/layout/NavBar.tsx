"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HomeIcon, PlusCircleIcon, UserIcon, GlobeAltIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { HomeIcon as HomeIconSolid, PlusCircleIcon as PlusCircleIconSolid, UserIcon as UserIconSolid, GlobeAltIcon as GlobeAltIconSolid, ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid, StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const navItems = [
  {
    path: "/",
    label: "Feed",
    icon: HomeIcon,
    activeIcon: HomeIconSolid
  },
  {
    path: "/post",
    label: "Post",
    icon: PlusCircleIcon,
    activeIcon: PlusCircleIconSolid
  },
  {
    path: "/messages",
    label: "Messages",
    icon: ChatBubbleLeftRightIcon,
    activeIcon: ChatBubbleLeftRightIconSolid
  },
  {
    path: "/profile",
    label: "Profile",
    icon: UserIcon,
    activeIcon: UserIconSolid
  },
  {
    path: "/explore",
    label: "Explore",
    icon: GlobeAltIcon,
    activeIcon: GlobeAltIconSolid
  },
  {
    path: "/grade",
    label: "Grade",
    icon: StarIconSolid,
    activeIcon: StarIconSolid
  }
];

export default function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch unread message count
  const fetchUnreadCount = async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/messages/unread/count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };
  
  useEffect(() => {
    if (!session?.user?.id) return;
    
    // Fetch initially
    fetchUnreadCount();
    
    // Set up polling every 30 seconds
    const intervalId = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(intervalId);
  }, [session?.user?.id]);
  
  // Refresh unread count when navigating between pages
  useEffect(() => {
    // If we're coming from a message page, refresh the count
    if (session?.user?.id) {
      fetchUnreadCount();
    }
  }, [pathname, session?.user?.id]);
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#A4A2FF] to-[#A4A2FF]/80 dark:bg-gradient-to-r dark:from-[#A4A2FF] dark:to-[#A4A2FF]/80 border-t border-gray-200 dark:border-gray-700 shadow-sm md:sticky md:top-0 md:border-t-0 md:border-b md:z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between md:justify-center md:space-x-16">
          {navItems.map((item) => {
            const isActive = pathname === item.path || 
                            (item.path !== "/" && pathname.startsWith(item.path));
            const Icon = isActive ? item.activeIcon : item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex flex-col items-center py-3 px-3 md:px-4 transition-colors ${
                  isActive 
                    ? "text-[#FDFFA2] bg-[#FDFFA2]/10" 
                    : "text-white dark:text-white hover:text-[#FDFFA2] hover:bg-[#FDFFA2]/10"
                }`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6 mb-1" />
                  {item.path === "/messages" && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FDFFA2] text-black text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
} 