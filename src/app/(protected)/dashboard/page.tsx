/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/server/auth-actions";
import { authClient } from "@/lib/auth-client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Update type to match Better Auth's user structure
type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      try {
        const { data } = await authClient.getSession();
        setUser(data?.user || null);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user:", error);
        setIsLoading(false);
      }
    }
    
    getUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Error signing out:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-8 text-white"
      >
        <h1 className="mb-6 text-4xl font-bold">Welcome to your Dashboard</h1>
        <p className="mb-8 text-xl">
          {user?.name ? `Hello, ${user.name}!` : "Hello there!"}
        </p>
        
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={handleSignOut}
            variant="secondary"
            className="transition-all hover:scale-105 hover:shadow-lg"
          >
            Sign Out
          </Button>
        </div>
      </motion.div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="overflow-hidden rounded-2xl bg-white p-8 shadow-lg dark:bg-zinc-800"
          >
            <h2 className="mb-4 text-2xl font-semibold">Dashboard Card {i}</h2>
            <p>This is a protected page. Only authenticated users can see this.</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 