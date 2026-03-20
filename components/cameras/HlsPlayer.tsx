"use client";

import { useEffect, useRef } from "react";

type Props = {
  src: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
  onLoadedData?: () => void;
  onError?: () => void;
  className?: string;
};

export default function HlsPlayer({
  src,
  autoPlay = true,
  muted = true,
  controls = false,
  poster,
  onLoadedData,
  onError,
  className = "",
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    const setup = async () => {
      // Limpiar instancia anterior si existe
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      // Safari nativo soporta HLS
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.currentTime = video.duration || 0;
        return;
      }

      // Para otros navegadores, usar hls.js
      const HlsModule = (await import("hls.js")).default;

      if (HlsModule.isSupported()) {
        const hls = new HlsModule({
          lowLatencyMode: true,
          enableWorker: true,
          backBufferLength: 30,
          maxBufferSize: 60 * 1000 * 1000, // 60MB
          maxBufferLength: 30,
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
          if (video.readyState > 0) {
            video.currentTime = video.duration || 0;
          }
          video.play().catch(() => {
            // Autoplay puede estar bloqueado
          });
        });

        hls.on(
          HlsModule.Events.ERROR,
          (_event: unknown, data: { fatal: boolean; type: string }) => {
            if (data.fatal) {
              switch (data.type) {
                case HlsModule.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case HlsModule.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  hls.destroy();
                  onError?.();
                  break;
              }
            }
          },
        );
      }
    };

    setup();

    // Reconectar cuando la pestaña vuelve a ser visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setup();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [src, onError]);

  return (
    <video
      ref={videoRef}
      playsInline
      autoPlay={autoPlay}
      muted={muted}
      controls={controls}
      poster={poster}
      onLoadedData={onLoadedData}
      onError={onError}
      className={`w-full h-full object-cover rounded-lg bg-black ${className}`}
    />
  );
}
