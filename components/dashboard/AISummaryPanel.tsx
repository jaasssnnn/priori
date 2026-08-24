import { Sparkles } from "lucide-react";
import type { AISummary } from "@/types";

interface Props {
  summary: AISummary;
}

export default function AISummaryPanel({ summary }: Props) {
  return (
    <div className="rounded-2xl border border-[#1a3a2e]/15 bg-gradient-to-br from-[#1a3a2e]/5 to-[#1a3a2e]/[0.03] p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a3a2e]">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <p className="text-sm font-semibold text-[#1a3a2e]">AI Health Summary</p>
        <span className="ml-auto rounded-full bg-[#1a3a2e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1a3a2e]">
          Groq · llama-3.3-70b
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3a2e]/70 mb-1">Assessment</p>
          <p className="text-sm text-slate-700 leading-relaxed">{summary.health_assessment}</p>
        </div>
        <div className="h-px bg-[#1a3a2e]/10" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">⚠ Most Urgent</p>
          <p className="text-sm text-slate-700 leading-relaxed">{summary.urgent_problem}</p>
        </div>
        <div className="h-px bg-[#1a3a2e]/10" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#1a3a2e] mb-1">↑ Improving</p>
          <p className="text-sm text-slate-700 leading-relaxed">{summary.improving}</p>
        </div>
      </div>
    </div>
  );
}
