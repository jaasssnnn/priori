import type { Metadata } from "next";
import WorkflowsClient from "./WorkflowsClient";

export const metadata: Metadata = { title: "Workflows" };

export default function WorkflowsPage() {
  return <WorkflowsClient />;
}
