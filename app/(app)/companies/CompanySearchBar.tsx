"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface Props {
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export default function CompanySearchBar({
  placeholder = "Search for a company or app…",
  initialValue = "",
  className = "",
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/companies?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search for a company"
          className="h-9 w-60 rounded-lg border border-slate-200 bg-[#f0f4f2] pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-[#1a3a2e] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/10 transition-colors"
        />
      </div>
      <button
        type="submit"
        className="h-9 rounded-lg bg-[#1a3a2e] px-4 text-xs font-semibold text-white hover:bg-[#243f35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/40 shrink-0"
      >
        Search
      </button>
    </form>
  );
}
