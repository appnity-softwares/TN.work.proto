"use client";

import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/session"); // <-- your custom endpoint
        if (!res.ok) return;

        const data = await res.json();
        setUser(data.user || null);
      } catch (err) {
        console.error("Failed to load current user:", err);
      }
    }

    load();
  }, []);

  return user;
}
