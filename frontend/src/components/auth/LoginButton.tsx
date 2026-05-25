"use client";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { LogIn, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginButton() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) return <div className="text-sm text-[#b3b3b3] animate-pulse">Loading...</div>;

  if (user) {
    const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

    return (
      <div className="flex items-center gap-3 w-full">
        <Link href="/settings" className="flex items-center gap-3 flex-1 overflow-hidden hover:opacity-80 transition-opacity">
          <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full shrink-0 bg-[#282828]" />
          <div className="flex-1 truncate">
            <div className="text-sm font-semibold truncate hover:underline">
              {user.displayName || user.email?.split("@")[0] || "User"}
            </div>
          </div>
        </Link>
        <button onClick={handleLogout} className="text-[#b3b3b3] hover:text-white transition-colors shrink-0" title="Logout">
          <LogOut size={20} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="flex items-center justify-center gap-2 w-full bg-white text-black font-bold py-2 px-4 rounded-full hover:scale-105 transition-transform"
    >
      <LogIn size={20} />
      <span>Log in</span>
    </button>
  );
}
