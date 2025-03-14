"use client";

import { useEffect, useRef } from "react";
import { Session } from "next-auth";
import EditProfileForm from "./EditProfileForm";

interface EditProfileModalProps {
  session: Session & {
    user: {
      bio?: string | null;
      location?: string | null;
      website?: string | null;
      bannerImage?: string | null;
    }
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ session, isOpen, onClose }: EditProfileModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <EditProfileForm session={session} onClose={onClose} />
      </div>
    </div>
  );
} 