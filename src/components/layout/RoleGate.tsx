"use client";

import { currentUser } from "@/lib/auth";
import { canAccessRoute, defaultRouteForRole } from "@/lib/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function RoleGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(false);
    const user = currentUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canAccessRoute(user.role, pathname)) {
      router.replace(defaultRouteForRole(user.role));
      return;
    }
    setAllowed(true);
  }, [pathname, router]);

  if (!allowed) {
    return <div className="p-4 text-sm text-slate-500">Memeriksa akses...</div>;
  }

  return children;
}
