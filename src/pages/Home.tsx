/**
 * Home page — main video grid with search, filtering and infinite load.
 */
import { useState, useMemo } from "react";
import { AlertCircle, ChevronDown, Loader2 } from "lucide-react";
import { useVideos } from "@/hooks/useVideos";
import { VideoCard, VideoCardSkeleton } from "@/components/VideoCard";
import { VideoModal } from "@/components/VideoModal";
import { Header } from "@/components/Header";
import type { Video } from "@/hooks/useVideos";

const SOURCES = ["Tous", "NackNaija", "NaijaTape", "DarkNaija", "StellaPlus", "NaijaCum"];

export default function Home() {
  const { videos, loading, loadingMore, error, loadMore, refresh } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSource, setActiveSource] = useState("Tous");

  /* Filter videos client-side */
  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = activeSource === "Tous" || v.source === activeSource;
      return matchesSearch && matchesSource;
    });
  }, [videos, searchQuery, activeSource]);

  return (
    <div className="min-h-screen bg-background">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refresh}
        loading={loading}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Source filter tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {SOURCES.map((source) => (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeSource === source
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-accent border border-border"
              }`}
              data-testid={`filter-source-${source}`}
            >
              {source}
            </button>
          ))}
        </div>

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">{error}</p>
              <p className="text-sm text-muted-foreground">Vérifie ta connexion internet.</p>
            </div>
            <button
              onClick={refresh}
              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              data-testid="button-retry"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Video grid */}
        {!loading && filteredVideos.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredVideos.length}</span> vidéos trouvées
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={setSelectedVideo}
                />
              ))}

              {/* Skeleton placeholders while loading more */}
              {loadingMore && Array.from({ length: 5 }).map((_, i) => (
                <VideoCardSkeleton key={`more-${i}`} />
              ))}
            </div>

            {/* Load more button */}
            {!loadingMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-secondary border border-border text-sm font-semibold text-secondary-foreground hover:bg-accent transition-colors"
                  data-testid="button-load-more"
                >
                  {loadingMore ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                  Charger plus de vidéos
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state after search/filter */}
        {!loading && !error && filteredVideos.length === 0 && videos.length > 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <p className="text-lg font-semibold text-foreground">Aucun résultat</p>
            <p className="text-sm text-muted-foreground">
              Essaie un autre mot-clé ou filtre.
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveSource("Tous"); }}
              className="text-sm text-primary hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      {/* Video player modal */}
      <VideoModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </div>
  );
}
