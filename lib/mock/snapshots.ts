import type { Snapshot } from "@/types";

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
      regulatory_flag: true,
      ai_recommendation:
        "Escalate to payments engineering immediately. Map failed transactions to specific biller IDs and UPI handles — CRED and ICICI Bank partnership issues appear in multiple reports. SLA breach risk exists under NPCI guidelines.",
      source_breakdown: { play_store: 420, app_store: 185, reddit: 142, twitter: 69 },
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
      regulatory_flag: true,
      ai_recommendation:
        "Audit cashback crediting logic — the gap between 'offer shown' and 'cashback credited' is the core complaint. Regulatory risk: misleading promotions could attract ASCI/CCPA scrutiny. Publish a clear cashback T&C page and automate credit within 48 hours.",
      source_breakdown: { play_store: 310, app_store: 145, reddit: 118, twitter: 51 },
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
      regulatory_flag: false,
      ai_recommendation:
        "First-response SLA appears to be the core failure — automate acknowledgement with a ticket ID and realistic resolution timeline. Add a live-chat option for payment failures specifically, as these have the highest severity and time sensitivity.",
      source_breakdown: { play_store: 265, app_store: 115, reddit: 98, twitter: 50 },
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
      regulatory_flag: false,
      ai_recommendation:
        "Profile app startup time — 'crash on open' is a common report. Android 14 compatibility issues appear in Play Store reviews. A targeted fix for Android 14+ devices could resolve 30-40% of performance complaints.",
      source_breakdown: { play_store: 225, app_store: 90, reddit: 45, twitter: 24 },
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
      score: 38,
      complaint_count: 312,
      avg_severity: 0.58,
      regulatory_flag: true,
      ai_recommendation:
        "KYC rejection reasons need to be specific and actionable. Users report being rejected with vague 'documents not matching' errors. Add a guided re-submission flow with specific field-level feedback. RBI mandates KYC completion within 15 days of flagging.",
      source_breakdown: { play_store: 168, app_store: 72, reddit: 52, twitter: 20 },
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
      regulatory_flag: false,
      ai_recommendation:
        "The redesigned home screen appears to be the main driver — users can't find features they previously relied on. Consider adding a 'quick actions' shortcut bar for the most-used flows.",
      source_breakdown: { play_store: 132, app_store: 60, reddit: 34, twitter: 14 },
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
      regulatory_flag: false,
      ai_recommendation:
        "Add a progress indicator to the sign-up flow — users don't know how many steps remain and abandon mid-way. The credit score eligibility check should surface before users invest time in onboarding.",
      source_breakdown: { play_store: 95, app_store: 42, reddit: 20, twitter: 11 },
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
      score: 18,
      complaint_count: 120,
      avg_severity: 0.42,
      regulatory_flag: true,
      ai_recommendation:
        "Users are concerned about CRED accessing full SMS history. Publish a clear data usage policy with granular permission controls. The DPDP Act 2023 requires explicit consent for each data category.",
      source_breakdown: { play_store: 65, app_store: 28, reddit: 18, twitter: 9 },
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
      regulatory_flag: true,
      ai_recommendation:
        "Isolate failure by bank and UPI handle. SBI and Axis Bank integrations appear most affected based on review content. Implement retry logic with automatic T+1 reversal and proactive user SMS when a failure is detected server-side before users notice.",
      source_breakdown: { play_store: 640, app_store: 280, reddit: 210, twitter: 110 },
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
      regulatory_flag: false,
      ai_recommendation:
        "Crash analytics suggest Android 12-13 devices with < 4GB RAM are the most affected segment. Optimize memory footprint for mid-range devices — PhonePe's 500M install base is heavily mid-range Android. Performance on iOS has improved; Android is the gap.",
      source_breakdown: { play_store: 560, app_store: 165, reddit: 140, twitter: 65 },
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
      regulatory_flag: false,
      ai_recommendation:
        "The 72-hour first-response SLA for payment failures is too slow. NPCI mandates T+1 resolution. Add a 'Payment Help' fast-track in support that auto-escalates failed transactions to a human queue within 4 hours.",
      source_breakdown: { play_store: 400, app_store: 175, reddit: 130, twitter: 70 },
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
      regulatory_flag: true,
      ai_recommendation:
        "UPI account linking failure with certain banks (PNB, UCO) is a recurring complaint. Proactively publish a bank compatibility list and offer workarounds. KYC re-verification loops need a human escalation path.",
      source_breakdown: { play_store: 330, app_store: 138, reddit: 105, twitter: 47 },
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
      regulatory_flag: true,
      ai_recommendation:
        "Refund SLA is unclear to users — no proactive communication about expected timelines. Publish a refund status tracker in-app (like order tracking) and send SMS updates at each stage. RBI mandates refunds within 5 days.",
      source_breakdown: { play_store: 255, app_store: 100, reddit: 78, twitter: 32 },
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
      regulatory_flag: false,
      ai_recommendation:
        "The revamped home screen has confused frequent users — key features like Recharge and Bills are harder to find. Add a 'quick actions' strip for the top 4 most-used features per user based on usage history.",
      source_breakdown: { play_store: 180, app_store: 72, reddit: 40, twitter: 18 },
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
      score: 25,
      complaint_count: 210,
      avg_severity: 0.45,
      regulatory_flag: true,
      ai_recommendation:
        "Permission requests for contacts and location without clear in-context explanation are the core complaint. Under DPDP Act 2023, each permission must have a specific, disclosed purpose. Update permission request dialogs with explicit use-case explanations.",
      source_breakdown: { play_store: 115, app_store: 48, reddit: 32, twitter: 15 },
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
      regulatory_flag: false,
      ai_recommendation:
        "Onboarding drop-off at UPI PIN creation is a reported friction point. Add a clearer explanation of what UPI PIN is and why it's separate from the app PIN. A guided first-transaction flow post-setup would reduce abandonment.",
      source_breakdown: { play_store: 82, app_store: 32, reddit: 18, twitter: 8 },
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
      regulatory_flag: true,
      ai_recommendation:
        "This is a crisis-level item, not a product backlog item. Assign a dedicated resolution squad for frozen account cases. Publish a public-facing status page for RBI compliance timelines. Each frozen account with user funds at risk should have a guaranteed 24-hour human response SLA, not the current 7-10 day queue.",
      source_breakdown: { play_store: 760, app_store: 315, reddit: 238, twitter: 115 },
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
      regulatory_flag: true,
      ai_recommendation:
        "Since the Paytm Payments Bank wind-down, UPI transactions via Paytm are routing through Axis Bank — integration issues at this layer appear to be causing failures. Publish a clear FAQ on which bank now handles transactions and what users should do if payments fail.",
      source_breakdown: { play_store: 545, app_store: 225, reddit: 172, twitter: 78 },
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
      regulatory_flag: true,
      ai_recommendation:
        "Refund timelines have worsened post-bank transition. The old Paytm Payments Bank refund pipeline no longer exists and the Axis Bank integration doesn't have equivalent speed. Commit to a published 3-day refund SLA for UPI failures and 7-day for merchant refunds, with in-app status tracking.",
      source_breakdown: { play_store: 410, app_store: 175, reddit: 130, twitter: 50 },
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
      regulatory_flag: false,
      ai_recommendation:
        "Support ticket volume has tripled since the regulatory action and team capacity hasn't scaled proportionally. Triage incoming tickets by financial impact — anyone with frozen funds above ₹1,000 gets a human agent within 4 hours. Use AI triage to detect these high-impact cases.",
      source_breakdown: { play_store: 328, app_store: 138, reddit: 105, twitter: 41 },
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
      regulatory_flag: true,
      ai_recommendation:
        "Users are questioning what happened to their financial data after the RBI action on Paytm Bank. Publish a detailed data handling FAQ explaining what data is retained, where it's stored, and how users can request deletion under DPDP Act 2023.",
      source_breakdown: { play_store: 245, app_store: 105, reddit: 78, twitter: 31 },
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
      regulatory_flag: false,
      ai_recommendation:
        "Performance is improving — keep the momentum from the Android rebuild. Focus next on reducing cold-start time, which users compare unfavourably to Google Pay and PhonePe.",
      source_breakdown: { play_store: 228, app_store: 95, reddit: 60, twitter: 25 },
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
      regulatory_flag: false,
      ai_recommendation:
        "The app tries to do too many things on one screen — mini-apps, shopping, banking, payments all compete for attention. Consider a clean 'Payments mode' toggle for users who just want UPI functionality without the superapp clutter.",
      source_breakdown: { play_store: 145, app_store: 60, reddit: 38, twitter: 12 },
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
      score: 25,
      complaint_count: 204,
      avg_severity: 0.42,
      regulatory_flag: true,
      ai_recommendation:
        "Convenience fees on bill payments are the top pricing complaint. Competitors (CRED, PhonePe) don't charge these fees on many billers. If fees are necessary, ensure complete upfront disclosure before transaction confirmation — hidden fee reveals at the final step are a common complaint.",
      source_breakdown: { play_store: 112, app_store: 48, reddit: 32, twitter: 12 },
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

// ─── Previous snapshots for trend / comparison ────────────────────────────────

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

// ─── Exports ─────────────────────────────────────────────────────────────────

export const MOCK_SNAPSHOTS: Record<string, Snapshot> = {
  cred:     CRED_SNAPSHOT,
  phonepe:  PHONEPE_SNAPSHOT,
  paytm:    PAYTM_SNAPSHOT,
};

export const MOCK_PREVIOUS_SNAPSHOTS: Record<string, Snapshot> = {
  cred:     CRED_PREVIOUS,
  phonepe:  PHONEPE_PREVIOUS,
  paytm:    PAYTM_PREVIOUS,
};

export function getMockSnapshot(companyId: string): Snapshot | undefined {
  return MOCK_SNAPSHOTS[companyId];
}

export function getMockPreviousSnapshot(companyId: string): Snapshot | undefined {
  return MOCK_PREVIOUS_SNAPSHOTS[companyId];
}
