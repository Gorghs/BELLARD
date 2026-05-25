"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePlayerStore } from "@/store/usePlayerStore";
import { getPlaylistById, deletePlaylist, renamePlaylist } from "@/lib/firestore";
import { Play, Music, ListMusic, Edit2, Trash2, X, Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuthStore();
  const { setCurrentSong, setIsPlaying, setQueue } = usePlayerStore();
  const [playlist, setPlaylist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === playlist.name) {
      setIsRenaming(false);
      return;
    }
    try {
      await renamePlaylist(user!.uid, id as string, newName.trim());
      setPlaylist({ ...playlist, name: newName.trim() });
      setIsRenaming(false);
      window.dispatchEvent(new Event("playlist-updated"));
      toast.success("Playlist renamed");
    } catch (e) {
      toast.error("Failed to rename playlist");
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this playlist?")) {
      try {
        await deletePlaylist(user!.uid, id as string);
        window.dispatchEvent(new Event("playlist-updated"));
        toast.success("Playlist deleted");
        router.push("/");
      } catch (e) {
        toast.error("Failed to delete playlist");
      }
    }
  };

  const formatDuration = (secs: number) => {
    if (!secs) return "--:--";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!user || !id) return;
    const fetchPlaylist = async () => {
      try {
        const data = await getPlaylistById(user.uid, id!);
        setPlaylist(data);
      } catch (e) {
        toast.error("Failed to load playlist");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlaylist();
  }, [user, id]);

  const handlePlayAll = () => {
    if (!playlist || playlist.songs.length === 0) return;
    setQueue(playlist.songs);
    setCurrentSong(playlist.songs[0]);
    setIsPlaying(true);
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] text-white h-full">
      {isLoading ? (
        <div className="h-full flex items-center justify-center text-[#b3b3b3]">Loading playlist...</div>
      ) : !playlist ? (
        <div className="h-full flex items-center justify-center text-[#b3b3b3]">Playlist not found</div>
      ) : (
        <>
          {/* Header */}
          <div className="p-8 bg-gradient-to-b from-[#2a2a2a] to-[#121212] flex items-end gap-6 min-h-[340px]">
            <div className="w-52 h-52 bg-[#282828] rounded shadow-2xl flex items-center justify-center text-[#b3b3b3]">
              <ListMusic size={80} />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase">Playlist</span>
              {isRenaming ? (
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={newName}
                    autoFocus
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    className="text-6xl font-black tracking-tighter bg-[#242424] text-white border-b-2 border-[#1ed760] outline-none px-2 py-1 rounded w-full max-w-lg"
                  />
                  <button onClick={handleRename} className="text-[#1ed760] hover:scale-110 ml-2"><Check size={32} /></button>
                  <button onClick={() => setIsRenaming(false)} className="text-[#b3b3b3] hover:text-white hover:scale-110 ml-2"><X size={32} /></button>
                </div>
              ) : (
                <h1 className="text-8xl font-black tracking-tighter mb-4">{playlist.name}</h1>
              )}
              <div className="flex items-center gap-2 font-bold">
                <span>{user.displayName || "User"}</span>
                <span className="w-1 h-1 bg-white rounded-full"></span>
                <span className="text-[#b3b3b3]">{playlist.songs.length} songs</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-8">
            <div className="flex items-center gap-6 mb-8">
              <button 
                onClick={handlePlayAll}
                disabled={playlist.songs.length === 0}
                className="w-14 h-14 bg-[#1ed760] rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg disabled:opacity-50"
              >
                <Play size={28} fill="black" className="ml-1" />
              </button>
              
              <button 
                onClick={() => { setIsRenaming(true); setNewName(playlist.name); }}
                className="text-[#b3b3b3] hover:text-white transition-colors"
                title="Rename Playlist"
              >
                <Edit2 size={32} />
              </button>

              <button 
                onClick={handleDelete}
                className="text-[#b3b3b3] hover:text-[#f15e6c] transition-colors"
                title="Delete Playlist"
              >
                <Trash2 size={32} />
              </button>
            </div>

            {/* List */}
            <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 text-[#b3b3b3] border-b border-white/10 text-sm font-medium mb-4">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span className="text-right">Duration</span>
            </div>

            {playlist.songs.length === 0 ? (
              <div className="text-center py-20">
                <Music size={48} className="mx-auto mb-4 text-[#282828]" />
                <h3 className="text-xl font-bold mb-2">Your playlist is empty</h3>
                <p className="text-[#b3b3b3]">Add songs from search to build your mix.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {playlist.songs.map((song: any, i: number) => (
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
                        setQueue(playlist.songs);
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
                    <span className="text-[#b3b3b3] text-right">{formatDuration(song.duration)}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
