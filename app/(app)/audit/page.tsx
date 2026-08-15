import type { Metadata } from "next";
import AuditClient from "./AuditClient";

export const metadata: Metadata = { title: "Audit Trail" };

export default function AuditPage() {
  return <AuditClient />;
}
