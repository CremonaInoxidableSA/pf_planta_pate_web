"use client";

import { useTranslation } from "react-i18next";

interface CameraLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export default function CameraLoadingSpinner({
  size = "md",
  showText = true,
}: CameraLoadingSpinnerProps) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-12 h-12 border-4",
    lg: "w-16 h-16 border-4",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div
          className={`animate-spin rounded-full border-t-transparent border-white ${sizeClasses[size]}`}
        />
        {showText && (
          <span
            className={`text-white font-semibold tracking-wider ${textSizeClasses[size]}`}
          >
            {t("min.cargando")}
          </span>
        )}
      </div>
    </div>
  );
}
