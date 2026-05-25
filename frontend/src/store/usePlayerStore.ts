import { create } from 'zustand';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl?: string;
  streamUrl: string;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  queue: Song[];
  setCurrentSong: (song: Song) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setQueue: (queue: Song[]) => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  volume: 1,
  progress: 0,
  queue: [],
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),
  setQueue: (queue) => set({ queue }),
  playNext: () => set((state) => {
    if (state.queue.length === 0) return state;
    
    // Find current index in queue
    const currentIndex = state.queue.findIndex(s => s.id === state.currentSong?.id);
    
    let nextSong;
    if (currentIndex === -1 || currentIndex === state.queue.length - 1) {
      // If not in queue or at end of queue, loop back to start
      nextSong = state.queue[0];
    } else {
      nextSong = state.queue[currentIndex + 1];
    }
    
    return { currentSong: nextSong, isPlaying: true, progress: 0 };
  }),
  playPrevious: () => set((state) => {
    if (state.queue.length === 0) return state;
    
    // If progress > 3 seconds, just restart the current song
    if (state.progress > 3) {
      return { progress: 0 };
    }
    
    const currentIndex = state.queue.findIndex(s => s.id === state.currentSong?.id);
    
    let prevSong;
    if (currentIndex <= 0) {
      // Loop to end
      prevSong = state.queue[state.queue.length - 1];
    } else {
      prevSong = state.queue[currentIndex - 1];
    }
    
    return { currentSong: prevSong, isPlaying: true, progress: 0 };
  })
}));
