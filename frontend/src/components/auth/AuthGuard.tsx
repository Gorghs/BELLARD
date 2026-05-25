"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import LoadingScreen from "@/components/ui/LoadingScreen";
import Sidebar from "@/components/layout/Sidebar";
import MusicPlayer from "@/components/player/MusicPlayer";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, authReady } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (!authReady) return;
    if (!user && !isPublicRoute) {
      router.replace("/login");
    } else if (user && isPublicRoute) {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authReady, pathname]); // intentionally omit router & isPublicRoute — derived from pathname above

  // Wait for Firebase to finish initial hydration
  if (!authReady) {
    return <LoadingScreen />;
  }

  // Prevent flicker during redirects
  if (!user && !isPublicRoute) return <LoadingScreen />;
  if (user && isPublicRoute) return <LoadingScreen />;

  // Render Public Layout (Login/Signup) without Sidebar and Player
  if (isPublicRoute) {
    return (
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-black text-white">
        {children}
      </main>
    );
  }

  // Render Protected Layout
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-black text-white">
      <div className="flex flex-1 overflow-hidden p-2 gap-2">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-[#121212] rounded-lg">
          {children}
        </main>
      </div>
      <MusicPlayer />
    </div>
  );
}
