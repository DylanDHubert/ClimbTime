'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import React from 'react';

interface BoundingBox {
  bbox: [number, number, number, number];
}

interface Route {
  [key: string]: BoundingBox[];
}

export default function GradePage() {
  const [image, setImage] = useState<string | null>(null);
  const [segmentation, setSegmentation] = useState<Route | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSegmentation(null);
    setLoading(true);

    try {
      // Check if API is up
      const healthCheck = await fetch('/api/proxy');
      if (!healthCheck.ok) {
        const healthData = await healthCheck.json();
        throw new Error(healthData.error || 'API server is not responding');
      }

      // Create a preview URL for the image
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('file', file, file.name);
      
      console.log('Sending file:', file.name, 'size:', file.size, 'type:', file.type);
      
      // Call your segmentation API through the proxy
      const response = await fetch('/api/proxy', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to process image: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Segmentation response:', data);
      setSegmentation(data);
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Clean up the object URL if there's an error
      if (image) {
        URL.revokeObjectURL(image);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Route Segmentation</h1>
      
      <div className="mb-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/jpeg"
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Upload Image'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {image && (
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="relative w-full" style={{ aspectRatio: '1' }}>
            <img
              src={image}
              alt="Uploaded route"
              className="absolute top-0 left-0 w-full h-full object-contain"
            />
            
            {segmentation && (
              <div className="absolute top-0 left-0 w-full h-full">
                {Object.entries(segmentation).map(([routeName, boxes], routeIndex) => (
                  <React.Fragment key={routeIndex}>
                    {boxes.map((box, boxIndex) => (
                      <div
                        key={`${routeIndex}-${boxIndex}`}
                        className="absolute border-2 border-blue-500 bg-blue-400/20 z-10"
                        style={{
                          left: `${box.bbox[0]}%`,
                          top: `${box.bbox[1]}%`,
                          width: `${box.bbox[2] - box.bbox[0]}%`,
                          height: `${box.bbox[3] - box.bbox[1]}%`,
                          pointerEvents: 'none'
                        }}
                      >
                        <span className="absolute -top-6 left-0 text-xs font-medium bg-white px-1 rounded shadow-sm text-blue-600 whitespace-nowrap">
                          {routeName}
                        </span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
