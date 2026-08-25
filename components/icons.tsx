import type { SVGProps } from "react";

/**
 * Priori's own icon family.
 *
 * House style — deliberately not Lucide:
 *  · 24-grid, 2px strokes, round joins
 *  · every mark carries one *filled* element (a solid square, dot, or bar) as
 *    the family signature, so the set reads as duotone rather than thin outline
 *  · shapes lean geometric + data-referencing (bars, cells, signals) because
 *    the subject is measurement of public feedback
 *
 * All marks paint with `currentColor`, so existing text-color classes drive
 * them in both the dark sidebar and light chrome.
 */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/* Overview — four cells, one filled (the thing needing attention) */
export function OverviewIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </Svg>
  );
}

/* Companies — a building block with one lit window */
export function CompaniesIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14" />
      <path d="M16 10h1a2 2 0 0 1 2 2v8" />
      <path d="M3 20h18" />
      <rect x="8" y="7" width="2.5" height="2.5" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* Workflows — three columns of work, the active one topped with a filled tile */
export function WorkflowsIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="4" width="4.5" height="16" rx="1.5" />
      <rect x="9.75" y="4" width="4.5" height="10" rx="1.5" />
      <rect x="9.75" y="4" width="4.5" height="4" rx="1.5" fill="currentColor" stroke="none" />
      <rect x="15.5" y="4" width="4.5" height="13" rx="1.5" />
    </Svg>
  );
}

/* Audit — a record with ruled lines and a stamped mark */
export function AuditIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M13 3v5h5" />
      <path d="M8.5 13h6" />
      <path d="M8.5 16.5h4" />
      <circle cx="9" cy="9.5" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* Watchlist — a bookmark being kept, with a filled notch */
export function WatchlistIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 4h12v16l-6-4-6 4V4Z" />
      <path d="M9 4h6v4l-3-2-3 2V4Z" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* Alerts — a rising signal, not a bell: concentric pings + a solid source */
export function AlertsIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="17" r="2" fill="currentColor" stroke="none" />
      <path d="M8.5 13.5a5 5 0 0 1 7 0" />
      <path d="M6 11a8.5 8.5 0 0 1 12 0" />
    </Svg>
  );
}

/* Compare — two measured bars set side by side, one filled */
export function CompareIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 20h16" />
      <rect x="6" y="9" width="4.5" height="9" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="4.5" height="13" rx="1" />
    </Svg>
  );
}

/* Settings — control sliders, with one filled knob */
export function SettingsIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <circle cx="16" cy="7" r="2.2" fill="currentColor" stroke="none" />
      <path d="M4 17h4" />
      <path d="M12 17h8" />
      <circle cx="10" cy="17" r="2.2" />
    </Svg>
  );
}

/* Search — a lens with a solid pivot at the handle joint */
export function SearchIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-3.5-3.5" />
      <circle cx="11" cy="11" r="1.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/* Close — a plain cross, sharp on purpose */
export function CloseIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Svg>
  );
}
