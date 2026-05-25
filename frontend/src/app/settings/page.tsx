"use client";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setIsLoadingProfile(true);

    try {
      await updateProfile(auth.currentUser, { displayName });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !user?.email) return;

    setIsLoadingPassword(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      toast.success("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update password. Check current password.");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.replace("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  if (!user) return null;

  const isPasswordUser = user.providers.includes("password");
  const avatarUrl = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`;

  return (
    <div className="flex-1 overflow-y-auto p-8 text-white h-full max-w-4xl mx-auto pb-32">
      <h1 className="text-4xl font-bold mb-10 tracking-tight">Settings</h1>

      <div className="flex flex-col gap-10">
        
        {/* Profile Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-[#282828]">Profile</h2>
          <div className="flex items-start gap-8 bg-[#181818] p-6 rounded-lg">
            <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 bg-[#282828]">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <form onSubmit={handleUpdateProfile} className="flex-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-[#b3b3b3] mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#242424] border border-[#727272] hover:border-white focus:border-white outline-none rounded p-3 text-white transition-colors"
                  placeholder="Your Name"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoadingProfile}
                className="w-max bg-white text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
              >
                Save Profile
              </button>
            </form>
          </div>
        </motion.section>

        {/* Account Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-[#282828]">Account</h2>
          <div className="bg-[#181818] p-6 rounded-lg flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-[#b3b3b3] mb-2">Email Address</label>
              <input 
                type="email" 
                value={user.email || ""}
                disabled
                className="w-full bg-[#242424] border border-transparent rounded p-3 text-[#b3b3b3] opacity-70 cursor-not-allowed max-w-md"
              />
            </div>
            
            {isPasswordUser && (
              <div className="pt-4 border-t border-[#282828]">
                <h3 className="font-bold text-lg mb-4">Change Password</h3>
                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 max-w-md">
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-[#242424] border border-[#727272] hover:border-white focus:border-white outline-none rounded p-3 text-white transition-colors"
                    placeholder="Current Password"
                  />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                    required
                    className="w-full bg-[#242424] border border-[#727272] hover:border-white focus:border-white outline-none rounded p-3 text-white transition-colors"
                    placeholder="New Password"
                  />
                  <button 
                    type="submit"
                    disabled={isLoadingPassword}
                    className="w-max bg-white text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform disabled:opacity-50 mt-2"
                  >
                    Update Password
                  </button>
                </form>
              </div>
            )}
            
            <div className="pt-4 border-t border-[#282828]">
               <button 
                  onClick={handleLogout}
                  className="w-max bg-transparent border border-[#727272] text-white font-bold py-2 px-6 rounded-full hover:border-white hover:scale-105 transition-all"
                >
                  Log out everywhere
                </button>
            </div>
          </div>
        </motion.section>

        {/* Playback Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-[#282828]">Playback</h2>
          <div className="bg-[#181818] p-6 rounded-lg flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Audio Quality</h3>
                  <p className="text-sm text-[#b3b3b3]">Streams original FLAC/WAV directly from Drive when available.</p>
                </div>
                <select className="bg-[#242424] border border-[#727272] rounded p-2 text-white outline-none cursor-pointer">
                  <option>Very High (Original)</option>
                  <option>High</option>
                  <option>Normal</option>
                </select>
             </div>
             <div className="flex items-center justify-between pt-4 border-t border-[#282828]">
                <div>
                  <h3 className="font-bold text-white">Autoplay</h3>
                  <p className="text-sm text-[#b3b3b3]">Enjoy nonstop listening. When your audio ends, we'll play something similar.</p>
                </div>
                <div className="w-10 h-6 bg-[#1ed760] rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full"></div>
                </div>
             </div>
             <div className="flex items-center justify-between pt-4 border-t border-[#282828]">
                <div>
                  <h3 className="font-bold text-white">Gapless Playback</h3>
                  <p className="text-sm text-[#b3b3b3]">Allow gapless transitions between songs in a playlist.</p>
                </div>
                <div className="w-10 h-6 bg-[#1ed760] rounded-full relative cursor-pointer">
                   <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full"></div>
                </div>
             </div>
          </div>
        </motion.section>
        
        {/* Appearance Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-[#282828]">Appearance</h2>
          <div className="bg-[#181818] p-6 rounded-lg flex flex-col gap-6">
             <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white">Theme</h3>
                  <p className="text-sm text-[#b3b3b3]">Match the appearance of your device or enforce dark mode.</p>
                </div>
                <select className="bg-[#242424] border border-[#727272] rounded p-2 text-white outline-none cursor-pointer">
                  <option>Dark Mode</option>
                  <option>System Default</option>
                </select>
             </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
