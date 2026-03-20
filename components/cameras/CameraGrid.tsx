"use client";

import React, { useMemo } from "react";
import CameraCard from "@/components/cameras/CameraCard";
import CameraLoadingSpinner from "@/components/cameras/CameraLoadingSpinner";
import { useNetwork } from "@/context/NetworkContext";
import { Camera } from "@/types";

// Configuración de las 8 cámaras
const CAMERA_CONFIG = [
  { id: "cam1", name: "Cámara 1", channel: "101" },
  { id: "cam2", name: "Cámara 2", channel: "201" },
  { id: "cam3", name: "Cámara 3", channel: "301" },
  { id: "cam4", name: "Cámara 4", channel: "401" },
  { id: "cam5", name: "Cámara 5", channel: "501" },
  { id: "cam6", name: "Cámara 6", channel: "601" },
  { id: "cam7", name: "Cámara 7", channel: "701" },
  { id: "cam8", name: "Cámara 8", channel: "801" },
];

interface CameraGridProps {
  columns?: 1 | 2 | 3 | 4;
}

export default function CameraGrid({ columns = 4 }: CameraGridProps) {
  const { mediaMTXBaseURL, isLoading } = useNetwork();

  const cameras: Camera[] = useMemo(() => {
    if (!mediaMTXBaseURL) return [];

    return CAMERA_CONFIG.map((config) => ({
      id: config.id,
      name: config.name,
      url: `${mediaMTXBaseURL}/${config.id}/index.m3u8`,
    }));
  }, [mediaMTXBaseURL]);

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 xl:grid-cols-4",
  };

  if (isLoading || !mediaMTXBaseURL) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-100">
        <CameraLoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="w-full h-full p-4">
      <div className={`grid ${gridColsClass[columns]} gap-4 h-full w-full`}>
        {cameras.map((camera) => (
          <CameraCard key={camera.id} camera={camera} showLabel={true} />
        ))}
      </div>
    </div>
  );
}
