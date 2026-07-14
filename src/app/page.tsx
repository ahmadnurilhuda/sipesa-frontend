"use client";

import { currentUser } from "@/lib/auth";
import { defaultRouteForRole } from "@/lib/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const user = currentUser();
    router.replace(user ? defaultRouteForRole(user.role) : "/login");
  }, [router]);

  return <main className="p-4 text-sm text-slate-500">Memuat...</main>;
}
