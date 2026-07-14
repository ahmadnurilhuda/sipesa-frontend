"use client";

import { clearSession } from "@/lib/auth";
import { roleLabels } from "@/lib/constants";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LogOut, Menu, UserCog } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const router = useRouter();
  const { user, ready } = useCurrentUser();
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Buka menu" className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-sm font-semibold text-slate-900">{ready ? user?.name ?? "Pengguna" : "Memuat..."}</p>
          <p className="text-xs text-slate-500">{user ? roleLabels[user.role] : "Sesi aktif"}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={() => router.push("/profile")} title="Profil Saya">
          <UserCog className="mr-2 h-4 w-4" /> Profil
        </Button>
        <Button variant="secondary" onClick={() => { clearSession(); router.push("/login"); }} title="Keluar">
          <LogOut className="mr-2 h-4 w-4" /> Keluar
        </Button>
      </div>
    </header>
  );
}
