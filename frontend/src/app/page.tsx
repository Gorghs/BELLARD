"use client";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";
import { getUserPlaylists, Playlist } from "@/lib/firestore";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const router = useRouter();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  useEffect(() => {
    if (!user) return;
    getUserPlaylists(user.uid).then(setPlaylists);
  }, [user]);

  const greeting = getGreeting();

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1e3264] to-[#121212] p-6 relative">
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
      
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-6 tracking-tight">{greeting}</h1>
        
        {/* Recent Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {playlists.slice(0, 6).map((playlist) => (
            <motion.div 
              key={playlist.id} 
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(`/playlist/${playlist.id}`)}
              className="flex items-center bg-white/5 hover:bg-white/20 transition-colors rounded overflow-hidden group cursor-pointer"
            >
              <div className="w-20 h-20 bg-[#282828] shrink-0 flex items-center justify-center">
                 <Play size={24} className="opacity-20" />
              </div>
              <div className="px-4 font-bold truncate flex-1">{playlist.name}</div>
              <button className="w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center text-black mr-4 opacity-0 group-hover:opacity-100 shadow-lg hover:scale-105 transition-all">
                <Play size={24} fill="currentColor" className="ml-1" />
              </button>
            </motion.div>
          ))}
          {playlists.length === 0 && (
            <div className="text-[#b3b3b3] text-sm italic col-span-full">Create your first playlist in the sidebar!</div>
          )}
        </motion.div>

        <h2 className="text-2xl font-bold mb-6 hover:underline cursor-pointer">Made for you</h2>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -5 }}
              className="min-w-[180px] w-[180px] bg-[#181818] hover:bg-[#282828] transition-colors rounded-md p-4 cursor-pointer group"
            >
              <div className="relative mb-4 w-full aspect-square rounded-md shadow-lg overflow-hidden">
                <img src="/default_cover.png" alt="cover" className="w-full h-full object-cover" />
                <button className="absolute bottom-2 right-2 w-12 h-12 bg-[#1ed760] rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 shadow-xl hover:scale-105 transition-all translate-y-2 group-hover:translate-y-0">
                  <Play size={24} fill="currentColor" className="ml-1" />
                </button>
              </div>
              <h3 className="font-bold mb-1 truncate">Daily Mix {i}</h3>
              <p className="text-sm text-[#b3b3b3] line-clamp-2">A mix of artists you love, and some new ones.</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
