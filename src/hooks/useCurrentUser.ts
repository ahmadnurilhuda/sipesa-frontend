"use client";

import { currentUser } from "@/lib/auth";
import { User } from "@/types";
import { useEffect, useState } from "react";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(currentUser());
    setReady(true);
  }, []);

  return { user, ready };
}
