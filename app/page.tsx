import type { Metadata } from "next";
import LoginClient from "./login/LoginClient";

export const metadata: Metadata = {
  title: "Priori: Know what users are saying, and what to fix first.",
};

export default function LandingPage() {
  return <LoginClient />;
}
