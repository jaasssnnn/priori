"use client";

import { Search, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/providers/AppProvider";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

export default function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { unreadAlertCount } = useApp();
  const user = useCurrentUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Demo User";

  const initial = displayName[0]?.toUpperCase() ?? "D";

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/companies?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }

  return (
    <header className="fixed left-60 right-0 top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a company or app…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-[#f0f4f2] pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-[#1a3a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/10 transition-colors"
          />
        </div>
      </form>

      {/* Right side — bell + user */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/alerts")}
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label={`Alerts${unreadAlertCount > 0 ? ` (${unreadAlertCount} unread)` : ""}`}
        >
          <Bell className="h-4 w-4" />
          {unreadAlertCount > 0 && (
            <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#1a3a2e] flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">{initial}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-800 leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{user?.email ?? "demo@priori.app"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
