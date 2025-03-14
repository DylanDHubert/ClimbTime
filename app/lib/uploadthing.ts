// Dummy implementation for UploadThing components
// Replace with proper implementation once UploadThing library issues are resolved

import type { OurFileRouter } from "@/app/api/uploadthing/core";

// Create dummy components that won't cause build errors
export const UploadButton = () => null;
export const UploadDropzone = () => null;
export const Uploader = () => null;

// Dummy hooks and functions
export const useUploadThing = () => ({
  startUpload: async () => [],
  permittedFileInfo: { config: {} },
  isUploading: false,
});

export const uploadFiles = async () => []; 