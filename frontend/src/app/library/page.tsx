"use client";
import { useAuthStore } from "@/store/useAuthStore";
import { Play, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { getUserPlaylists, getUserFavorites, Playlist } from "@/lib/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LibraryPage() {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const [p, f] = await Promise.all([
          getUserPlaylists(user.uid),
          getUserFavorites(user.uid)
        ]);
        setPlaylists(p);
        setFavoritesCount(f.length);
      } catch (e) {
        console.error("Library load failed:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-[#b3b3b3]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Log in to view your Library</h2>
          <p>Your saved playlists and favorites will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-6 text-white h-full">
      <h1 className="text-3xl font-bold mb-8">Your Library</h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {/* Liked Songs */}
        <div 
          onClick={() => router.push("/favorites")}
          className="aspect-square bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-lg p-4 flex flex-col justify-end cursor-pointer hover:scale-[1.02] transition-transform group relative"
        >
          <div className="font-bold text-3xl mb-2 line-clamp-2">Liked Songs</div>
          <div className="text-sm font-semibold opacity-90">{favoritesCount} liked songs</div>
          <button className="absolute bottom-4 right-4 w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 transition-all translate-y-2 group-hover:translate-y-0">
            <Play size={24} fill="currentColor" className="ml-1" />
          </button>
        </div>

        {/* Real Playlists */}
        {playlists.map((playlist) => (
          <div 
            key={playlist.id} 
            onClick={() => router.push(`/playlist/${playlist.id}`)}
            className="min-w-[180px] bg-[#181818] hover:bg-[#282828] transition-colors rounded-md p-4 cursor-pointer group"
          >
            <div className="relative mb-4 w-full aspect-square rounded-md shadow-lg overflow-hidden bg-[#282828]">
              <div className="w-full h-full flex items-center justify-center text-[#b3b3b3]">
                 <Play size={40} className="opacity-20" />
              </div>
              <button className="absolute bottom-2 right-2 w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 transition-all translate-y-2 group-hover:translate-y-0">
                <Play size={24} fill="currentColor" className="ml-1" />
              </button>
            </div>
            <h3 className="font-bold mb-1 truncate">{playlist.name}</h3>
            <p className="text-sm text-[#b3b3b3]">By {user.displayName || "You"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
