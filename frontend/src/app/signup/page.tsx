"use client";
import { signInWithPopup, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

export default function SignupPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getSimplifiedError = (error: any) => {
    const code = error.code || "";
    if (code === "auth/email-already-in-use") return "An account with this email already exists.";
    if (code === "auth/weak-password") return "Password should be at least 6 characters.";
    if (code === "auth/invalid-email") return "Please enter a valid email address.";
    if (code === "auth/popup-closed-by-user") return "Google sign-in was cancelled.";
    if (code === "auth/network-request-failed") return "Network error. Please check your connection.";
    return "An unexpected error occurred. Please try again.";
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(getSimplifiedError(error));
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });
      toast.success("Account created successfully!");
    } catch (err: any) {
      toast.error(getSimplifiedError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex-1 overflow-y-auto flex items-center justify-center p-6 min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/auth_bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-0"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-black/70 backdrop-blur-md p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/10 my-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-4xl font-bold mb-2 tracking-tighter">Bellard</h1>
          <p className="text-[#b3b3b3] font-medium text-center">Sign up for free to start listening.</p>
        </div>

        <button 
          onClick={handleGoogleAuth}
          className="flex items-center justify-center gap-3 w-full bg-white text-black font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform mb-6"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span>Sign up with Google</span>
        </button>

        <div className="relative flex py-5 items-center mb-4">
          <div className="flex-grow border-t border-[#282828]"></div>
          <span className="flex-shrink-0 mx-4 text-[#b3b3b3] text-sm font-semibold uppercase">Or</span>
          <div className="flex-grow border-t border-[#282828]"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">What should we call you?</label>
            <input 
              type="text" 
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full bg-[#121212] border border-[#727272] hover:border-white focus:border-white outline-none rounded p-3 text-white transition-colors"
              placeholder="Profile Name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">What's your email?</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#121212] border border-[#727272] hover:border-white focus:border-white outline-none rounded p-3 text-white transition-colors"
              placeholder="Enter your email."
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Create a password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-[#121212] border border-[#727272] hover:border-white focus:border-white outline-none rounded p-3 text-white transition-colors"
              placeholder="Create a password."
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-[#1ed760] text-black font-bold py-3 px-4 rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? "Please wait..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <span className="text-[#b3b3b3]">Already have an account?</span>
          <Link href="/login" className="ml-2 text-white font-bold hover:underline hover:text-[#1ed760] transition-colors">
            Log in here.
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
