/**
 * VideoModal — full-screen video player shown when user clicks a video card.
 * Uses the native HTML5 <video> element so no extra dependencies are needed.
 */
import { useEffect, useRef, useState } from "react";
import { X, Download, ExternalLink, AlertCircle } from "lucide-react";
import type { Video } from "@/hooks/useVideos";

interface VideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export function VideoModal({ video, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  /* Reset state when video changes */
  useEffect(() => {
    setVideoError(false);
    setVideoLoading(true);
  }, [video?.id]);

  /* Close on Escape key */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  /* Prevent body scroll while modal is open */
  useEffect(() => {
    if (video) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [video]);

  if (!video) return null;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = video.downloadUrl;
    a.download = video.title + ".mp4";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="modal-backdrop"
    >
      <div
        className="relative w-full max-w-4xl bg-card rounded-2xl overflow-hidden shadow-2xl border border-card-border"
        onClick={(e) => e.stopPropagation()}
        data-testid="modal-content"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">
              {video.source}
            </p>
            <h2 className="text-base font-semibold text-foreground line-clamp-2">
              {video.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            data-testid="button-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video player */}
        <div className="relative bg-black aspect-video">
          {videoLoading && !videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-muted-foreground">Chargement de la vidéo...</p>
              </div>
            </div>
          )}

          {videoError ? (
            /* Fallback when video can't be played in-browser (CORS, codec, etc.) */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black p-6 text-center">
              <AlertCircle className="w-12 h-12 text-destructive opacity-70" />
              <div>
                <p className="text-foreground font-semibold mb-1">
                  Lecture impossible dans le navigateur
                </p>
                <p className="text-sm text-muted-foreground">
                  Télécharge la vidéo pour la regarder sur ton appareil.
                </p>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                Télécharger la vidéo
              </button>
              {video.postUrl && (
                <a
                  href={video.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Voir sur le site source
                </a>
              )}
            </div>
          ) : (
            <video
              ref={videoRef}
              src={video.downloadUrl}
              controls
              autoPlay
              playsInline
              className={`w-full h-full transition-opacity duration-300 ${videoLoading ? "opacity-0" : "opacity-100"}`}
              onCanPlay={() => setVideoLoading(false)}
              onError={() => { setVideoError(true); setVideoLoading(false); }}
              data-testid="video-player"
            />
          )}
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between p-4 border-t border-border gap-3">
          <div className="text-xs text-muted-foreground">
            Format MP4 · Source: {video.source}
          </div>
          <div className="flex gap-2">
            {video.postUrl && (
              <a
                href={video.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-accent transition-colors text-foreground"
                data-testid="link-source"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Source
              </a>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
              data-testid="button-modal-download"
            >
              <Download className="w-3.5 h-3.5" />
              Télécharger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
