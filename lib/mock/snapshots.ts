import type { Snapshot, DataSource } from "@/types";
import { MOCK_COMPANIES } from "@/lib/mock/companies";

// ─── CRED Snapshot ────────────────────────────────────────────────────────────

const CRED_SNAPSHOT: Snapshot = {
  id: "snap-cred-latest",
  company_id: "cred",
  health_score: 62,
  review_count: 4800,
  avg_rating: 3.8,
  source_breakdown: {
    play_store: 2400,
    app_store: 1100,
    reddit: 820,
    twitter: 480,
    instagram: 0,
    youtube: 0,
    facebook: 0,
  },
  rating_distribution: {
    "1": 720,
    "2": 384,
    "3": 576,
    "4": 1056,
    "5": 2064,
  },
  sentiment_trend: [
    { week: "2026-05-05", score: 0.41, review_count: 380 },
    { week: "2026-05-12", score: 0.43, review_count: 410 },
    { week: "2026-05-19", score: 0.45, review_count: 395 },
    { week: "2026-05-26", score: 0.44, review_count: 420 },
    { week: "2026-06-02", score: 0.47, review_count: 445 },
    { week: "2026-06-09", score: 0.51, review_count: 460 },
    { week: "2026-06-16", score: 0.53, review_count: 490 },
    { week: "2026-06-23", score: 0.50, review_count: 430 },
    { week: "2026-06-30", score: 0.48, review_count: 415 },
    { week: "2026-07-07", score: 0.52, review_count: 470 },
    { week: "2026-07-14", score: 0.55, review_count: 510 },
    { week: "2026-07-21", score: 0.58, review_count: 540 },
  ],
  ai_summary: {
    health_assessment:
      "CRED's overall health score of 62/100 indicates moderate user dissatisfaction, with complaints concentrated around payment failures and cashback redemption. The 3.8-star average masks a bimodal distribution — highly loyal users coexist with a vocal segment reporting critical payment issues. The trend is worsening: negative sentiment has increased 42% over the past 12 weeks.",
    urgent_problem:
      "Payment Failures are the single most urgent issue, accounting for 17% of all reviews and scoring 74/100 on the priority matrix. Users report bills being debited but biller portals not reflecting payment, causing late fees and credit score damage. This is a regulatory risk — NPCI mandates T+1 resolution for failed UPI transactions, and CRED is not consistently meeting this SLA based on review evidence.",
    improving:
      "UX and app stability complaints have trended down 15% over the past month, suggesting recent UI updates have been well-received. Onboarding friction complaints are also declining, likely due to the streamlined KYC flow shipped in June.",
  },
  categories: [
    {
      name: "Payment Failures",
      score: 74,
      complaint_count: 816,
      avg_severity: 0.75,
      risk_relevance: true,
      ai_recommendation:
        "Escalate to payments engineering immediately. Map failed transactions to specific biller IDs and UPI handles — CRED and ICICI Bank partnership issues appear in multiple reports. SLA breach risk exists under NPCI guidelines.",
      source_breakdown: { play_store: 420, app_store: 185, reddit: 142, twitter: 69, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Paid my HDFC credit card bill through CRED, money was debited but the bank says they never received it. It's been 5 days and customer support just keeps sending me automated emails.",
          source: "play_store",
          rating: 1,
          date: "2026-07-18",
        },
        {
          text: "CRED payment to Airtel broadband failed but amount deducted. Raised ticket 3 days ago, still no resolution. This is embarrassing for a premium fintech app. Uninstalling.",
          source: "play_store",
          rating: 1,
          date: "2026-07-20",
        },
        {
          text: "Lost ₹4,800 to a failed CRED payment. Money gone from my account, biller shows nothing paid. This is fraud territory at this point. Filing a complaint with RBI Banking Ombudsman.",
          source: "reddit",
          url: "https://reddit.com/r/CREDclub",
          date: "2026-07-15",
        },
        {
          text: "Payment failed but money deducted. Happened 3 times this month with different billers. CRED needs to fix their payment rails ASAP. @CRED_club @NPCI_BHIM sort this out",
          source: "twitter",
          date: "2026-07-22",
        },
      ],
    },
    {
      name: "Cashback & Rewards Issues",
      score: 67,
      complaint_count: 624,
      avg_severity: 0.62,
      risk_relevance: true,
      ai_recommendation:
        "Audit cashback crediting logic — the gap between 'offer shown' and 'cashback credited' is the core complaint. Regulatory risk: misleading promotions could attract ASCI/CCPA scrutiny. Publish a clear cashback T&C page and automate credit within 48 hours.",
      source_breakdown: { play_store: 310, app_store: 145, reddit: 118, twitter: 51, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "CRED showed 5% cashback on bill payment, I paid ₹12,000 expecting ₹600 back. After 2 weeks, only ₹150 was credited. The T&Cs changed after I made the payment. Feels like a bait-and-switch.",
          source: "play_store",
          rating: 2,
          date: "2026-07-12",
        },
        {
          text: "Coins expire too fast and the rewards are getting worse every month. I used to get good deals on CRED coins, now everything valuable requires 10x the coins. The whole value proposition is gone.",
          source: "app_store",
          rating: 2,
          date: "2026-07-08",
        },
        {
          text: "CRED travel cashback never arrived. Booked a flight, got a confirmation that 8% will be credited in 30 days. It's been 45 days and customer support says the offer was 'not applicable' on my card. Nobody told me this before I booked.",
          source: "reddit",
          url: "https://reddit.com/r/CREDclub",
          date: "2026-07-01",
        },
      ],
    },
    {
      name: "Customer Support",
      score: 56,
      complaint_count: 528,
      avg_severity: 0.68,
      risk_relevance: false,
      ai_recommendation:
        "First-response SLA appears to be the core failure — automate acknowledgement with a ticket ID and realistic resolution timeline. Add a live-chat option for payment failures specifically, as these have the highest severity and time sensitivity.",
      source_breakdown: { play_store: 265, app_store: 115, reddit: 98, twitter: 50, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Raised 4 support tickets in 2 weeks. All closed with 'resolved' status without anyone actually fixing the issue. Zero human interaction in any response. CRED customer support is a black hole.",
          source: "play_store",
          rating: 1,
          date: "2026-07-16",
        },
        {
          text: "The support bot gives circular answers. When I asked to speak to a human, it just repeated the same FAQ links. For a ₹2,000/year premium subscription, this support quality is insulting.",
          source: "app_store",
          rating: 1,
          date: "2026-07-10",
        },
        {
          text: "14 days to resolve a payment issue that should take 24 hours. Every day someone new picks up the ticket and asks me to explain everything from scratch. No ticket context is preserved between agents.",
          source: "reddit",
          url: "https://reddit.com/r/CREDclub",
          date: "2026-07-05",
        },
      ],
    },
    {
      name: "App Performance",
      score: 43,
      complaint_count: 384,
      avg_severity: 0.52,
      risk_relevance: false,
      ai_recommendation:
        "Profile app startup time — 'crash on open' is a common report. Android 14 compatibility issues appear in Play Store reviews. A targeted fix for Android 14+ devices could resolve 30-40% of performance complaints.",
      source_breakdown: { play_store: 225, app_store: 90, reddit: 45, twitter: 24, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "App crashes every time I try to make a payment on my Pixel 8. Updated to the latest version and the problem got worse. Crashes about 70% of the time on the payment confirmation screen.",
          source: "play_store",
          rating: 1,
          date: "2026-07-19",
        },
        {
          text: "App takes 8-10 seconds to load. After the last update it became incredibly slow. Other fintech apps (PhonePe, GPay) load in under 2 seconds. What happened to CRED?",
          source: "app_store",
          rating: 2,
          date: "2026-07-09",
        },
      ],
    },
    {
      name: "Account & KYC Issues",
      score: 63,
      complaint_count: 312,
      avg_severity: 0.58,
      risk_relevance: true,
      ai_recommendation:
        "KYC rejection reasons need to be specific and actionable. Users report being rejected with vague 'documents not matching' errors. Add a guided re-submission flow with specific field-level feedback. RBI mandates KYC completion within 15 days of flagging.",
      source_breakdown: { play_store: 168, app_store: 72, reddit: 52, twitter: 20, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Account suddenly blocked without notice. No email, no SMS, no reason given. Support says 'KYC re-verification required' but I verified 2 years ago and nothing changed. Stuck with ₹3,200 in CRED balance I can't access.",
          source: "play_store",
          rating: 1,
          date: "2026-07-11",
        },
        {
          text: "KYC rejected 3 times with zero explanation. The documents are the same ones I submitted when I signed up. Feels like the system is randomly failing.",
          source: "reddit",
          url: "https://reddit.com/r/CREDclub",
          date: "2026-07-03",
        },
      ],
    },
    {
      name: "UX / Interface Issues",
      score: 28,
      complaint_count: 240,
      avg_severity: 0.38,
      risk_relevance: false,
      ai_recommendation:
        "The redesigned home screen appears to be the main driver — users can't find features they previously relied on. Consider adding a 'quick actions' shortcut bar for the most-used flows.",
      source_breakdown: { play_store: 132, app_store: 60, reddit: 34, twitter: 14, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "The new redesign is terrible. I can't find the bill payment section without tapping through 3 menus. The old layout was so much better.",
          source: "play_store",
          rating: 2,
          date: "2026-07-14",
        },
      ],
    },
    {
      name: "Onboarding Friction",
      score: 22,
      complaint_count: 168,
      avg_severity: 0.35,
      risk_relevance: false,
      ai_recommendation:
        "Add a progress indicator to the sign-up flow — users don't know how many steps remain and abandon mid-way. The credit score eligibility check should surface before users invest time in onboarding.",
      source_breakdown: { play_store: 95, app_store: 42, reddit: 20, twitter: 11, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Spent 20 minutes on the sign-up only to be told my credit score wasn't high enough. This should be the very first thing they check.",
          source: "app_store",
          rating: 2,
          date: "2026-07-06",
        },
      ],
    },
    {
      name: "Data Privacy Concerns",
      score: 48,
      complaint_count: 120,
      avg_severity: 0.42,
      risk_relevance: true,
      ai_recommendation:
        "Users are concerned about CRED accessing full SMS history. Publish a clear data usage policy with granular permission controls. The DPDP Act 2023 requires explicit consent for each data category.",
      source_breakdown: { play_store: 65, app_store: 28, reddit: 18, twitter: 9, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Why does CRED need to read ALL my SMS messages? I only want to pay my credit card bill, not give them access to my OTPs and bank notifications.",
          source: "play_store",
          rating: 2,
          date: "2026-07-02",
        },
      ],
    },
  ],
  created_at: "2026-08-10T00:00:00Z",
};

// ─── PhonePe Snapshot ─────────────────────────────────────────────────────────

const PHONEPE_SNAPSHOT: Snapshot = {
  id: "snap-phonepe-latest",
  company_id: "phonepe",
  health_score: 55,
  review_count: 6200,
  avg_rating: 3.6,
  source_breakdown: {
    play_store: 3100,
    app_store: 1400,
    reddit: 1050,
    twitter: 650,
    instagram: 0,
    youtube: 0,
    facebook: 0,
  },
  rating_distribution: {
    "1": 1116,
    "2": 496,
    "3": 744,
    "4": 1364,
    "5": 2480,
  },
  sentiment_trend: [
    { week: "2026-05-05", score: 0.46, review_count: 490 },
    { week: "2026-05-12", score: 0.48, review_count: 510 },
    { week: "2026-05-19", score: 0.50, review_count: 525 },
    { week: "2026-05-26", score: 0.52, review_count: 540 },
    { week: "2026-06-02", score: 0.55, review_count: 565 },
    { week: "2026-06-09", score: 0.53, review_count: 545 },
    { week: "2026-06-16", score: 0.56, review_count: 570 },
    { week: "2026-06-23", score: 0.58, review_count: 590 },
    { week: "2026-06-30", score: 0.60, review_count: 610 },
    { week: "2026-07-07", score: 0.62, review_count: 625 },
    { week: "2026-07-14", score: 0.61, review_count: 615 },
    { week: "2026-07-21", score: 0.63, review_count: 640 },
  ],
  ai_summary: {
    health_assessment:
      "PhonePe's health score of 55/100 reflects persistent transaction failures on a platform handling 500M+ installs. With a 3.6-star average and worsening 12-week sentiment trend (up 37%), the primary risk is the combination of payment failures and KYC friction hitting the same user at account creation — a conversion funnel double-hit. Regulatory exposure on UPI failure SLAs is elevated.",
    urgent_problem:
      "Payment failures score 81/100 — the highest across all three benchmark companies. At a platform of PhonePe's scale, even a 1% failure rate represents millions of failed transactions. The failure pattern appears concentrated on specific bank integrations (SBI, Axis). Combined with a 60/100 customer support score, users have no recovery path when transactions fail, amplifying the severity.",
    improving:
      "App stability on iOS has improved markedly in the past 4 weeks — App Store crash reports are down 22%. The new biometric authentication flow has positive mentions in reviews, reducing onboarding friction complaints month-over-month.",
  },
  categories: [
    {
      name: "Payment Failures",
      score: 81,
      complaint_count: 1240,
      avg_severity: 0.82,
      risk_relevance: true,
      ai_recommendation:
        "Isolate failure by bank and UPI handle. SBI and Axis Bank integrations appear most affected based on review content. Implement retry logic with automatic T+1 reversal and proactive user SMS when a failure is detected server-side before users notice.",
      source_breakdown: { play_store: 640, app_store: 280, reddit: 210, twitter: 110, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Sent ₹15,000 to my landlord. PhonePe showed 'Payment Successful' but my landlord never received it. My bank confirmed debit. 5 days in and PhonePe support says 'transaction is under review'. I could be evicted because of this app.",
          source: "play_store",
          rating: 1,
          date: "2026-07-20",
        },
        {
          text: "Transaction failure rate is insane this month. Out of 8 transactions, 3 failed after the debit. All SBI account transfers. PhonePe clearly has an SBI integration issue they aren't acknowledging.",
          source: "reddit",
          url: "https://reddit.com/r/UPI",
          date: "2026-07-18",
        },
        {
          text: "Money stuck in PhonePe limbo for 7 days. NPCI says contact PhonePe. PhonePe says contact NPCI. Meanwhile my ₹8,000 is missing. @PhonePe @NPCI_BHIM this is unacceptable.",
          source: "twitter",
          date: "2026-07-22",
        },
        {
          text: "PhonePe charged me twice for a single grocery store transaction. Double debit. I've been fighting to get the second charge reversed for 2 weeks. Still pending.",
          source: "app_store",
          rating: 1,
          date: "2026-07-15",
        },
      ],
    },
    {
      name: "App Performance",
      score: 65,
      complaint_count: 930,
      avg_severity: 0.65,
      risk_relevance: false,
      ai_recommendation:
        "Crash analytics suggest Android 12-13 devices with < 4GB RAM are the most affected segment. Optimize memory footprint for mid-range devices — PhonePe's 500M install base is heavily mid-range Android. Performance on iOS has improved; Android is the gap.",
      source_breakdown: { play_store: 560, app_store: 165, reddit: 140, twitter: 65, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "App crashes exactly when I hit 'Pay'. Happened 4 times today. The crash is at the UPI PIN screen — terrifying because I don't know if the payment went through. Redmi Note 12, Android 13.",
          source: "play_store",
          rating: 1,
          date: "2026-07-21",
        },
        {
          text: "PhonePe takes 6-8 seconds to open on my Samsung A54. Used to be instant. Three updates ago something broke. Other UPI apps work fine on the same device.",
          source: "play_store",
          rating: 2,
          date: "2026-07-17",
        },
      ],
    },
    {
      name: "Customer Support",
      score: 60,
      complaint_count: 775,
      avg_severity: 0.70,
      risk_relevance: false,
      ai_recommendation:
        "The 72-hour first-response SLA for payment failures is too slow. NPCI mandates T+1 resolution. Add a 'Payment Help' fast-track in support that auto-escalates failed transactions to a human queue within 4 hours.",
      source_breakdown: { play_store: 400, app_store: 175, reddit: 130, twitter: 70, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Support chat just loops me through the same FAQ. 'Check your bank balance', 'Wait 24 hours', 'Contact your bank'. None of these help when the problem is clearly on PhonePe's end. 9 days without resolution.",
          source: "play_store",
          rating: 1,
          date: "2026-07-16",
        },
        {
          text: "Closed my ticket 3 times as 'resolved' without resolving anything. Re-opened it each time. The 4th time I tweeted at them and suddenly they called within 2 hours. Support only works if you threaten public exposure.",
          source: "reddit",
          url: "https://reddit.com/r/UPI",
          date: "2026-07-12",
        },
      ],
    },
    {
      name: "Account & KYC Issues",
      score: 58,
      complaint_count: 620,
      avg_severity: 0.61,
      risk_relevance: true,
      ai_recommendation:
        "UPI account linking failure with certain banks (PNB, UCO) is a recurring complaint. Proactively publish a bank compatibility list and offer workarounds. KYC re-verification loops need a human escalation path.",
      source_breakdown: { play_store: 330, app_store: 138, reddit: 105, twitter: 47, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Been trying to link my PNB account for 3 weeks. Always fails at OTP verification. PhonePe helpline says 'bank not supported' but their website lists PNB as supported. Complete misinformation.",
          source: "play_store",
          rating: 1,
          date: "2026-07-13",
        },
        {
          text: "Account locked during KYC update. ₹12,000 balance frozen. Support says 3-5 business days. It's been 12 business days. RBI escalation filed.",
          source: "reddit",
          url: "https://reddit.com/r/IndiaInvestments",
          date: "2026-07-08",
        },
      ],
    },
    {
      name: "Refund Issues",
      score: 52,
      complaint_count: 465,
      avg_severity: 0.60,
      risk_relevance: true,
      ai_recommendation:
        "Refund SLA is unclear to users — no proactive communication about expected timelines. Publish a refund status tracker in-app (like order tracking) and send SMS updates at each stage. RBI mandates refunds within 5 days.",
      source_breakdown: { play_store: 255, app_store: 100, reddit: 78, twitter: 32, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Cancelled a movie ticket on BookMyShow via PhonePe. Refund was supposed to come in 5-7 days. 18 days later, nothing. PhonePe says 'check with merchant', BookMyShow says 'check with payment gateway'. Classic pass-the-buck.",
          source: "play_store",
          rating: 1,
          date: "2026-07-14",
        },
      ],
    },
    {
      name: "UX / Interface Issues",
      score: 35,
      complaint_count: 310,
      avg_severity: 0.40,
      risk_relevance: false,
      ai_recommendation:
        "The revamped home screen has confused frequent users — key features like Recharge and Bills are harder to find. Add a 'quick actions' strip for the top 4 most-used features per user based on usage history.",
      source_breakdown: { play_store: 180, app_store: 72, reddit: 40, twitter: 18, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "The new design is too cluttered. PhonePe used to be clean and simple — now it looks like a shopping mall homepage. I just want to send money, not scroll past 10 offers.",
          source: "play_store",
          rating: 2,
          date: "2026-07-07",
        },
      ],
    },
    {
      name: "Data Privacy Concerns",
      score: 48,
      complaint_count: 210,
      avg_severity: 0.45,
      risk_relevance: true,
      ai_recommendation:
        "Permission requests for contacts and location without clear in-context explanation are the core complaint. Under DPDP Act 2023, each permission must have a specific, disclosed purpose. Update permission request dialogs with explicit use-case explanations.",
      source_breakdown: { play_store: 115, app_store: 48, reddit: 32, twitter: 15, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Why does PhonePe need access to my contacts to make a payment? I understand for 'pay by phone number' but it should be optional, not mandatory during setup.",
          source: "play_store",
          rating: 2,
          date: "2026-07-05",
        },
      ],
    },
    {
      name: "Onboarding Friction",
      score: 15,
      complaint_count: 140,
      avg_severity: 0.30,
      risk_relevance: false,
      ai_recommendation:
        "Onboarding drop-off at UPI PIN creation is a reported friction point. Add a clearer explanation of what UPI PIN is and why it's separate from the app PIN. A guided first-transaction flow post-setup would reduce abandonment.",
      source_breakdown: { play_store: 82, app_store: 32, reddit: 18, twitter: 8, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "So confused about UPI PIN vs app PIN vs bank PIN. Setup process explains nothing clearly. Had to call my bank to understand what 'debit card last 6 digits' means in this context.",
          source: "app_store",
          rating: 2,
          date: "2026-07-01",
        },
      ],
    },
  ],
  created_at: "2026-08-10T00:00:00Z",
};

// ─── Paytm Snapshot ──────────────────────────────────────────────────────────

const PAYTM_SNAPSHOT: Snapshot = {
  id: "snap-paytm-latest",
  company_id: "paytm",
  health_score: 41,
  review_count: 5100,
  avg_rating: 3.2,
  source_breakdown: {
    play_store: 2600,
    app_store: 1150,
    reddit: 890,
    twitter: 460,
    instagram: 0,
    youtube: 0,
    facebook: 0,
  },
  rating_distribution: {
    "1": 1275,
    "2": 612,
    "3": 561,
    "4": 918,
    "5": 1734,
  },
  sentiment_trend: [
    { week: "2026-05-05", score: 0.55, review_count: 425 },
    { week: "2026-05-12", score: 0.58, review_count: 445 },
    { week: "2026-05-19", score: 0.61, review_count: 460 },
    { week: "2026-05-26", score: 0.65, review_count: 490 },
    { week: "2026-06-02", score: 0.68, review_count: 510 },
    { week: "2026-06-09", score: 0.70, review_count: 530 },
    { week: "2026-06-16", score: 0.67, review_count: 505 },
    { week: "2026-06-23", score: 0.64, review_count: 480 },
    { week: "2026-06-30", score: 0.62, review_count: 465 },
    { week: "2026-07-07", score: 0.63, review_count: 472 },
    { week: "2026-07-14", score: 0.65, review_count: 488 },
    { week: "2026-07-21", score: 0.67, review_count: 502 },
  ],
  ai_summary: {
    health_assessment:
      "Paytm's health score of 41/100 is the lowest among the three benchmark companies, reflecting the sustained impact of RBI regulatory action on Paytm Payments Bank in early 2024 and ongoing user trust issues. Account and KYC complaints dominate the complaint mix at 88/100 — a critical score driven by account freezes, balance access issues, and confusion about the Paytm Bank vs Paytm App distinction. Recovery is slow: despite 6 months of operational adjustment, negative sentiment remains elevated at 0.67.",
    urgent_problem:
      "Account & KYC Issues score 88/100 — the most critical complaint category across all benchmarked companies. Users are reporting frozen balances, inability to withdraw Paytm Wallet funds, and forced KYC re-verification with unclear guidance. Several users report losing access to their money for weeks. This is an active regulatory compliance issue with direct financial harm to users, not a feature complaint.",
    improving:
      "App performance complaints have declined 28% over the past 8 weeks — the Android rebuild appears to be bearing fruit. Pricing and fee transparency has also improved slightly following the launch of the new fee disclosure page, with complaints in this category down 12% month-over-month.",
  },
  categories: [
    {
      name: "Account & KYC Issues",
      score: 88,
      complaint_count: 1428,
      avg_severity: 0.88,
      risk_relevance: true,
      ai_recommendation:
        "This is a crisis-level item, not a product backlog item. Assign a dedicated resolution squad for frozen account cases. Publish a public-facing status page for RBI compliance timelines. Each frozen account with user funds at risk should have a guaranteed 24-hour human response SLA, not the current 7-10 day queue.",
      source_breakdown: { play_store: 760, app_store: 315, reddit: 238, twitter: 115, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Paytm wallet has ₹7,500 that I cannot access. Account locked since Paytm Bank shutdown. Support says 'complete full KYC' but the KYC page throws an error every time. I've been trying for 3 months. This is theft.",
          source: "play_store",
          rating: 1,
          date: "2026-07-19",
        },
        {
          text: "After RBI action on Paytm Payments Bank, my auto-pay mandates all stopped. I got hit with late fees on 3 bills because Paytm didn't notify me that my bank was being shut down. Nobody told me anything.",
          source: "reddit",
          url: "https://reddit.com/r/india",
          date: "2026-07-16",
        },
        {
          text: "6 months since Paytm Bank shutdown and my ₹22,000 balance is STILL inaccessible. RBI, are you reading this? @RBI @Paytm #PaytmCrisis",
          source: "twitter",
          date: "2026-07-21",
        },
        {
          text: "KYC verification keeps failing with 'face not matching'. My Aadhaar photo is 10 years old. There's no alternative verification option. I'm completely stuck.",
          source: "app_store",
          rating: 1,
          date: "2026-07-14",
        },
      ],
    },
    {
      name: "Payment Failures",
      score: 79,
      complaint_count: 1020,
      avg_severity: 0.78,
      risk_relevance: true,
      ai_recommendation:
        "Since the Paytm Payments Bank wind-down, UPI transactions via Paytm are routing through Axis Bank — integration issues at this layer appear to be causing failures. Publish a clear FAQ on which bank now handles transactions and what users should do if payments fail.",
      source_breakdown: { play_store: 545, app_store: 225, reddit: 172, twitter: 78, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "UPI transaction failed but amount debited. Since Paytm switched from their own bank to Axis Bank, the failure rate has tripled. My last 10 transactions: 4 failed. That's 40% failure rate on a UPI app. Unacceptable.",
          source: "play_store",
          rating: 1,
          date: "2026-07-20",
        },
        {
          text: "Tried to pay electricity bill via Paytm. Money deducted. Bill not paid. Electricity board disconnected my supply. It's been 6 days and Paytm support has not resolved this. I have children at home.",
          source: "reddit",
          url: "https://reddit.com/r/LegalAdviceIndia",
          date: "2026-07-17",
        },
      ],
    },
    {
      name: "Refund Issues",
      score: 72,
      complaint_count: 765,
      avg_severity: 0.72,
      risk_relevance: true,
      ai_recommendation:
        "Refund timelines have worsened post-bank transition. The old Paytm Payments Bank refund pipeline no longer exists and the Axis Bank integration doesn't have equivalent speed. Commit to a published 3-day refund SLA for UPI failures and 7-day for merchant refunds, with in-app status tracking.",
      source_breakdown: { play_store: 410, app_store: 175, reddit: 130, twitter: 50, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Refund has been 'processing' for 19 days. Customer support copy-pastes 'refunds take 5-7 business days'. No escalation path exists. I have filed a complaint with RBI Ombudsman.",
          source: "play_store",
          rating: 1,
          date: "2026-07-18",
        },
        {
          text: "Movie booking refund — cancelled 2 hours before show, refund not received in 3 weeks. Paytm's refund system seems completely broken since the bank issue. This didn't happen before.",
          source: "app_store",
          rating: 1,
          date: "2026-07-11",
        },
      ],
    },
    {
      name: "Customer Support",
      score: 65,
      complaint_count: 612,
      avg_severity: 0.68,
      risk_relevance: false,
      ai_recommendation:
        "Support ticket volume has tripled since the regulatory action and team capacity hasn't scaled proportionally. Triage incoming tickets by financial impact — anyone with frozen funds above ₹1,000 gets a human agent within 4 hours. Use AI triage to detect these high-impact cases.",
      source_breakdown: { play_store: 328, app_store: 138, reddit: 105, twitter: 41, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Support chat is completely useless. Every message is a template. I've been escalating for 3 weeks and each 'escalation' just goes to another bot. I'm going to file in consumer court.",
          source: "play_store",
          rating: 1,
          date: "2026-07-15",
        },
      ],
    },
    {
      name: "Data Privacy Concerns",
      score: 58,
      complaint_count: 459,
      avg_severity: 0.60,
      risk_relevance: true,
      ai_recommendation:
        "Users are questioning what happened to their financial data after the RBI action on Paytm Bank. Publish a detailed data handling FAQ explaining what data is retained, where it's stored, and how users can request deletion under DPDP Act 2023.",
      source_breakdown: { play_store: 245, app_store: 105, reddit: 78, twitter: 31, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "With Paytm Bank shut down by RBI, where is my financial data now? Who has access to my transaction history? Nobody at Paytm will answer these questions.",
          source: "reddit",
          url: "https://reddit.com/r/india",
          date: "2026-07-10",
        },
        {
          text: "I want to delete my Paytm account and all associated data. The 'delete account' button does nothing. My data is sitting with a company that RBI has flagged. This is a serious concern.",
          source: "twitter",
          date: "2026-07-18",
        },
      ],
    },
    {
      name: "App Performance",
      score: 48,
      complaint_count: 408,
      avg_severity: 0.52,
      risk_relevance: false,
      ai_recommendation:
        "Performance is improving — keep the momentum from the Android rebuild. Focus next on reducing cold-start time, which users compare unfavourably to Google Pay and PhonePe.",
      source_breakdown: { play_store: 228, app_store: 95, reddit: 60, twitter: 25, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "App crashes randomly. Sometimes mid-transaction which is terrifying. Has gotten better in the last month but still happens too often.",
          source: "play_store",
          rating: 2,
          date: "2026-07-12",
        },
      ],
    },
    {
      name: "UX / Interface Issues",
      score: 30,
      complaint_count: 255,
      avg_severity: 0.38,
      risk_relevance: false,
      ai_recommendation:
        "The app tries to do too many things on one screen — mini-apps, shopping, banking, payments all compete for attention. Consider a clean 'Payments mode' toggle for users who just want UPI functionality without the superapp clutter.",
      source_breakdown: { play_store: 145, app_store: 60, reddit: 38, twitter: 12, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Paytm has become a shopping app that also does payments. I just want to send money. The home screen is an advertisement wall.",
          source: "play_store",
          rating: 2,
          date: "2026-07-06",
        },
      ],
    },
    {
      name: "Pricing & Fees",
      score: 47,
      complaint_count: 204,
      avg_severity: 0.42,
      risk_relevance: true,
      ai_recommendation:
        "Convenience fees on bill payments are the top pricing complaint. Competitors (CRED, PhonePe) don't charge these fees on many billers. If fees are necessary, ensure complete upfront disclosure before transaction confirmation — hidden fee reveals at the final step are a common complaint.",
      source_breakdown: { play_store: 112, app_store: 48, reddit: 32, twitter: 12, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        {
          text: "Why is Paytm charging a 'convenience fee' for electricity bill payment now? Every other app I've tried does this for free. Feels like they're trying to monetize during their crisis. Not acceptable.",
          source: "play_store",
          rating: 2,
          date: "2026-07-04",
        },
      ],
    },
  ],
  created_at: "2026-08-10T00:00:00Z",
};

// ─── Swiggy Snapshot (Food delivery) ─────────────────────────────────────────

const SWIGGY_SNAPSHOT: Snapshot = {
  id: "snap-swiggy-latest",
  company_id: "swiggy",
  health_score: 58,
  review_count: 7400,
  avg_rating: 3.9,
  source_breakdown: { play_store: 3800, app_store: 1600, reddit: 1400, twitter: 600, instagram: 0, youtube: 0, facebook: 0 },
  rating_distribution: { "1": 1110, "2": 592, "3": 888, "4": 1628, "5": 3182 },
  sentiment_trend: [
    { week: "2026-05-05", score: 0.38, review_count: 580 },
    { week: "2026-05-12", score: 0.41, review_count: 610 },
    { week: "2026-05-19", score: 0.44, review_count: 625 },
    { week: "2026-05-26", score: 0.46, review_count: 640 },
    { week: "2026-06-02", score: 0.48, review_count: 660 },
    { week: "2026-06-09", score: 0.51, review_count: 680 },
    { week: "2026-06-16", score: 0.53, review_count: 700 },
    { week: "2026-06-23", score: 0.55, review_count: 720 },
    { week: "2026-06-30", score: 0.52, review_count: 690 },
    { week: "2026-07-07", score: 0.54, review_count: 710 },
    { week: "2026-07-14", score: 0.57, review_count: 740 },
    { week: "2026-07-21", score: 0.59, review_count: 760 },
  ],
  ai_summary: {
    health_assessment:
      "Swiggy's observed public-feedback risk score of 58/100 reflects growing delivery-reliability complaints, with late deliveries and missing items accounting for 38% of all analyzed feedback. The 3.9-star average is respectable for a platform at this scale, but the 12-week sentiment trend shows a steady deterioration — negative sentiment has risen 55% since May, concentrated around peak-hour delivery failures. This score reflects publicly observable feedback only and is not a complete measure of operational performance.",
    urgent_problem:
      "Late deliveries score 76/100 and are the platform's most urgent public feedback signal. Users report estimated delivery times consistently undershooting by 20–40 minutes during peak hours (12–2 PM and 7–9 PM), with a recurring pattern of delivery partners marked as 'arrived' before food is ready. The combination of delivery delays and missing items is driving the most severe customer-trust complaints in the analyzed sample.",
    improving:
      "App performance and UI complaints have declined 18% over the past four weeks, suggesting the recent app update has improved the ordering experience. Discount and pricing complaints are also trending down, likely reflecting better offer communication in the latest version.",
  },
  categories: [
    {
      name: "Late deliveries",
      score: 76,
      complaint_count: 1480,
      avg_severity: 0.72,
      risk_relevance: true,
      risk_dimensions: ["Delivery reliability", "Customer trust"],
      ai_recommendation:
        "Audit delivery-time estimation accuracy for peak hours — ETA underestimation appears systematic. Consider dynamic buffer time based on restaurant preparation + real-time traffic, and proactively notify users when ETA shifts beyond 10 minutes.",
      source_breakdown: { play_store: 780, app_store: 320, reddit: 260, twitter: 120, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Ordered at 7:30 PM, app showed 35 mins. Delivery arrived at 9:15 PM — cold and incomplete. This happens every Friday. Swiggy's ETA is completely unreliable during dinner hours.", source: "play_store", rating: 1, date: "2026-07-19" },
        { text: "Order tracking showed 'delivered' but the delivery person was still 2km away. How is the app showing delivered before the food has left the restaurant area?", source: "reddit", url: "https://reddit.com/r/india", date: "2026-07-16" },
        { text: "3rd time this month getting a 30-min ETA that turned into 90 minutes. Swiggy's estimated time is a complete fiction. @Swiggy sort this out", source: "twitter", date: "2026-07-21" },
      ],
    },
    {
      name: "Missing or incorrect items",
      score: 68,
      complaint_count: 1110,
      avg_severity: 0.65,
      risk_relevance: true,
      risk_dimensions: ["Order accuracy", "Refunds", "Customer trust"],
      ai_recommendation:
        "Missing item complaints cluster around multi-restaurant orders. Add a mandatory item-count verification step for delivery partners before marking an order as picked up. The refund flow for missing items needs to be streamlined — users report 3–5 taps to report an issue.",
      source_breakdown: { play_store: 580, app_store: 240, reddit: 200, twitter: 90, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Out of 6 items in my order, 3 were missing. The refund process took 4 days and they only refunded 2 out of 3 missing items. No explanation for the third. Never ordering from Swiggy again.", source: "play_store", rating: 1, date: "2026-07-18" },
        { text: "Got someone else's order delivered to me. My food went to the wrong address. Swiggy support took 20 minutes to respond and couldn't reroute. Had to reorder and pay again.", source: "app_store", rating: 1, date: "2026-07-14" },
      ],
    },
    {
      name: "Refund delays",
      score: 61,
      complaint_count: 888,
      avg_severity: 0.60,
      risk_relevance: true,
      risk_dimensions: ["Refunds", "Customer trust"],
      ai_recommendation:
        "Refund SLA appears to be 5–7 days but users expect immediate resolution for clear issues (missing items, wrong order). Add instant credit for high-confidence cases and publish refund status tracking in the app.",
      source_breakdown: { play_store: 462, app_store: 190, reddit: 160, twitter: 76, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Swiggy approved my refund 8 days ago. Still not in my bank account. Support says 'bank processing time' but my other refunds from other apps arrive in 24 hours.", source: "play_store", rating: 2, date: "2026-07-17" },
      ],
    },
    {
      name: "Delivery partner issues",
      score: 54,
      complaint_count: 740,
      avg_severity: 0.55,
      risk_relevance: false,
      risk_dimensions: ["Partner reliability", "Customer trust"],
      ai_recommendation:
        "Multiple complaints about delivery partners calling to change the drop location or marking orders delivered without completing them. Add GPS verification for 'delivered' status to prevent false completions.",
      source_breakdown: { play_store: 390, app_store: 160, reddit: 130, twitter: 60, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Delivery guy called asking me to come downstairs. I live on the 12th floor with elderly parents. This is a premium building with a lobby — why is he refusing to deliver to the door?", source: "play_store", rating: 2, date: "2026-07-15" },
        { text: "Delivery partner marked order as delivered and then didn't deliver. No food, money deducted. This is theft. @Swiggy @SwiggySupport", source: "twitter", date: "2026-07-20" },
      ],
    },
    {
      name: "Customer support",
      score: 49,
      complaint_count: 592,
      avg_severity: 0.58,
      risk_relevance: false,
      risk_dimensions: ["Customer trust"],
      ai_recommendation:
        "Chat support resolution for order issues is taking too long. Add a one-tap 'Order Problem' button that immediately connects to a human for active orders, bypassing the chatbot flow.",
      source_breakdown: { play_store: 308, app_store: 130, reddit: 106, twitter: 48, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "The Swiggy chat support goes in circles. I tried to report a missing item and the bot kept asking me questions for 15 minutes without resolving it. No option to escalate to a human.", source: "app_store", rating: 1, date: "2026-07-12" },
      ],
    },
    {
      name: "Pricing and hidden charges",
      score: 42,
      complaint_count: 444,
      avg_severity: 0.48,
      risk_relevance: false,
      risk_dimensions: ["Pricing"],
      ai_recommendation:
        "Delivery fee and platform fee visibility is a recurring complaint. Show the full fee breakdown before the user reaches the checkout screen — surprise fees at checkout are the top trigger for cart abandonment complaints.",
      source_breakdown: { play_store: 232, app_store: 96, reddit: 80, twitter: 36, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Added ₹180 worth of food. Final bill: ₹310. Delivery fee, platform fee, rain surcharge, packaging fee. The extra charges are more than 70% of the food cost.", source: "play_store", rating: 2, date: "2026-07-10" },
      ],
    },
    {
      name: "App performance",
      score: 32,
      complaint_count: 296,
      avg_severity: 0.40,
      risk_relevance: false,
      risk_dimensions: [],
      ai_recommendation:
        "Crashes during checkout are the highest-severity performance complaint. Profile the payment confirmation screen specifically — this is where users report the most critical failures.",
      source_breakdown: { play_store: 158, app_store: 68, reddit: 50, twitter: 20, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "App crashes right after I enter my UPI PIN on the payment screen. Don't know if the payment went through. Happened twice this week.", source: "play_store", rating: 1, date: "2026-07-08" },
      ],
    },
  ],
  created_at: "2026-08-10T00:00:00Z",
};

// ─── Blinkit Snapshot (Quick commerce) ───────────────────────────────────────

const BLINKIT_SNAPSHOT: Snapshot = {
  id: "snap-blinkit-latest",
  company_id: "blinkit",
  health_score: 64,
  review_count: 5200,
  avg_rating: 4.1,
  source_breakdown: { play_store: 2700, app_store: 1150, reddit: 900, twitter: 450, instagram: 0, youtube: 0, facebook: 0 },
  rating_distribution: { "1": 624, "2": 416, "3": 728, "4": 1248, "5": 2184 },
  sentiment_trend: [
    { week: "2026-05-05", score: 0.32, review_count: 410 },
    { week: "2026-05-12", score: 0.34, review_count: 425 },
    { week: "2026-05-19", score: 0.36, review_count: 440 },
    { week: "2026-05-26", score: 0.38, review_count: 455 },
    { week: "2026-06-02", score: 0.40, review_count: 470 },
    { week: "2026-06-09", score: 0.43, review_count: 490 },
    { week: "2026-06-16", score: 0.45, review_count: 510 },
    { week: "2026-06-23", score: 0.44, review_count: 500 },
    { week: "2026-06-30", score: 0.42, review_count: 485 },
    { week: "2026-07-07", score: 0.44, review_count: 500 },
    { week: "2026-07-14", score: 0.46, review_count: 520 },
    { week: "2026-07-21", score: 0.48, review_count: 540 },
  ],
  ai_summary: {
    health_assessment:
      "Blinkit's observed public-feedback risk score of 64/100 is the strongest among the demo companies, reflecting its brand promise of 10-minute delivery — when it works. The 4.1-star average is high for the category. However, the 12-week trend shows steady deterioration: negative sentiment has risen 50% since May, driven almost entirely by delivery slots disappearing and item substitutions. This score reflects publicly observable feedback only.",
    urgent_problem:
      "Item unavailability and undisclosed substitutions score 71/100 and are the most urgent signal in the analyzed sample. Users report adding items to cart that show as available, then receiving substitutions (or nothing) without prior notice. This erodes the core value proposition of quick commerce — getting exactly what you ordered, fast.",
    improving:
      "App speed and checkout experience complaints have declined 22% over the past 6 weeks, suggesting recent performance improvements are working. Delivery partner issues, while present, are less frequent than on comparable platforms in the analyzed sample.",
  },
  categories: [
    {
      name: "Item unavailability and substitutions",
      score: 71,
      complaint_count: 936,
      avg_severity: 0.68,
      risk_relevance: true,
      risk_dimensions: ["Item availability", "Order accuracy", "Customer trust"],
      ai_recommendation:
        "Real-time inventory accuracy at dark-store level is the core problem. When an item is unavailable, the substitution decision should require explicit user confirmation before shipping — not an automatic swap the user discovers at delivery.",
      source_breakdown: { play_store: 490, app_store: 205, reddit: 162, twitter: 79, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Ordered 6 specific items. 4 were out of stock at delivery. Why does the app show items as available if they're not? I ordered from Blinkit specifically because my local store didn't have these.", source: "play_store", rating: 2, date: "2026-07-19" },
        { text: "Blinkit substituted my full-fat milk with skimmed milk without asking. I ordered full-fat for a reason. The substitution notification came after the delivery was already dispatched.", source: "reddit", url: "https://reddit.com/r/india", date: "2026-07-15" },
      ],
    },
    {
      name: "Delivery delays (promise vs reality)",
      score: 63,
      complaint_count: 780,
      avg_severity: 0.60,
      risk_relevance: true,
      risk_dimensions: ["Delivery speed", "Customer trust"],
      ai_recommendation:
        "The 10-minute promise is Blinkit's core brand claim. When dark stores are understaffed, slots show longer ETAs or fail to appear — users interpret this as the app being broken. Show a clear 'dark store busy' status rather than hiding slots entirely.",
      source_breakdown: { play_store: 406, app_store: 172, reddit: 136, twitter: 66, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "10-minute delivery took 47 minutes. I could have gone to the store and back. The ETA kept changing every 5 minutes. This defeats the entire point of Blinkit.", source: "play_store", rating: 1, date: "2026-07-18" },
        { text: "No delivery slots available in my area at 3 PM on a Tuesday. Not peak time, not raining. The app just shows 'no slots'. Zepto delivered in 12 minutes from the same area.", source: "twitter", date: "2026-07-20" },
      ],
    },
    {
      name: "Damaged or poor-quality products",
      score: 55,
      complaint_count: 624,
      avg_severity: 0.58,
      risk_relevance: false,
      risk_dimensions: ["Damaged products", "Order accuracy"],
      ai_recommendation:
        "Damaged packaging complaints cluster around fragile items (eggs, glass bottles, chips). Add a fragile-item flag that triggers special handling protocol at the dark store level, and include a damage photo in the delivery confirmation.",
      source_breakdown: { play_store: 325, app_store: 138, reddit: 108, twitter: 53, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Eggs delivered in a paper bag with grocery items stacked on top. 5 of 12 eggs broken. This is basic packaging — Blinkit needs to sort this out.", source: "play_store", rating: 1, date: "2026-07-16" },
      ],
    },
    {
      name: "Refund and credit issues",
      score: 47,
      complaint_count: 468,
      avg_severity: 0.52,
      risk_relevance: false,
      risk_dimensions: ["Refunds"],
      ai_recommendation:
        "Blinkit credits appear in the app wallet but users want bank refunds. Make the refund destination choice explicit at the point of claim — wallet credit vs. source account — to reduce post-refund frustration.",
      source_breakdown: { play_store: 244, app_store: 104, reddit: 82, twitter: 38, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Refund went to Blinkit wallet instead of my bank account. I specifically chose 'refund to source' in the app. Now my money is stuck in their wallet and I have to spend it on Blinkit.", source: "play_store", rating: 2, date: "2026-07-12" },
      ],
    },
    {
      name: "Customer support",
      score: 40,
      complaint_count: 364,
      avg_severity: 0.48,
      risk_relevance: false,
      risk_dimensions: ["Customer trust"],
      ai_recommendation:
        "Support response times for missing or wrong items are the top complaint. Add a 'Report Issue' button on the active-order screen that triggers an immediate review, rather than routing through the general support chat.",
      source_breakdown: { play_store: 190, app_store: 80, reddit: 64, twitter: 30, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Tried to report a missing item via chat. Bot asked the same questions 3 times, then said 'our team will review in 24 hours'. For a 10-minute delivery app, 24-hour support resolution is absurd.", source: "app_store", rating: 1, date: "2026-07-10" },
      ],
    },
    {
      name: "Pricing and surge fees",
      score: 33,
      complaint_count: 260,
      avg_severity: 0.40,
      risk_relevance: false,
      risk_dimensions: ["Pricing"],
      ai_recommendation:
        "Handling fees and surge pricing are the main pricing complaints. Show the handling fee breakdown before checkout, and notify users when surge pricing is active with an estimated return-to-normal time.",
      source_breakdown: { play_store: 136, app_store: 58, reddit: 44, twitter: 22, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "₹20 item with ₹35 handling fee and ₹25 delivery. The total fees are more than the product. Just order from Amazon at this point.", source: "play_store", rating: 2, date: "2026-07-08" },
      ],
    },
  ],
  created_at: "2026-08-10T00:00:00Z",
};

// ─── MakeMyTrip Snapshot (Travel) ─────────────────────────────────────────────

const MMT_SNAPSHOT: Snapshot = {
  id: "snap-makemytrip-latest",
  company_id: "makemytrip",
  health_score: 49,
  review_count: 6100,
  avg_rating: 3.7,
  source_breakdown: { play_store: 3100, app_store: 1400, reddit: 1050, twitter: 550, instagram: 0, youtube: 0, facebook: 0 },
  rating_distribution: { "1": 1098, "2": 488, "3": 732, "4": 1342, "5": 2440 },
  sentiment_trend: [
    { week: "2026-05-05", score: 0.44, review_count: 490 },
    { week: "2026-05-12", score: 0.47, review_count: 510 },
    { week: "2026-05-19", score: 0.50, review_count: 530 },
    { week: "2026-05-26", score: 0.53, review_count: 555 },
    { week: "2026-06-02", score: 0.55, review_count: 570 },
    { week: "2026-06-09", score: 0.57, review_count: 590 },
    { week: "2026-06-16", score: 0.60, review_count: 610 },
    { week: "2026-06-23", score: 0.58, review_count: 595 },
    { week: "2026-06-30", score: 0.56, review_count: 575 },
    { week: "2026-07-07", score: 0.58, review_count: 595 },
    { week: "2026-07-14", score: 0.61, review_count: 620 },
    { week: "2026-07-21", score: 0.63, review_count: 640 },
  ],
  ai_summary: {
    health_assessment:
      "MakeMyTrip's observed public-feedback risk score of 49/100 reflects a persistent refund and cancellation complaint cluster that has worsened over the 12-week analysis period — negative sentiment rose 43% since May. The 3.7-star average is consistent with category benchmarks but masks a bimodal split: users who book without issues rate highly, while users who face cancellations or refund issues rate 1 star. This score reflects publicly observable feedback only.",
    urgent_problem:
      "Cancellation and refund delays score 82/100 — the most critical signal in the analyzed sample. Users report initiated refunds remaining in 'processing' status for 15–30 days, with support providing scripted responses and no escalation path. The combination of high booking values and delayed refunds creates severe financial stress for affected users.",
    improving:
      "Hotel and homestay booking experience complaints have declined 14% over the past month, and the new property-verified badge appears to be reducing misleading listing complaints. App performance on iOS has also improved, with crash complaints down 20% since the last update.",
  },
  categories: [
    {
      name: "Cancellation and refund delays",
      score: 82,
      complaint_count: 1342,
      avg_severity: 0.82,
      risk_relevance: true,
      risk_dimensions: ["Cancellation", "Refunds", "Customer trust"],
      ai_recommendation:
        "Publish a real-time refund status tracker in the app, showing each stage of processing. For airline cancellations where the airline has already processed the refund, MakeMyTrip's platform delay becomes the visible bottleneck — proactively communicate when funds have been received from the airline and when users can expect them in their account.",
      source_breakdown: { play_store: 700, app_store: 295, reddit: 234, twitter: 113, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Flight cancelled by airline. MakeMyTrip says refund in 7–10 business days. It's been 23 business days. Support just copies and pastes the same message. ₹28,000 stuck.", source: "play_store", rating: 1, date: "2026-07-20" },
        { text: "Hotel cancelled my booking 3 hours before check-in. MakeMyTrip refund is 'processing' for 19 days. Had to book an emergency hotel at double the rate. MMT owes me compensation, not just a refund.", source: "reddit", url: "https://reddit.com/r/india", date: "2026-07-17" },
        { text: "Refund promised in 5–7 days. Now on day 28. Every customer support rep gives a different timeline. @MakeMyTrip this is not acceptable. Consumer forum complaint filed.", source: "twitter", date: "2026-07-22" },
      ],
    },
    {
      name: "Booking failures and errors",
      score: 70,
      complaint_count: 976,
      avg_severity: 0.70,
      risk_relevance: true,
      risk_dimensions: ["Booking reliability", "Refunds"],
      ai_recommendation:
        "Double-charge complaints on booking failures are the most severe variant. Implement idempotency at the payment layer — if a booking fails after payment deduction, automatically initiate the refund without requiring user action. Add a 'Booking Status' screen that persists even after app restart.",
      source_breakdown: { play_store: 508, app_store: 220, reddit: 172, twitter: 76, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Payment went through twice for one flight booking. One confirmed, one failed. Two debits from my account. MakeMyTrip showing only one booking. Where's my second deduction?", source: "play_store", rating: 1, date: "2026-07-19" },
        { text: "Booking showed 'confirmed' then disappeared from My Trips 30 minutes later. Called airline directly — no booking exists. Lost ₹12,000 and my travel dates.", source: "app_store", rating: 1, date: "2026-07-15" },
      ],
    },
    {
      name: "Customer support",
      score: 65,
      complaint_count: 854,
      avg_severity: 0.68,
      risk_relevance: false,
      risk_dimensions: ["Customer trust"],
      ai_recommendation:
        "Support agents appear to have limited authorization to resolve issues — they can only escalate to a 'senior team' that users never hear back from. Increase frontline resolution authority for clear-cut cases (confirmed cancellations, payment errors) to reduce multi-touch resolution times.",
      source_breakdown: { play_store: 444, app_store: 188, reddit: 149, twitter: 73, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "14 calls to customer care about a refund. Each time I'm told 'we've escalated, expect a call in 24 hours'. I've been waiting 3 weeks. The escalation team doesn't exist.", source: "play_store", rating: 1, date: "2026-07-16" },
      ],
    },
    {
      name: "Misleading pricing",
      score: 58,
      complaint_count: 671,
      avg_severity: 0.58,
      risk_relevance: true,
      risk_dimensions: ["Pricing transparency", "Customer trust"],
      ai_recommendation:
        "Price shown in search vs final checkout differs significantly in user complaints, driven by taxes and service fees added only at checkout. Show the all-inclusive price from the first search result to eliminate surprise at checkout.",
      source_breakdown: { play_store: 350, app_store: 150, reddit: 117, twitter: 54, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Flight showed ₹4,200. At checkout: ₹6,800. That's a 62% increase from taxes, fees, and 'convenience charge'. Other apps show this upfront. Why does MMT hide it?", source: "play_store", rating: 2, date: "2026-07-14" },
      ],
    },
    {
      name: "Hotel and property quality",
      score: 46,
      complaint_count: 488,
      avg_severity: 0.52,
      risk_relevance: false,
      risk_dimensions: ["Partner / service quality"],
      ai_recommendation:
        "Misleading photos in hotel listings are the primary driver of quality complaints. Implement a verified-photos badge that requires recent on-site photography. Add a 'report misleading listing' button directly in the post-stay review flow.",
      source_breakdown: { play_store: 254, app_store: 108, reddit: 86, twitter: 40, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Hotel photos on MMT showed a pool, gym, and breakfast. Arrived to find pool under construction, gym non-existent, breakfast not included. Listing was completely fabricated.", source: "app_store", rating: 1, date: "2026-07-11" },
      ],
    },
    {
      name: "App performance",
      score: 35,
      complaint_count: 366,
      avg_severity: 0.42,
      risk_relevance: false,
      risk_dimensions: [],
      ai_recommendation:
        "Session timeouts during payment are the most critical performance complaint — users lose their booking progress and face pricing changes on reload. Extend the session hold to 10 minutes and preserve cart state across restarts.",
      source_breakdown: { play_store: 190, app_store: 82, reddit: 64, twitter: 30, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "App timed out during payment. When I reopened it, the flight price had gone up by ₹800. I was in the app the whole time — why was I timed out?", source: "play_store", rating: 2, date: "2026-07-09" },
      ],
    },
    {
      name: "UX and interface issues",
      score: 26,
      complaint_count: 244,
      avg_severity: 0.35,
      risk_relevance: false,
      risk_dimensions: [],
      ai_recommendation:
        "Filter and sort controls in flight search are the top usability complaint. Users frequently lose their filter state when navigating back. Persist filter selections across the search session.",
      source_breakdown: { play_store: 128, app_store: 56, reddit: 42, twitter: 18, instagram: 0, youtube: 0, facebook: 0 },
      quotes: [
        { text: "Set my filters (non-stop, morning departure, specific airline), searched, clicked a flight, pressed back — all filters gone. Do this 10 times per search. Infuriating.", source: "app_store", rating: 2, date: "2026-07-06" },
      ],
    },
  ],
  created_at: "2026-08-10T00:00:00Z",
};

// ─── Previous snapshots ───────────────────────────────────────────────────────

const CRED_PREVIOUS: Snapshot = {
  ...CRED_SNAPSHOT,
  id: "snap-cred-prev",
  health_score: 68,
  review_count: 4200,
  avg_rating: 3.9,
  created_at: "2026-08-03T00:00:00Z",
  categories: CRED_SNAPSHOT.categories.map((c) => ({
    ...c,
    complaint_count: Math.round(c.complaint_count * 0.75),
    score: Math.round(c.score * 0.88),
  })),
};

const PHONEPE_PREVIOUS: Snapshot = {
  ...PHONEPE_SNAPSHOT,
  id: "snap-phonepe-prev",
  health_score: 61,
  review_count: 5600,
  avg_rating: 3.7,
  created_at: "2026-08-03T00:00:00Z",
  categories: PHONEPE_SNAPSHOT.categories.map((c) => ({
    ...c,
    complaint_count: Math.round(c.complaint_count * 0.72),
    score: Math.round(c.score * 0.85),
  })),
};

const PAYTM_PREVIOUS: Snapshot = {
  ...PAYTM_SNAPSHOT,
  id: "snap-paytm-prev",
  health_score: 44,
  review_count: 4800,
  avg_rating: 3.3,
  created_at: "2026-08-03T00:00:00Z",
  categories: PAYTM_SNAPSHOT.categories.map((c) => ({
    ...c,
    complaint_count: Math.round(c.complaint_count * 0.78),
    score: Math.round(c.score * 0.90),
  })),
};

const SWIGGY_PREVIOUS: Snapshot = {
  ...SWIGGY_SNAPSHOT,
  id: "snap-swiggy-prev",
  health_score: 64,
  review_count: 6600,
  avg_rating: 4.0,
  created_at: "2026-08-03T00:00:00Z",
  categories: SWIGGY_SNAPSHOT.categories.map((c) => ({
    ...c,
    complaint_count: Math.round(c.complaint_count * 0.74),
    score: Math.round(c.score * 0.86),
  })),
};

const BLINKIT_PREVIOUS: Snapshot = {
  ...BLINKIT_SNAPSHOT,
  id: "snap-blinkit-prev",
  health_score: 68,
  review_count: 4700,
  avg_rating: 4.2,
  created_at: "2026-08-03T00:00:00Z",
  categories: BLINKIT_SNAPSHOT.categories.map((c) => ({
    ...c,
    complaint_count: Math.round(c.complaint_count * 0.76),
    score: Math.round(c.score * 0.87),
  })),
};

const MMT_PREVIOUS: Snapshot = {
  ...MMT_SNAPSHOT,
  id: "snap-mmt-prev",
  health_score: 54,
  review_count: 5600,
  avg_rating: 3.8,
  created_at: "2026-08-03T00:00:00Z",
  categories: MMT_SNAPSHOT.categories.map((c) => ({
    ...c,
    complaint_count: Math.round(c.complaint_count * 0.77),
    score: Math.round(c.score * 0.88),
  })),
};

// ─── Exports ─────────────────────────────────────────────────────────────────

export const MOCK_SNAPSHOTS: Record<string, Snapshot> = {
  cred:        CRED_SNAPSHOT,
  phonepe:     PHONEPE_SNAPSHOT,
  paytm:       PAYTM_SNAPSHOT,
  swiggy:      SWIGGY_SNAPSHOT,
  blinkit:     BLINKIT_SNAPSHOT,
  makemytrip:  MMT_SNAPSHOT,
};

export const MOCK_PREVIOUS_SNAPSHOTS: Record<string, Snapshot> = {
  cred:        CRED_PREVIOUS,
  phonepe:     PHONEPE_PREVIOUS,
  paytm:       PAYTM_PREVIOUS,
  swiggy:      SWIGGY_PREVIOUS,
  blinkit:     BLINKIT_PREVIOUS,
  makemytrip:  MMT_PREVIOUS,
};

// ─── URL enrichment ───────────────────────────────────────────────────────────

function sourceUrl(source: DataSource, appId: string, appStoreId: string, name: string): string {
  switch (source) {
    case "play_store":
      return `https://play.google.com/store/apps/details?id=${appId}&showAllReviews=true`;
    case "app_store":
      return appStoreId ? `https://apps.apple.com/in/app/id${appStoreId}` : "";
    case "twitter":
      return `https://twitter.com/search?q=${encodeURIComponent(name + " complaint")}`;
    case "reddit":
      return `https://reddit.com/search/?q=${encodeURIComponent(name + " complaint")}&sort=new`;
    case "instagram":
      return `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(name)}`;
    case "youtube":
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(name + " complaint")}`;
    case "facebook":
      return `https://www.facebook.com/search/posts?q=${encodeURIComponent(name + " complaint")}`;
  }
}

function enrichUrls(snapshot: Snapshot, companyId: string): Snapshot {
  const company = MOCK_COMPANIES.find((c) => c.id === companyId);
  if (!company) return snapshot;
  const { app_id, app_store_id = "", name } = company;
  return {
    ...snapshot,
    categories: snapshot.categories.map((cat) => ({
      ...cat,
      quotes: cat.quotes.map((q) => ({
        ...q,
        url: q.url || sourceUrl(q.source as DataSource, app_id, app_store_id, name) || undefined,
      })),
    })),
  };
}

export function getMockSnapshot(companyId: string): Snapshot | undefined {
  const snap = MOCK_SNAPSHOTS[companyId];
  return snap ? enrichUrls(snap, companyId) : undefined;
}

export function getMockPreviousSnapshot(companyId: string): Snapshot | undefined {
  const snap = MOCK_PREVIOUS_SNAPSHOTS[companyId];
  return snap ? enrichUrls(snap, companyId) : undefined;
}
