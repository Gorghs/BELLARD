import type { Metadata } from "next";
import "./globals.css";
import AuthWrapper from "@/components/auth/AuthWrapper";
import AuthGuard from "@/components/auth/AuthGuard";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Bellard - Open Source Music Streaming",
  description: "A premium open-source personal music streaming platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="flex flex-col h-screen overflow-hidden bg-black text-white" suppressHydrationWarning>
        <AuthWrapper>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthWrapper>
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
