"use client";
import { motion } from "framer-motion";

export default function LoadingScreen() {
  return (
    <div className="flex-1 h-screen w-full bg-black flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#282828] border-t-[#1ed760] rounded-full mb-6"
      />
      <h1 className="text-xl font-bold tracking-tighter text-white animate-pulse">Bellard</h1>
    </div>
  );
}
