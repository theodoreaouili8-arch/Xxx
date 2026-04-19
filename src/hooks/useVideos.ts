/**
 * Hook for fetching videos from our backend proxy API.
 * The backend fetches from the external API server-side to avoid CORS issues.
 */
import { useState, useEffect, useCallback } from "react";

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  downloadUrl: string;
  postUrl?: string;
  source: string;
}

async function fetchVideos(count = 3): Promise<Video[]> {
  const res = await fetch(`/api/videos?count=${count}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json() as { success: boolean; videos: Video[] };
  return json.videos ?? [];
}

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatch = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const newVideos = await fetchVideos(3);

      if (newVideos.length === 0 && isInitial) {
        setError("Impossible de charger les vidéos. Veuillez réessayer.");
      } else {
        if (isInitial) {
          setVideos(newVideos);
        } else {
          /* Stamp new ids to avoid duplicates in the grid */
          const stamped = newVideos.map((v) => ({
            ...v,
            id: `${v.id}-${Date.now()}`,
          }));
          setVideos((prev) => [...prev, ...stamped]);
        }
      }
    } catch {
      if (isInitial) {
        setError("Une erreur est survenue lors du chargement. Vérifiez que le serveur est démarré.");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  /* Initial load */
  useEffect(() => {
    fetchBatch(true);
  }, [fetchBatch]);

  const loadMore = useCallback(() => {
    if (!loadingMore) fetchBatch(false);
  }, [fetchBatch, loadingMore]);

  const refresh = useCallback(() => {
    fetchBatch(true);
  }, [fetchBatch]);

  return { videos, loading, loadingMore, error, loadMore, refresh };
}
