"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  ScrollText,
  Bookmark,
  Bell,
  GitCompare,
  Settings,
  Search,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Search",     href: "/search",     icon: Search },
  { label: "Dashboard",  href: "/dashboard",  icon: LayoutDashboard },
  { label: "Workflows",  href: "/workflows",  icon: Kanban },
  { label: "Audit Trail",href: "/audit",      icon: ScrollText },
  { label: "Watchlist",  href: "/watchlist",  icon: Bookmark },
  { label: "Alerts",     href: "/alerts",     icon: Bell },
  { label: "Compare",    href: "/compare",    icon: GitCompare },
  { label: "Settings",   href: "/settings",   icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col bg-slate-950 text-white z-40">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight">Priori</span>
          <span className="ml-1.5 rounded-full bg-indigo-900/60 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
            BETA
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname.startsWith("/dashboard")
              : pathname === href || pathname.startsWith(href + "/");

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-800 px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-indigo-300">J</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-200">Jason Abhishek</p>
            <p className="truncate text-[10px] text-slate-500">Free plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
