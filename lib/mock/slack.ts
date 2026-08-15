import type { SlackConnection } from "@/types";

export const MOCK_SLACK_CONNECTION: SlackConnection = {
  id: "slack-conn-001",
  user_id: "demo-user",
  team_id: "T0MOCK1234",
  team_name: "Priori Demo Workspace",
  access_token: "xoxb-mock-token-not-real",
  default_channel: "C0MOCK0001",
  created_at: "2026-08-01T00:00:00Z",
  channels: [
    { id: "C0MOCK0001", name: "payments-ops" },
    { id: "C0MOCK0002", name: "growth-product" },
    { id: "C0MOCK0003", name: "kyc-ops" },
    { id: "C0MOCK0004", name: "android-perf" },
    { id: "C0MOCK0005", name: "cx-ops" },
    { id: "C0MOCK0006", name: "alerts-feed" },
    { id: "C0MOCK0007", name: "general" },
  ],
};
