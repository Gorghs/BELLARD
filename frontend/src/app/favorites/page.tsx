"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { getUserFavorites, removeSongFromFavorites } from "@/lib/firestore";
import { Play, Heart, Music } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const { setCurrentSong, setIsPlaying, setQueue } = usePlayerStore();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchFavs = async () => {
      try {
        const data = await getUserFavorites(user.uid);
        setFavorites(data);
      } catch (e) {
        toast.error("Failed to load favorites");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFavs();
  }, [user]);

  const handlePlayAll = () => {
    if (favorites.length === 0) return;
    setQueue(favorites);
    setCurrentSong(favorites[0]);
    setIsPlaying(true);
  };

  const handleRemove = async (songId: string) => {
    if (!user) return;
    try {
      await removeSongFromFavorites(user.uid, songId);
      setFavorites(favorites.filter(f => f.id !== songId));
      toast.success("Removed from Liked Songs");
    } catch (e) {
      toast.error("Failed to remove song");
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] text-white h-full">
      {/* Header */}
      <div className="p-8 bg-gradient-to-b from-[#5038a0] to-[#121212] flex items-end gap-6 min-h-[340px]">
        <div className="w-52 h-52 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded shadow-2xl flex items-center justify-center text-white">
          <Heart size={80} fill="white" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase">Playlist</span>
          <h1 className="text-8xl font-black tracking-tighter mb-4">Liked Songs</h1>
          <div className="flex items-center gap-2 font-bold">
            <span>{user.displayName || user.email?.split("@")[0]}</span>
            <span className="w-1 h-1 bg-white rounded-full"></span>
            <span className="text-[#b3b3b3]">{favorites.length} songs</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-8">
        <button 
          onClick={handlePlayAll}
          disabled={favorites.length === 0}
          className="w-14 h-14 bg-[#1ed760] rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform mb-8 shadow-lg disabled:opacity-50"
        >
          <Play size={28} fill="black" className="ml-1" />
        </button>

        {/* List */}
        <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 text-[#b3b3b3] border-b border-white/10 text-sm font-medium mb-4">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span className="text-right">Action</span>
        </div>

        {isLoading ? (
          <div className="text-center py-10 animate-pulse text-[#b3b3b3]">Loading your favorites...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <Music size={48} className="mx-auto mb-4 text-[#282828]" />
            <h3 className="text-xl font-bold mb-2">Songs you like will appear here</h3>
            <p className="text-[#b3b3b3]">Save songs by tapping the heart icon.</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {favorites.map((song, i) => (
              <motion.div 
                key={song.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md group items-center text-sm"
              >
                <span className="text-[#b3b3b3] group-hover:text-white">{i + 1}</span>
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    setQueue(favorites);
                    setCurrentSong(song);
                    setIsPlaying(true);
                  }}
                >
                  <div className="w-10 h-10 bg-[#282828] rounded flex items-center justify-center relative overflow-hidden">
                    <img src="/default_cover.png" alt="cover" className="w-full h-full object-cover" />
                    <Play size={16} fill="white" className="absolute opacity-0 group-hover:opacity-100 transition-opacity ml-0.5" />
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="text-white font-medium truncate group-hover:underline">{song.title}</span>
                    <span className="text-[#b3b3b3] truncate">{song.artist}</span>
                  </div>
                </div>
                <span className="text-[#b3b3b3] truncate">{song.album}</span>
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleRemove(song.id)}
                    className="text-[#1ed760] hover:scale-110 transition-transform"
                  >
                    <Heart size={20} fill="#1ed760" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
