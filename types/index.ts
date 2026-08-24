// ─── Shared enums ────────────────────────────────────────────────────────────

export type { Industry } from "@/lib/industries";

export type DataSource = "play_store" | "app_store" | "reddit" | "twitter" | "instagram" | "youtube" | "facebook";

export type ActionItemStatus = "open" | "in_progress" | "resolved" | "closed";

export type AuditDecision = "acted_on" | "deprioritized" | "deferred";

export type AlertType = "spike" | "new_trend";

export type AlertFrequency = "instant" | "daily_digest";

export type PriorityBand = "critical" | "high" | "medium" | "low";

// ─── Core entities (mirror DB schema from documentation) ─────────────────────

export interface Company {
  id: string;
  user_id: string;
  app_id: string;        // Google Play package name, e.g. "com.dreamplug.androidapp"
  app_store_id: string;  // Apple App Store numeric ID
  name: string;
  icon_url: string;
  added_at: string;      // timestamptz ISO string
  industry?: import("@/lib/industries").Industry;
  product_type?: string; // e.g. "Mobile app", "Web platform"
  // denormalised for display
  developer?: string;
  avg_rating?: number;
  install_count?: string;
}

export interface Quote {
  text: string;
  source: DataSource;
  url?: string;
  date: string;          // ISO date string
  rating?: number;       // 1-5, only for app store reviews
  author?: string;
}

export interface ComplaintCategory {
  name: string;
  score: number;              // 0-100, computed by scoring formula
  complaint_count: number;
  avg_severity: number;       // 0-1
  /** Whether this category has elevated risk relevance (replaces finance-only regulatory_flag). */
  risk_relevance: boolean;
  /** Specific risk dimensions applicable to this category (e.g. "Payments", "Delivery reliability"). */
  risk_dimensions?: string[];
  quotes: Quote[];            // top 3+ representative quotes
  ai_recommendation: string;
  source_breakdown?: Partial<Record<DataSource, number>>;
  /** Canonical taxonomy category if different from AI-generated name. */
  canonical_category?: string;
  /** Confidence in the AI classification (0–1). */
  confidence?: number;
  /** @deprecated use risk_relevance */
  regulatory_flag?: boolean;
}

export interface SentimentTrendPoint {
  week: string;          // ISO date of week start (Monday)
  score: number;         // 0-1, higher = more negative
  review_count: number;
}

export interface AISummary {
  health_assessment: string;
  urgent_problem: string;
  improving: string;
}

export interface Snapshot {
  id: string;
  company_id: string;
  health_score: number;        // 0-100 (inverse of complaint severity)
  categories: ComplaintCategory[];
  review_count: number;
  avg_rating: number;          // 1-5
  source_breakdown: Record<DataSource, number>;
  rating_distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
  sentiment_trend: SentimentTrendPoint[];
  ai_summary: AISummary;
  created_at: string;          // timestamptz ISO string
}

export interface ActionItem {
  id: string;
  company_id: string;
  user_id: string;
  category_name: string;
  owner: string;
  deadline: string;            // date ISO string
  status: ActionItemStatus;
  resolution_steps: string;
  slack_channel: string;       // Slack channel ID or "#channel-name"
  slack_message_ts?: string;   // Slack message timestamp for threading updates
  created_at: string;
  resolved_at?: string;
  // denormalised for display
  company_name?: string;
  company_icon?: string;
  priority_score?: number;
}

export interface AuditEntry {
  id: string;
  company_id: string;
  user_id: string;
  category_name: string;
  decision: AuditDecision;
  reasoning: string;
  decided_by: string;
  created_at: string;
  // denormalised for display
  company_name?: string;
  company_icon?: string;
  priority_score?: number;
}

export interface Alert {
  id: string;
  company_id: string;
  user_id: string;
  type: AlertType;
  message: string;
  read: boolean;
  email_sent: boolean;
  slack_sent: boolean;
  created_at: string;
  // denormalised for display
  company_name?: string;
  company_icon?: string;
  category_name?: string;
  change_percent?: number;     // for spike alerts
}

export interface SlackConnection {
  id: string;
  user_id: string;
  team_id: string;
  team_name: string;
  access_token: string;
  default_channel: string;
  created_at: string;
  channels?: SlackChannel[];   // available channels for picker
}

export interface SlackChannel {
  id: string;
  name: string;
}

export interface NotificationPreferences {
  user_id: string;
  email_enabled: boolean;
  slack_enabled: boolean;
  email_address: string;
  alert_frequency: AlertFrequency;
}

// ─── Derived / display types ─────────────────────────────────────────────────

export interface WatchlistEntry {
  company: Company;
  latest_snapshot: Snapshot;
  previous_snapshot?: Snapshot;
  trend: "improving" | "stable" | "worsening";
  unread_alerts: number;
}

// ─── Slack Block Kit types ────────────────────────────────────────────────────

export interface SlackTextObject {
  type: "plain_text" | "mrkdwn";
  text: string;
}

export interface SlackSectionBlock {
  type: "section";
  text?: SlackTextObject;
  fields?: SlackTextObject[];
}

export interface SlackHeaderBlock {
  type: "header";
  text: SlackTextObject;
}

export interface SlackDividerBlock {
  type: "divider";
}

export interface SlackActionsBlock {
  type: "actions";
  elements: Array<{
    type: "button";
    text: SlackTextObject;
    url?: string;
    action_id?: string;
    style?: "primary" | "danger";
  }>;
}

export type SlackBlock =
  | SlackSectionBlock
  | SlackHeaderBlock
  | SlackDividerBlock
  | SlackActionsBlock;

export interface SlackMessage {
  text: string;   // plain-text fallback for notifications
  blocks: SlackBlock[];
}

// ─── Comparison ──────────────────────────────────────────────────────────────

export interface ComparisonResult {
  companies: Company[];
  snapshots: Snapshot[];
  shared_categories: string[];
  ai_insight: string;
}
