"use client";
import Link from "next/link";
import { Home, Search, Library, Plus, Heart, Music2, X } from "lucide-react";
import LoginButton from "@/components/auth/LoginButton";
import { useAuthStore } from "@/store/useAuthStore";
import { createPlaylist, getUserPlaylists, Playlist } from "@/lib/firestore";
import { toast } from "sonner";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    const fetchPlaylists = () => {
      if (user) {
        getUserPlaylists(user.uid).then(setPlaylists);
      } else {
        setPlaylists([]);
      }
    };

    fetchPlaylists();

    window.addEventListener("playlist-updated", fetchPlaylists);
    return () => window.removeEventListener("playlist-updated", fetchPlaylists);
  }, [user]);

  const handleCreatePlaylist = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) {
      toast.error("Log in to create playlists");
      return;
    }
    const name = newPlaylistName.trim();
    if (name) {
      try {
        const newPlaylist = await createPlaylist(user.uid, name);
        setPlaylists((prev) => [...prev, newPlaylist]);
        toast.success(`Playlist "${name}" created!`);
        setNewPlaylistName("");
        setIsCreating(false);
      } catch (err) {
        toast.error("Failed to create playlist");
      }
    }
  };

  const navLink = (href: string, Icon: React.ElementType, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-4 transition-colors ${
          active ? "text-white" : "text-[#b3b3b3] hover:text-white"
        }`}
      >
        <Icon size={24} />
        <span className={active ? "font-extrabold" : "font-bold"}>{label}</span>
      </Link>
    );
  };

  return (
    <aside className="w-64 bg-black flex flex-col hidden md:flex h-full p-2 gap-2">
      <div className="bg-[#121212] rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-8 tracking-tighter text-white">Bellard</h1>
        
        <nav className="flex flex-col gap-4 text-sm">
          {navLink("/", Home, "Home")}
          {navLink("/search", Search, "Search")}
          {navLink("/songs", Music2, "All Songs")}
        </nav>
      </div>

      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col overflow-hidden">
        <div className="p-6 pb-2">
          <Link href="/library" className="flex items-center gap-4 text-[#b3b3b3] hover:text-white transition-colors font-bold text-sm mb-6">
            <Library size={24} />
            <span>Your Library</span>
          </Link>

          <div className="flex flex-col gap-4">
            {!isCreating ? (
              <button 
                onClick={() => {
                  if (!user) { toast.error("Log in to create playlists"); return; }
                  setIsCreating(true);
                }}
                className="flex items-center gap-4 text-[#b3b3b3] hover:text-white transition-all group"
              >
                <div className="w-8 h-8 bg-[#b3b3b3] group-hover:bg-white rounded-sm flex items-center justify-center text-black transition-colors">
                  <Plus size={20} />
                </div>
                <span className="font-bold text-sm">Create Playlist</span>
              </button>
            ) : (
              <form onSubmit={handleCreatePlaylist} className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="Playlist name..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="bg-[#242424] text-white text-sm px-2 py-1 rounded w-full border border-transparent focus:border-white/30 outline-none"
                />
                <button type="submit" className="text-[#1ed760] hover:scale-110 transition-transform">
                  <Plus size={20} />
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className="text-[#b3b3b3] hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </form>
            )}

            <Link href="/favorites" className="flex items-center gap-4 text-[#b3b3b3] hover:text-white transition-all group">
              <div className="w-8 h-8 bg-gradient-to-br from-[#450af5] to-[#c4efd9] rounded-sm flex items-center justify-center text-white opacity-70 group-hover:opacity-100 transition-all">
                <Heart size={16} fill="white" />
              </div>
              <span className="font-bold text-sm">Liked Songs</span>
            </Link>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
          <ul className="flex flex-col gap-3 text-sm text-[#b3b3b3]">
            {playlists.map((p) => (
              <li key={p.id}>
                <Link href={`/playlist/${p.id}`} className="hover:text-white transition-colors truncate block">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="p-6 mt-auto">
        <LoginButton />
      </div>
    </aside>
  );
}
