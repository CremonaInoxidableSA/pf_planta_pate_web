"use client";

import React, { useState } from "react";
import HlsPlayer from "@/components/cameras/HlsPlayer";
import CameraLoadingSpinner from "@/components/cameras/CameraLoadingSpinner";
import { Camera } from "@/types";

interface CameraCardProps {
  camera: Camera;
  showLabel?: boolean;
}

export default function CameraCard({
  camera,
  showLabel = true,
}: CameraCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleVideoLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="relative w-full aspect-video rounded-lg bg-black shadow-lg overflow-hidden group">
      {/* Video Player */}
      <HlsPlayer
        src={camera.url}
        autoPlay={true}
        muted={true}
        controls={false}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg z-10">
          <CameraLoadingSpinner />
        </div>
      )}

      {/* Error Overlay */}
      {hasError && !isLoading && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center rounded-lg z-10">
          <svg
            className="w-12 h-12 text-red-500 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-white text-sm">Sin señal</span>
        </div>
      )}

      {/* Camera Label */}
      {showLabel && (
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white font-medium text-sm">
            {camera.name || camera.id}
          </span>
        </div>
      )}

      {/* Live Indicator */}
      {!isLoading && !hasError && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600/90 px-2 py-1 rounded text-xs text-white">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  );
}
