"use client";

import { Loader } from "@/components/Loader";
import ShinyText from "@/components/ui/shiny-text";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { HeroHeader } from '@/components/hero9-header'
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await authClient.getSession();
        setIsAuthenticated(!!data);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated) {
      router.push("/login");
    }
  }, [isCheckingAuth, isAuthenticated, router]);

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <Loader />
        <ShinyText text="Authenticating..." speed={3} />
      </div>
    );
  }

  return (
    <>
     
      {/* <HeroHeader/> */}
      {children}
     
    </>
  );
}