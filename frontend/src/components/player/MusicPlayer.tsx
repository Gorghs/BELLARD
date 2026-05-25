"use client";
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from "lucide-react";
import { usePlayerStore } from "@/store/usePlayerStore";
import { useRef, useEffect, useState } from "react";

export default function MusicPlayer() {
  const { currentSong, isPlaying, volume, progress, setIsPlaying, setProgress, setVolume, playNext, playPrevious } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            if (e.name !== "AbortError") {
              console.error("Playback failed:", e);
            }
          });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Reset duration when song changes
  useEffect(() => {
    setDuration(0);
    setProgress(0);
  }, [currentSong]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const newTime = ratio * duration;
    audioRef.current.currentTime = newTime;
    setProgress(newTime);
  };

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <footer className="h-24 bg-black border-t border-[#282828] px-4 flex items-center justify-between z-50">
      <audio 
        ref={audioRef} 
        src={currentSong?.streamUrl || undefined} 
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={playNext}
      />
      
      {/* Left: Song Info */}
      <div className="flex items-center w-[30%] min-w-[180px]">
        <div className="w-14 h-14 bg-[#282828] rounded flex-shrink-0 relative overflow-hidden">
            <img src="/default_cover.png" alt="Album Cover" className="object-cover w-full h-full" />
        </div>
        <div className="ml-4 truncate">
          <div className="text-sm text-white font-medium hover:underline cursor-pointer truncate">
            {currentSong ? currentSong.title : "No Song Selected"}
          </div>
          <div className="text-xs text-[#b3b3b3] hover:underline cursor-pointer truncate mt-1">
            {currentSong ? currentSong.artist : ""}
          </div>
        </div>
      </div>

      {/* Middle: Controls */}
      <div className="flex flex-col justify-center items-center max-w-[40%] w-full">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-[#b3b3b3] hover:text-white transition-colors"><Shuffle size={20} /></button>
          <button onClick={playPrevious} className="text-[#b3b3b3] hover:text-white transition-colors"><SkipBack size={20} fill="currentColor" /></button>
          <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 transition-transform">
            {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={playNext} className="text-[#b3b3b3] hover:text-white transition-colors"><SkipForward size={20} fill="currentColor" /></button>
          <button className="text-[#b3b3b3] hover:text-white transition-colors"><Repeat size={20} /></button>
        </div>
        
        <div className="w-full flex items-center gap-2 text-xs text-[#b3b3b3]">
          <span className="w-8 text-right tabular-nums">{formatTime(progress)}</span>
          <div 
            className="h-1 flex-1 bg-[#4d4d4d] rounded-full group cursor-pointer flex items-center"
            onClick={handleSeek}
          >
            <div 
              className="h-full bg-white group-hover:bg-[#1ed760] rounded-full relative transition-colors"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow"></div>
            </div>
          </div>
          <span className="w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Volume & Extra Controls */}
      <div className="flex items-center justify-end w-[30%] min-w-[180px] gap-4">
        <Volume2 size={20} className="text-[#b3b3b3]" />
        <div 
          className="w-24 h-1 bg-[#4d4d4d] rounded-full group cursor-pointer flex items-center"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            setVolume(Math.max(0, Math.min(1, ratio)));
            if (audioRef.current) audioRef.current.volume = ratio;
          }}
        >
          <div 
            className="h-full bg-white group-hover:bg-[#1ed760] rounded-full relative transition-colors"
            style={{ width: `${volume * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow"></div>
          </div>
        </div>
      </div>

    </footer>
  );
}
