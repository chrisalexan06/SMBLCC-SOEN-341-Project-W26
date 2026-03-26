"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

export function UserSync() {
  const { isLoaded, userId } = useAuth();

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const syncUser = async () => {
      try {
        const res = await fetch("/api/user/sync", {
          method: "POST",
        });
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Failed to sync user:", errorData);
        }
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [isLoaded, userId]);

  return null;
}
