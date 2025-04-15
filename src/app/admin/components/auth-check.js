"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/app/lib/firebase";

export default function AuthCheck({ children }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("AuthCheck: Initializing authentication check...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("AuthCheck: User is authenticated.");
        setIsAuthenticated(true);
      } else {
        console.log("AuthCheck: User is not authenticated. Redirecting to login...");
        router.push("/admin/login");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
