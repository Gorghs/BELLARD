"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Play } from "lucide-react";
import { Heart, Plus, ListMusic } from "lucide-react";
import { initFuse, searchLocal } from "@/lib/fuseSearch";
import { getCachedSearch, setCachedSearch } from "@/lib/searchCache";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import { addSongToFavorites, removeSongFromFavorites, getUserFavorites, getUserPlaylists, addSongToPlaylist, Playlist } from "@/lib/firestore";
import { toast } from "sonner";

export default function SearchPage() {
  const { user } = useAuthStore();
  const { setCurrentSong, setIsPlaying, setQueue } = usePlayerStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocalLoaded, setIsLocalLoaded] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const formatDuration = (secs: number) => {
    if (!secs) return "--:--";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Fetch local cache and favorites on mount
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/metadata/cache`);
        const data = await res.json();
        initFuse(data);
        setIsLocalLoaded(true);

        if (user) {
          const [favs, p] = await Promise.all([
            getUserFavorites(user.uid),
            getUserPlaylists(user.uid)
          ]);
          setFavoriteIds(new Set(favs.map(f => f.id)));
          setPlaylists(p);
        }
      } catch (e) {
        console.error("Failed to load search data:", e);
      }
    };
    fetchInitial();
  }, [user]);

  const toggleFavorite = async (e: React.MouseEvent, song: any) => {
    e.stopPropagation();
    if (!user) {
      toast.error("Log in to save songs");
      return;
    }

    const isFav = favoriteIds.has(song.id);
    try {
      if (isFav) {
        await removeSongFromFavorites(user.uid, song.id);
        const newIds = new Set(favoriteIds);
        newIds.delete(song.id);
        setFavoriteIds(newIds);
        toast.success("Removed from Liked Songs");
      } else {
        await addSongToFavorites(user.uid, song);
        const newIds = new Set(favoriteIds);
        newIds.add(song.id);
        setFavoriteIds(newIds);
        toast.success("Added to Liked Songs");
      }
    } catch (err) {
      toast.error("Failed to update favorites");
    }
  };

  const handlePlaySong = (song: any) => {
    setQueue(results);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handleAddToPlaylist = async (song: any, playlistId: string) => {
    if (!user) return;
    try {
      await addSongToPlaylist(user.uid, playlistId, song);
      toast.success(`Added to playlist`);
      setActiveMenu(null);
    } catch (e) {
      toast.error("Failed to add to playlist");
    }
  };

  useEffect(() => {
    const searchSongs = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      const q = query.trim();

      // 1. Check Memory Cache
      const cached = getCachedSearch(q);
      if (cached) {
        setResults(cached);
        return;
      }

      // 2. Local Tier (Fuse.js)
      let localResults: any[] = [];
      if (isLocalLoaded) {
         localResults = searchLocal(q);
         if (q.length <= 3 || localResults.length >= 5) {
             setResults(localResults);
             setCachedSearch(q, localResults);
             return; // Stop here, no Algolia needed
         }
      }

      // 3. Algolia Fallback Tier
      setIsSearching(true);
      try {
        const appId = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '';
        const apiKey = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '';
        
        const response = await fetch(`https://${appId}-dsn.algolia.net/1/indexes/songs/query`, {
          method: 'POST',
          headers: {
            'X-Algolia-Application-Id': appId,
            'X-Algolia-API-Key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ params: `query=${encodeURIComponent(q)}&hitsPerPage=20` })
        });
        
        const data = await response.json();
        const finalResults = data.hits || [];
        
        // Merge or replace results
        setResults(finalResults);
        setCachedSearch(q, finalResults);
      } catch (error) {
        console.error("Algolia Search failed, using local results:", error);
        setResults(localResults);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(() => {
      searchSongs();
    }, 500); // 500ms debounce to save requests

    return () => clearTimeout(debounce);
  }, [query, isLocalLoaded]);

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-6 text-white h-full">
      <div className="sticky top-0 bg-[#121212] z-10 pb-6 pt-2">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b3b3b3]" size={24} />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] border-2 border-transparent focus:border-white outline-none rounded-full py-3 pl-12 pr-4 text-white placeholder-[#b3b3b3] transition-all"
          />
        </div>
      </div>

      <div className="mt-4">
        {!query && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {['Pop', 'Hip-Hop', 'Rock', 'Latin', 'Podcast', 'Chill', 'Dance', 'Indie'].map((genre, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden relative cursor-pointer hover:scale-[1.02] transition-transform" style={{ backgroundColor: `hsl(${i * 45}, 70%, 50%)` }}>
                  <span className="absolute top-4 left-4 font-bold text-xl">{genre}</span>
                  <div className="absolute -bottom-2 -right-4 w-24 h-24 bg-black/20 rotate-[25deg] shadow-lg blur-sm"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {query && results.length === 0 && !isSearching && (
          <div className="text-center text-[#b3b3b3] mt-20">
            <h3 className="text-xl font-bold text-white mb-2">No results found for "{query}"</h3>
            <p>Please make sure your words are spelled correctly, or use less or different keywords.</p>
          </div>
        )}

        {query && results.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Top result</h2>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-2"
            >
              {results.map((song, i) => (
                <motion.div 
                  key={song.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handlePlaySong(song)}
                  className="flex items-center p-2 hover:bg-white/10 rounded-md group cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 bg-[#282828] shrink-0 relative mr-4">
                    {/* In a real app we'd use song.coverUrl */}
                    <img src="/default_cover.png" alt="cover" className="w-full h-full object-cover rounded" />
                    <button className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                       <Play size={20} fill="white" className="text-white ml-1" />
                    </button>
                  </div>
                  <div className="flex-1 truncate">
                    <div className="text-white font-medium truncate group-hover:underline">{song.title || 'Unknown Title'}</div>
                    <div className="text-sm text-[#b3b3b3] truncate">{song.artist || 'Unknown Artist'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={(e) => toggleFavorite(e, song)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    >
                      <Heart 
                        size={20} 
                        className={favoriteIds.has(song.id) ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"} 
                        fill={favoriteIds.has(song.id) ? "currentColor" : "none"} 
                      />
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(activeMenu === song.id ? null : song.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 text-[#b3b3b3] hover:text-white"
                      >
                        <Plus size={20} />
                      </button>

                      {activeMenu === song.id && (
                        <div 
                          className="absolute right-0 bottom-full mb-2 w-48 bg-[#282828] rounded shadow-xl border border-white/10 z-[100] py-1 animate-in fade-in slide-in-from-bottom-2 duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-3 py-2 text-xs font-bold text-[#b3b3b3] border-b border-white/5 uppercase tracking-wider">Add to playlist</div>
                          {playlists.length === 0 ? (
                             <div className="px-3 py-4 text-xs text-[#b3b3b3] italic">No playlists created</div>
                          ) : (
                            playlists.map(p => (
                              <button 
                                key={p.id}
                                onClick={() => handleAddToPlaylist(song, p.id)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 flex items-center gap-2"
                              >
                                <ListMusic size={14} />
                                <span className="truncate">{p.name}</span>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-sm text-[#b3b3b3] w-12 text-right tabular-nums">
                       {formatDuration(song.duration)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
