'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import React from 'react';

interface BoundingBox {
  bbox: [number, number, number, number];
  selected?: boolean;
}

interface Route {
  [key: string]: BoundingBox[];
}

// Define a set of distinct colors for routes
const ROUTE_COLORS = [
  { name: 'Red', value: '#EF4444', textColor: '#FFFFFF' },
  { name: 'Blue', value: '#3B82F6', textColor: '#FFFFFF' },
  { name: 'Green', value: '#10B981', textColor: '#FFFFFF' },
  { name: 'Yellow', value: '#F59E0B', textColor: '#000000' },
  { name: 'Purple', value: '#8B5CF6', textColor: '#FFFFFF' },
  { name: 'Pink', value: '#EC4899', textColor: '#FFFFFF' },
  { name: 'Orange', value: '#F97316', textColor: '#FFFFFF' },
  { name: 'Teal', value: '#14B8A6', textColor: '#FFFFFF' },
  { name: 'Indigo', value: '#6366F1', textColor: '#FFFFFF' },
  { name: 'Cyan', value: '#06B6D4', textColor: '#FFFFFF' },
];

export default function GradePage() {
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [segmentation, setSegmentation] = useState<Route | null>(null);
  const [routeZero, setRouteZero] = useState<BoundingBox[]>([]);
  const [routeColors, setRouteColors] = useState<{[key: string]: {value: string, textColor: string}}>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{width: number, height: number} | null>(null);
  const [displayDimensions, setDisplayDimensions] = useState<{width: number, height: number} | null>(null);
  const [resizedDimensions, setResizedDimensions] = useState<{width: number, height: number} | null>(null);
  const [processingStep, setProcessingStep] = useState<'upload' | 'process' | 'edit'>('upload');
  const [clickedRoutes, setClickedRoutes] = useState<Set<string>>(new Set());
  const [isFirstClickOverall, setIsFirstClickOverall] = useState(true);
  const [randomGrade, setRandomGrade] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const routeFileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const resizeImage = async (file: File): Promise<{ resizedFile: File, originalWidth: number, originalHeight: number, resizedWidth: number, resizedHeight: number }> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions while maintaining aspect ratio
        if (width > height && width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width);
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height);
          height = MAX_SIZE;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not create blob'));
            return;
          }
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve({ 
            resizedFile, 
            originalWidth: img.width, 
            originalHeight: img.height,
            resizedWidth: width,
            resizedHeight: height
          });
        }, file.type, 0.8);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSegmentation(null);
    setRouteZero([]);
    setRouteColors({});
    setClickedRoutes(new Set());
    setIsFirstClickOverall(true);
    setLoading(true);
    setImageDimensions(null);
    setResizedDimensions(null);

    try {
      // Create a preview URL for the original image
      const originalImageUrl = URL.createObjectURL(file);
      setOriginalImage(originalImageUrl);

      // Resize the image
      const { resizedFile, originalWidth, originalHeight, resizedWidth, resizedHeight } = await resizeImage(file);
      const resizedImageUrl = URL.createObjectURL(resizedFile);
      setImage(resizedImageUrl);
      setImageDimensions({ width: originalWidth, height: originalHeight });
      setResizedDimensions({ width: resizedWidth, height: resizedHeight });
      
      // Move to processing step
      setProcessingStep('process');
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Clean up the object URLs if there's an error
      if (image) URL.revokeObjectURL(image);
      if (originalImage) URL.revokeObjectURL(originalImage);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessImage = async () => {
    if (!image) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Generate a random number from 0-9 and prepend 'V'
      const grade = `V${Math.floor(Math.random() * 10)}`;
      setRandomGrade(grade);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Display the image with the generated grade
      setSegmentation({ 'Route Zero': [] });
      setRouteZero([]);
      setRouteColors({});
      setClickedRoutes(new Set());
      setIsFirstClickOverall(true);
      
      // Move to edit step
      setProcessingStep('edit');
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const routeData = JSON.parse(text);
      
      // Validate the route data structure
      if (typeof routeData !== 'object' || routeData === null) {
        throw new Error('Invalid route file format');
      }
      
      // Check if it has the expected structure
      const isValidRoute = Object.values(routeData).every(route => 
        Array.isArray(route) && route.every(box => 
          box && typeof box === 'object' && 
          Array.isArray(box.bbox) && box.bbox.length === 4
        )
      );
      
      if (!isValidRoute) {
        throw new Error('Invalid route data structure');
      }
      
      // Rename routes to be more user-friendly if they're not already
      const renamedData: Route = {};
      Object.entries(routeData).forEach(([key, value], index) => {
        // Check if the key already follows our naming convention
        const newKey = key.startsWith('Route ') ? key : `Route ${index + 1}`;
        renamedData[newKey] = value as BoundingBox[];
      });
      
      setSegmentation(renamedData);
      
      // Assign colors to routes
      const newRouteColors: {[key: string]: {value: string, textColor: string}} = {};
      Object.keys(renamedData).forEach((routeName, index) => {
        newRouteColors[routeName] = ROUTE_COLORS[index % ROUTE_COLORS.length];
      });
      setRouteColors(newRouteColors);
      
      // Initialize Route Zero as empty and reset clicked routes
      setRouteZero([]);
      setClickedRoutes(new Set());
      setIsFirstClickOverall(true);
      
      setProcessingStep('edit');
    } catch (err) {
      console.error('Error loading route file:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while loading the route file');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = () => {
    if (!segmentation) return;
    
    try {
      // Create a new object with Route Zero and the original segmentation
      const routeData = {
        'Route Zero': routeZero,
        ...segmentation
      };
      
      // Convert the route data to a JSON string
      const routeDataString = JSON.stringify(routeData, null, 2);
      
      // Create a blob and download link
      const blob = new Blob([routeDataString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary link element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = 'route_data.txt';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error saving route:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving the route');
    }
  };

  const handleImageLoad = () => {
    if (imageRef.current) {
      const naturalWidth = imageRef.current.naturalWidth;
      const naturalHeight = imageRef.current.naturalHeight;
      
      // Calculate display dimensions based on max height constraint
      const maxHeight = window.innerHeight * 0.8; // 80vh
      const scale = maxHeight / naturalHeight;
      const displayWidth = naturalWidth * scale;
      const displayHeight = naturalHeight * scale;
      
      setDisplayDimensions({ width: displayWidth, height: displayHeight });
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleBoxClick = (routeName: string, boxIndex: number) => {
    if (!segmentation) return;

    // If clicking a box in Route Zero, remove it
    if (routeName === 'Route Zero') {
      setRouteZero(prev => prev.filter((_, i) => i !== boxIndex));
    } 
    // If clicking a box in another route
    else {
      // Check if this is the first click overall
      if (isFirstClickOverall) {
        // First click overall: add all boxes from this route to Route Zero
        const boxesToAdd = segmentation[routeName];
        
        // Filter out boxes that are already in Route Zero
        const newBoxes = boxesToAdd.filter(box => 
          !routeZero.some(existingBox => 
            existingBox.bbox[0] === box.bbox[0] &&
            existingBox.bbox[1] === box.bbox[1] &&
            existingBox.bbox[2] === box.bbox[2] &&
            existingBox.bbox[3] === box.bbox[3]
          )
        );
        
        setRouteZero(prev => [...prev, ...newBoxes]);
        
        // Mark this route as clicked
        setClickedRoutes(prev => {
          const newSet = new Set(prev);
          newSet.add(routeName);
          return newSet;
        });
        
        // Set first click overall to false
        setIsFirstClickOverall(false);
      } else {
        // Subsequent clicks: toggle this specific box
        const box = segmentation[routeName][boxIndex];
        
        // Check if this box is already in Route Zero
        const isAlreadyInRouteZero = routeZero.some(existingBox => 
          existingBox.bbox[0] === box.bbox[0] &&
          existingBox.bbox[1] === box.bbox[1] &&
          existingBox.bbox[2] === box.bbox[2] &&
          existingBox.bbox[3] === box.bbox[3]
        );
        
        if (isAlreadyInRouteZero) {
          // Remove the box from Route Zero
          setRouteZero(prev => prev.filter(existingBox => 
            !(existingBox.bbox[0] === box.bbox[0] &&
              existingBox.bbox[1] === box.bbox[1] &&
              existingBox.bbox[2] === box.bbox[2] &&
              existingBox.bbox[3] === box.bbox[3])
          ));
        } else {
          // Add the box to Route Zero
          setRouteZero(prev => [...prev, box]);
        }
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 py-2 text-[#A4A2FF]">Route Segmentation</h1>
      
      {processingStep === 'upload' && (
        <div className="mb-4">
          <div className="flex flex-col space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Climbing Image:
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/jpeg,image/png"
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                className="px-4 py-2 bg-[#FDFFA2] hover:bg-[#FDFFA2]/80 text-black rounded-md transition-colors shadow-sm"
              >
                Upload Image
              </button>
            </div>
          </div>
        </div>
      )}
      
      {processingStep === 'process' && (
        <div className="mb-4">
          <div className="bg-[#FDFFA2]/10 border border-[#FDFFA2] rounded-lg p-4 mb-4">
            <p className="text-black">
              Image uploaded successfully. Choose an option below:
            </p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Option 1: Process Image</h3>
              <p className="text-sm text-gray-600 mb-2">
                Use AI to automatically detect routes in the image.
              </p>
              <button
                onClick={handleProcessImage}
                className="px-4 py-2 bg-[#FDFFA2] hover:bg-[#FDFFA2]/80 text-black rounded-md transition-colors shadow-sm"
              >
                Process Image
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium mb-2">Option 2: Upload Route File</h3>
              <p className="text-sm text-gray-600 mb-2">
                Upload a previously saved route file to bypass processing.
              </p>
              <input
                type="file"
                ref={routeFileInputRef}
                onChange={handleRouteFileUpload}
                accept=".txt,.json"
                className="hidden"
              />
              <button
                onClick={() => routeFileInputRef.current?.click()}
                className="bg-[#FDFFA2] text-black px-4 py-2 rounded-full hover:bg-[#FDFFA2]/80 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Upload Route File'}
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <button
                onClick={() => setProcessingStep('upload')}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
              >
                Upload Different Image
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {processingStep === 'edit' && segmentation && Object.keys(segmentation).length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium text-[#A4A2FF]">Route Zero</h3>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleSaveRoute}
                className="bg-[#FDFFA2] text-black px-4 py-2 rounded-full hover:bg-[#FDFFA2]/80 transition-colors"
              >
                Save Route
              </button>
              <button
                onClick={() => {/* Add grading functionality here */}}
                className="bg-[#FDFFA2] text-black px-4 py-2 rounded-full hover:bg-[#FDFFA2]/80 transition-colors"
              >
                Grade
              </button>
            </div>
          </div>
          <div className="text-center text-2xl font-bold text-[#A4A2FF]">
            {randomGrade}
          </div>
        </div>
      )}

      {originalImage && (
        <div className="relative w-full max-w-2xl mx-auto">
          <div className="relative" style={{ width: 'fit-content', margin: '0 auto' }}>
            <img
              ref={imageRef}
              src={originalImage}
              alt="Uploaded route"
              className="max-h-[80vh] w-auto rounded-lg shadow-md"
              onLoad={handleImageLoad}
            />
            
            {segmentation && imageDimensions && displayDimensions && resizedDimensions && (
              <div 
                className="absolute inset-0" 
                style={{ 
                  width: displayDimensions.width, 
                  height: displayDimensions.height 
                }}
              >
                {/* Render all boxes from suggested routes */}
                {Object.entries(segmentation).map(([routeName, boxes], routeIndex) => {
                  // Calculate scale factors for both the resize and display scaling
                  const resizeScaleX = imageDimensions.width / resizedDimensions.width;
                  const resizeScaleY = imageDimensions.height / resizedDimensions.height;
                  const displayScaleX = displayDimensions.width / imageDimensions.width;
                  const displayScaleY = displayDimensions.height / imageDimensions.height;
                  const routeColor = routeColors[routeName]?.value || '#CCCCCC';
                  const isRouteClicked = clickedRoutes.has(routeName);
                  
                  return (
                    <React.Fragment key={routeIndex}>
                      {boxes.map((box, boxIndex) => {
                        // Check if this box is in Route Zero
                        const isInRouteZero = routeZero.some(routeZeroBox => 
                          routeZeroBox.bbox[0] === box.bbox[0] &&
                          routeZeroBox.bbox[1] === box.bbox[1] &&
                          routeZeroBox.bbox[2] === box.bbox[2] &&
                          routeZeroBox.bbox[3] === box.bbox[3]
                        );
                        
                        return (
                          <div
                            key={`${routeIndex}-${boxIndex}`}
                            className="absolute cursor-pointer"
                            style={{
                              left: `${box.bbox[0] * resizeScaleX * displayScaleX}px`,
                              top: `${box.bbox[1] * resizeScaleY * displayScaleY}px`,
                              width: `${(box.bbox[2] - box.bbox[0]) * resizeScaleX * displayScaleX}px`,
                              height: `${(box.bbox[3] - box.bbox[1]) * resizeScaleY * displayScaleY}px`,
                              border: isInRouteZero 
                                ? `2px solid #FDFFA2` 
                                : `1px solid ${routeColor}`,
                              boxShadow: isInRouteZero ? '0 0 0 2px rgba(164, 162, 255, 0.5)' : 'none',
                              backgroundColor: 'transparent',
                              zIndex: isInRouteZero ? 20 : 10,
                              opacity: isRouteClicked ? 0.7 : 1,
                            }}
                            onClick={() => handleBoxClick(routeName, boxIndex)}
                          />
                        );
                      })}
                    </React.Fragment>
                  );
                })}
                
                {/* Render Route Zero boxes */}
                {routeZero.map((box, boxIndex) => {
                  // Calculate scale factors for both the resize and display scaling
                  const resizeScaleX = imageDimensions.width / resizedDimensions.width;
                  const resizeScaleY = imageDimensions.height / resizedDimensions.height;
                  const displayScaleX = displayDimensions.width / imageDimensions.width;
                  const displayScaleY = displayDimensions.height / imageDimensions.height;
                  
                  return (
                    <div
                      key={`route-zero-${boxIndex}`}
                      className="absolute cursor-pointer"
                      style={{
                        left: `${box.bbox[0] * resizeScaleX * displayScaleX}px`,
                        top: `${box.bbox[1] * resizeScaleY * displayScaleY}px`,
                        width: `${(box.bbox[2] - box.bbox[0]) * resizeScaleX * displayScaleX}px`,
                        height: `${(box.bbox[3] - box.bbox[1]) * resizeScaleY * displayScaleY}px`,
                        border: `2px solid #FDFFA2`,
                        boxShadow: '0 0 0 2px rgba(164, 162, 255, 0.5)',
                        backgroundColor: 'transparent',
                        zIndex: 20,
                      }}
                      onClick={() => handleBoxClick('Route Zero', boxIndex)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {processingStep === 'edit' && (
        <div className="mt-4">
          <button
            onClick={() => setProcessingStep('upload')}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-400 transition-colors"
          >
            Upload New Image
          </button>
        </div>
      )}
    </div>
  );
}
