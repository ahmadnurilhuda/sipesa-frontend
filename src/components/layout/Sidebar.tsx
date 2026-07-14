"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { navItems } from "@/lib/navigation";
import { X } from "lucide-react";

type SidebarProps = {
  open?: boolean;
  onClose?: () => void;
};

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, ready } = useCurrentUser();
  const nav = user ? navItems.filter((item) => item.roles.includes(user.role)) : [];

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block">
        <SidebarContent nav={nav} ready={ready} pathname={pathname} />
      </aside>

      <div className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
        <button
          type="button"
          aria-label="Tutup menu"
          className={`absolute inset-0 bg-slate-950/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
        <aside className={`absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-lg font-bold text-ink">SIPESA</p>
              <p className="text-xs text-slate-500">SMP POMOSDA</p>
            </div>
            <button type="button" aria-label="Tutup menu" className="rounded-md p-2 text-slate-500 hover:bg-slate-100" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
          <SidebarContent nav={nav} ready={ready} pathname={pathname} onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}

function SidebarContent({ nav, ready, pathname, onNavigate }: { nav: ReturnType<typeof navItems.filter>; ready: boolean; pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="hidden border-b border-slate-200 px-5 py-4 md:block">
        <p className="text-lg font-bold text-ink">SIPESA</p>
        <p className="text-xs text-slate-500">SMP POMOSDA</p>
      </div>
      <nav className="space-y-1 p-3">
        {ready && nav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link key={item.href} href={item.href} onClick={onNavigate} className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${active ? "bg-teal-50 text-primary" : "text-slate-600 hover:bg-slate-50"}`}>
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
