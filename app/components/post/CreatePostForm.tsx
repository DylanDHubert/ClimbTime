"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";

const postSchema = z.object({
  content: z.string().min(1, "Content is required").max(500, "Content cannot exceed 500 characters"),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function CreatePostForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For now, just create a local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: PostFormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, you would upload the image to a storage service here
      // and get back a URL to store in the database
      // For now, we'll use the data URL directly (not recommended for production)
      
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: data.content,
          // Use the preview image data URL if available
          imageUrl: previewImage,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Something went wrong");
        return;
      }

      // Reset form and state
      reset();
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Redirect to home page and refresh
      router.push("/");
      router.refresh();
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#A4A2FF] to-[#A4A2FF]/80 p-4">
        <h1 className="text-2xl font-bold text-white">Create a Post</h1>
      </div>
      
      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              What&apos;s on your mind?
            </label>
            <textarea
              id="content"
              rows={4}
              {...register("content")}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4A2FF] bg-white text-gray-800 transition-colors"
              placeholder="Share your thoughts..."
              disabled={isLoading}
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
            )}
          </div>
          
          {!previewImage ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 transition-colors hover:border-[#A4A2FF]">
              <div className="text-center">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="mt-2 flex justify-center">
                    <PhotoIcon className="h-12 w-12 text-[#A4A2FF]" />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-[#A4A2FF] hover:text-[#A4A2FF]/80">
                      Upload an image
                    </span> or drag and drop
                  </div>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 4MB</p>
                </label>
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="sr-only" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="relative h-64 w-full overflow-hidden rounded-lg shadow-md">
                <Image
                  src={previewImage}
                  alt="Uploaded image"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-3 right-3 bg-white text-gray-800 p-1.5 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-[#FDFFA2] hover:bg-[#FDFFA2]/80 text-black font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4A2FF] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all duration-200 transform hover:scale-[1.02]"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Posting...
                </span>
              ) : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 