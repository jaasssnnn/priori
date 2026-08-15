import type { Metadata } from "next";
import CompareClient from "./CompareClient";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return <CompareClient />;
}
