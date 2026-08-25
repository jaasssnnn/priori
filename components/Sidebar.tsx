"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, LayoutGroup } from "framer-motion";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import {
  OverviewIcon,
  CompaniesIcon,
  WorkflowsIcon,
  AuditIcon,
  WatchlistIcon,
  AlertsIcon,
  CompareIcon,
  SettingsIcon,
} from "@/components/icons";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Overview",    href: "/overview",   icon: OverviewIcon  },
  { label: "Companies",   href: "/companies",  icon: CompaniesIcon },
  { label: "Workflows",   href: "/workflows",  icon: WorkflowsIcon },
  { label: "Audit Trail", href: "/audit",      icon: AuditIcon     },
  { label: "Watchlist",   href: "/watchlist",  icon: WatchlistIcon },
  { label: "Alerts",      href: "/alerts",     icon: AlertsIcon    },
  { label: "Compare",     href: "/compare",    icon: CompareIcon   },
];

const generalNav = [
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

function NavLink({
  label,
  href,
  icon: Icon,
}: {
  label: string;
  href: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const active =
    href === "/overview"
      ? pathname === "/overview"
      : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "text-[#1a3a2e] font-semibold"
          : "text-white/60 hover:bg-[#243f35] hover:text-white"
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-lg bg-white"
          transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
        />
      )}
      <Icon className="relative z-10 h-4 w-4 shrink-0" />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  const user = useCurrentUser();

  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "You";
  const initial = displayName[0]?.toUpperCase() ?? "?";

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col bg-[#1a3a2e] text-white z-40">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#243f35]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#243f35]">
          <img src="/logo.png" alt="" className="h-5 w-5 invert" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight">Priori</span>
          <span className="ml-1.5 rounded-full bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-white/60">
            BETA
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <LayoutGroup>
          <div>
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/30">
              Intelligence
            </p>
            <div className="space-y-0.5">
              {mainNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 mt-5 px-3 text-[11px] font-semibold uppercase tracking-wide text-white/30">
              General
            </p>
            <div className="space-y-0.5">
              {generalNav.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>
          </div>
        </LayoutGroup>
      </nav>

      {/* Footer */}
      <div className="border-t border-[#243f35] px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">{displayName}</p>
            <p className="truncate text-[11px] text-white/40">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
