"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const { setUser, setIsLoading, setAuthReady } = useAuthStore.getState();
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providers: user.providerData.map(p => p.providerId),
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []); // empty deps — subscribe once on mount, unsubscribe on unmount

  return <>{children}</>;
}
