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
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-bold">Edit Profile</h2>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
      
      <form ref={formRef} onSubmit={handleSubmit} className="p-4">
        {/* Banner Image */}
        <div className="relative mb-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
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
            className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
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
          <div className="absolute -top-16 bg-white dark:bg-gray-900 p-1 rounded-full">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
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
              className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white p-1.5 rounded-full hover:bg-opacity-80"
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
            <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            />
            {errors.website && <p className="mt-1 text-sm text-red-500">{errors.website}</p>}
          </div>
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
} 