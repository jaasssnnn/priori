"use client";

import { Search, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useApp } from "@/providers/AppProvider";

export default function Topbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { unreadAlertCount } = useApp();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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
            placeholder="Search any company…"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>
      </form>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/alerts")}
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label={`Alerts${unreadAlertCount > 0 ? ` (${unreadAlertCount} unread)` : ""}`}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadAlertCount > 0 && (
            <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
