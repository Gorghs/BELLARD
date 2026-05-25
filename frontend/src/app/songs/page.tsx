"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Play, Heart, Plus, ListMusic, Search, RefreshCw, Clock, ChevronUp, ChevronDown } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useAuthStore } from "@/store/useAuthStore";
import {
  addSongToFavorites,
  removeSongFromFavorites,
  getUserFavorites,
  getUserPlaylists,
  addSongToPlaylist,
  Playlist,
} from "@/lib/firestore";
import { toast } from "sonner";

type Song = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  streamUrl?: string;
  mimeType?: string;
};

type SortKey = "title" | "artist" | "album" | "duration";
type SortDir = "asc" | "desc";

function formatDuration(secs: number) {
  if (!secs) return "--:--";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AllSongsPage() {
  const { user } = useAuthStore();
  const { setCurrentSong, setIsPlaying, setQueue } = usePlayerStore();

  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filter, setFilter] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchSongs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/songs`);
      const data = await res.json();
      setSongs(data);
    } catch (e) {
      toast.error("Failed to load songs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
    if (user) {
      Promise.all([getUserFavorites(user.uid), getUserPlaylists(user.uid)]).then(
        ([favs, p]) => {
          setFavoriteIds(new Set(favs.map((f) => f.id)));
          setPlaylists(p);
        }
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await fetch(`${API}/api/songs/sync`, { method: "POST" });
      toast.success("Sync started — new songs will appear shortly");
      // Poll for updates after a delay
      setTimeout(() => {
        fetchSongs();
        setIsSyncing(false);
      }, 8000);
    } catch {
      toast.error("Sync failed");
      setIsSyncing(false);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    if (!user) { toast.error("Log in to save songs"); return; }
    const isFav = favoriteIds.has(song.id);
    try {
      if (isFav) {
        await removeSongFromFavorites(user.uid, song.id);
        setFavoriteIds((prev) => { const n = new Set(prev); n.delete(song.id); return n; });
        toast.success("Removed from Liked Songs");
      } else {
        await addSongToFavorites(user.uid, song);
        setFavoriteIds((prev) => new Set([...prev, song.id]));
        toast.success("Added to Liked Songs");
      }
    } catch { toast.error("Failed to update favorites"); }
  };

  const handleAddToPlaylist = async (song: Song, playlistId: string) => {
    if (!user) return;
    try {
      await addSongToPlaylist(user.uid, playlistId, song);
      toast.success("Added to playlist");
      setActiveMenu(null);
    } catch { toast.error("Failed to add to playlist"); }
  };

  const handlePlaySong = (song: Song) => {
    setQueue(filtered);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    let list = q
      ? songs.filter(
          (s) =>
            s.title?.toLowerCase().includes(q) ||
            s.artist?.toLowerCase().includes(q) ||
            s.album?.toLowerCase().includes(q)
        )
      : [...songs];

    list.sort((a, b) => {
      let av = (a[sortKey] ?? "").toString().toLowerCase();
      let bv = (b[sortKey] ?? "").toString().toLowerCase();
      if (sortKey === "duration") {
        av = String(a.duration ?? 0).padStart(8, "0");
        bv = String(b.duration ?? 0).padStart(8, "0");
      }
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    return list;
  }, [songs, filter, sortKey, sortDir]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return null;
    return sortDir === "asc" ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] text-white h-full">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#121212] px-6 pt-8 pb-6">
        <div className="flex items-end gap-6">
          <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#1ed760] to-[#0a8f3f] flex items-center justify-center shadow-2xl shadow-[#1ed760]/20 shrink-0">
            <Music size={56} className="text-black" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#b3b3b3] mb-2">Playlist</p>
            <h1 className="text-5xl font-black tracking-tight mb-3">All Songs</h1>
            <p className="text-[#b3b3b3] text-sm">
              {isLoading ? "Loading..." : `${songs.length} songs in your library`}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Controls Row */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          {/* Play All */}
          <button
            onClick={() => { if (filtered.length) { setQueue(filtered); setCurrentSong(filtered[0]); setIsPlaying(true); }}}
            className="w-14 h-14 bg-[#1ed760] hover:bg-[#1fdf64] rounded-full flex items-center justify-center text-black shadow-lg hover:scale-105 transition-all"
          >
            <Play size={26} fill="currentColor" className="ml-1" />
          </button>

          {/* Sync button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            title="Sync new songs from Google Drive"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 hover:border-white/60 text-[#b3b3b3] hover:text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            {isSyncing ? "Syncing…" : "Sync Drive"}
          </button>

          {/* Search filter */}
          <div className="relative ml-auto flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b3b3b3]" />
            <input
              type="text"
              placeholder="Filter songs…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-[#1a1a1a] hover:bg-[#242424] border border-transparent focus:border-white/30 outline-none rounded-full py-2 pl-9 pr-4 text-sm text-white placeholder-[#b3b3b3] transition-all"
            />
          </div>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[2rem_1fr_1fr_1fr_4rem] gap-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#b3b3b3] border-b border-white/10 mb-2">
          <span>#</span>
          <button onClick={() => handleSort("title")} className="text-left hover:text-white transition-colors">
            Title <SortIcon col="title" />
          </button>
          <button onClick={() => handleSort("artist")} className="text-left hover:text-white transition-colors">
            Artist <SortIcon col="artist" />
          </button>
          <button onClick={() => handleSort("album")} className="text-left hover:text-white transition-colors">
            Album <SortIcon col="album" />
          </button>
          <button onClick={() => handleSort("duration")} className="flex items-center justify-end gap-1 hover:text-white transition-colors">
            <Clock size={14} /> <SortIcon col="duration" />
          </button>
        </div>

        {/* Song List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-[#282828] border-t-[#1ed760] rounded-full animate-spin" />
            <p className="text-[#b3b3b3] text-sm">Loading your library…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Music size={48} className="mx-auto mb-4 text-[#535353]" />
            <p className="text-[#b3b3b3] text-lg font-medium">
              {filter ? `No songs matching "${filter}"` : "No songs found — try syncing from Drive"}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.4) }}
                onClick={() => handlePlaySong(song)}
                className="grid grid-cols-[2rem_1fr_1fr_1fr_4rem] gap-4 px-4 py-3 rounded-md hover:bg-white/5 group cursor-pointer transition-colors items-center"
              >
                {/* Index / Play button */}
                <span className="text-sm text-[#b3b3b3] group-hover:hidden text-center">{i + 1}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                  className="hidden group-hover:flex items-center justify-center"
                >
                  <Play size={18} fill="white" className="text-white" />
                </button>

                {/* Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-[#282828] rounded shrink-0 flex items-center justify-center">
                    <Music size={16} className="text-[#535353] group-hover:text-[#1ed760] transition-colors" />
                  </div>
                  <span className="font-medium truncate group-hover:text-[#1ed760] transition-colors">
                    {song.title || "Unknown Title"}
                  </span>
                </div>

                {/* Artist */}
                <span className="text-sm text-[#b3b3b3] truncate">{song.artist || "Unknown Artist"}</span>

                {/* Album */}
                <span className="text-sm text-[#b3b3b3] truncate">{song.album || "Unknown Album"}</span>

                {/* Duration + actions */}
                <div className="flex items-center justify-end gap-2">
                  {/* Heart */}
                  <button
                    onClick={(e) => toggleFavorite(e, song)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shrink-0"
                  >
                    <Heart
                      size={16}
                      className={favoriteIds.has(song.id) ? "text-[#1ed760]" : "text-[#b3b3b3] hover:text-white"}
                      fill={favoriteIds.has(song.id) ? "currentColor" : "none"}
                    />
                  </button>

                  {/* Add to playlist */}
                  <div className="relative shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === song.id ? null : song.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 text-[#b3b3b3] hover:text-white"
                    >
                      <Plus size={16} />
                    </button>
                    {activeMenu === song.id && (
                      <div
                        className="absolute right-0 bottom-full mb-2 w-48 bg-[#282828] rounded shadow-xl border border-white/10 z-50 py-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="px-3 py-2 text-xs font-bold text-[#b3b3b3] border-b border-white/5 uppercase tracking-wider">
                          Add to playlist
                        </div>
                        {playlists.length === 0 ? (
                          <div className="px-3 py-4 text-xs text-[#b3b3b3] italic">No playlists created</div>
                        ) : (
                          playlists.map((p) => (
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

                  <span className="text-sm text-[#b3b3b3] w-10 text-right tabular-nums">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
