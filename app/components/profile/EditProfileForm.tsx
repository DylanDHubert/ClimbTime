"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { Session } from "next-auth";
import { z } from "zod";
import Image from "next/image";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface EditProfileFormProps {
  session: Session & {
    user: {
      bio?: string | null;
      location?: string | null;
      website?: string | null;
      bannerImage?: string | null;
    }
  };
  onClose: () => void;
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  bio: z.string().max(160, "Bio cannot exceed 160 characters").optional(),
  location: z.string().max(30, "Location cannot exceed 30 characters").optional(),
  website: z.string().url("Please enter a valid URL").max(100, "Website URL is too long").optional().or(z.literal("")),
});

export default function EditProfileForm({ session, onClose }: EditProfileFormProps) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [profilePreview, setProfilePreview] = useState<string | null>(session.user?.image || null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(session.user?.bannerImage || null);
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleBannerPictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    try {
      const formData = new FormData(e.currentTarget);
      
      // Validate form data
      const formValues = {
        name: formData.get("name") as string,
        bio: formData.get("bio") as string,
        location: formData.get("location") as string,
        website: formData.get("website") as string,
      };
      
      const result = profileSchema.safeParse(formValues);
      
      if (!result.success) {
        const formattedErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          formattedErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(formattedErrors);
        setIsLoading(false);
        return;
      }
      
      // Add image data URLs to the form data
      if (profilePreview) {
        formData.append("profilePictureDataUrl", profilePreview);
      }
      
      if (bannerPreview) {
        formData.append("bannerPictureDataUrl", bannerPreview);
      }
      
      // Send data to API
      const response = await fetch("/api/profile", {
        method: "PUT",
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
      
      // Success - refresh the page and close modal
      router.refresh();
      onClose();
      
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrors({ form: "Failed to update profile. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-[#A4A2FF] to-[#A4A2FF]/80">
        <h2 className="text-xl font-bold text-white">Edit Profile</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/20 text-white transition-colors"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      <form ref={formRef} onSubmit={handleSubmit} className="p-6">
        {/* Banner Image */}
        <div className="relative mb-6">
          <div className="h-32 bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden shadow-md">
            {bannerPreview ? (
              <Image 
                src={bannerPreview} 
                alt="Banner preview" 
                className="w-full h-full object-cover"
                width={600}
                height={200}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PhotoIcon className="h-10 w-10 text-gray-400" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => bannerInputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <PhotoIcon className="h-5 w-5" />
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            name="bannerPicture"
            accept="image/*"
            onChange={handleBannerPictureChange}
            className="hidden"
          />
        </div>
        
        {/* Profile Picture */}
        <div className="relative mb-6 flex justify-center">
          <div className="absolute -top-16 bg-white dark:bg-gray-900 p-1 rounded-full shadow-lg">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700">
              {profilePreview ? (
                <Image 
                  src={profilePreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PhotoIcon className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => profileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white p-1.5 rounded-full hover:bg-opacity-80 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <PhotoIcon className="h-4 w-4" />
            </button>
          </div>
          <input
            ref={profileInputRef}
            type="file"
            name="profilePicture"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="hidden"
          />
        </div>
        
        {/* Form Fields */}
        <div className="mt-16 space-y-4">
          {errors.form && (
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              {errors.form}
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={session.user?.name || ""}
              className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-[#A4A2FF] focus:ring-[#A4A2FF] dark:bg-gray-800 transition-colors"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              defaultValue={session.user?.bio || ""}
              className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-[#A4A2FF] focus:ring-[#A4A2FF] dark:bg-gray-800 transition-colors"
            ></textarea>
            {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio}</p>}
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              defaultValue={session.user?.location || ""}
              className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-[#A4A2FF] focus:ring-[#A4A2FF] dark:bg-gray-800 transition-colors"
            />
            {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              placeholder="https://example.com"
              defaultValue={session.user?.website || ""}
              className="mt-1 block w-full rounded-md border-gray-200 dark:border-gray-700 shadow-sm focus:border-[#A4A2FF] focus:ring-[#A4A2FF] dark:bg-gray-800 transition-colors"
            />
            {errors.website && <p className="mt-1 text-sm text-red-500">{errors.website}</p>}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FDFFA2] hover:bg-[#FDFFA2]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A4A2FF] disabled:opacity-50 disabled:cursor-not-allowed dark:bg-[#FDFFA2] dark:hover:bg-[#FDFFA2]/80 dark:text-black dark:focus:ring-[#A4A2FF] transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
} 