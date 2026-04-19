/**
 * VideoCard — displays a video thumbnail, title, source badge,
 * a Watch button and a Download button.
 */
import { useState } from "react";
import { Play, Download, Loader2 } from "lucide-react";
import type { Video } from "@/hooks/useVideos";

interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  const [thumbLoaded, setThumbLoaded] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      className="video-card rounded-xl overflow-hidden bg-card border border-card-border cursor-pointer group"
      onClick={() => onPlay(video)}
      data-testid={`video-card-${video.id}`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-muted overflow-hidden">
        {/* Skeleton while loading */}
        {!thumbLoaded && !thumbError && (
          <div className="absolute inset-0 thumbnail-skeleton" />
        )}

        {/* Error fallback */}
        {thumbError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Play className="text-muted-foreground w-12 h-12 opacity-40" />
          </div>
        )}

        {/* Actual thumbnail — routed through our proxy to avoid CORS */}
        {video.thumbnail && (
          <img
            src={`/api/videos/thumbnail?url=${encodeURIComponent(video.thumbnail)}`}
            alt={video.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${thumbLoaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setThumbLoaded(true)}
            onError={() => { setThumbError(true); setThumbLoaded(false); }}
            data-testid={`img-thumbnail-${video.id}`}
          />
        )}

        {/* Play overlay on hover */}
        <div className="play-overlay absolute inset-0 flex items-center justify-center bg-black/40">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-2xl">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </div>

        {/* Source badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/70 text-white border border-white/10">
            {video.source}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3">
        <h3
          className="text-sm font-medium text-foreground line-clamp-2 leading-tight mb-3 min-h-[2.5rem]"
          data-testid={`text-title-${video.id}`}
        >
          {video.title}
        </h3>

        <div className="flex gap-2">
          {/* Watch button */}
          <button
            onClick={(e) => { e.stopPropagation(); onPlay(video); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            data-testid={`button-watch-${video.id}`}
          >
            <Play className="w-3.5 h-3.5" fill="currentColor" />
            Regarder
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-accent transition-colors border border-border"
            title="Télécharger la vidéo"
            data-testid={`button-download-${video.id}`}
          >
            <Download className="w-3.5 h-3.5" />
            Télécharger
          </button>
        </div>
      </div>
    </div>
  );
}

/* Skeleton placeholder card for loading state */
export function VideoCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-card border border-card-border">
      <div className="aspect-video thumbnail-skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 thumbnail-skeleton rounded" />
        <div className="h-4 thumbnail-skeleton rounded w-3/4" />
        <div className="flex gap-2 mt-3">
          <div className="flex-1 h-8 thumbnail-skeleton rounded-lg" />
          <div className="w-28 h-8 thumbnail-skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}
