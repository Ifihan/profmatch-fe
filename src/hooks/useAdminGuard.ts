"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context";

export function useAdminGuard() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!user?.is_admin) {
      router.replace("/dashboard");
    } else {
      setIsReady(true);
    }
  }, [isAuthenticated, isLoading, user, router]);

  return { isReady };
}
