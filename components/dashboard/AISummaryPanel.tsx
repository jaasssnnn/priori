import { Sparkles } from "lucide-react";
import type { AISummary } from "@/types";

interface Props {
  summary: AISummary;
}

export default function AISummaryPanel({ summary }: Props) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <p className="text-sm font-semibold text-indigo-900">AI Health Summary</p>
        <span className="ml-auto rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
          Groq · llama-3.3-70b
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">Assessment</p>
          <p className="text-sm text-slate-700 leading-relaxed">{summary.health_assessment}</p>
        </div>
        <div className="h-px bg-indigo-100" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-400 mb-1">⚠ Most Urgent</p>
          <p className="text-sm text-slate-700 leading-relaxed">{summary.urgent_problem}</p>
        </div>
        <div className="h-px bg-indigo-100" />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-500 mb-1">↑ Improving</p>
          <p className="text-sm text-slate-700 leading-relaxed">{summary.improving}</p>
        </div>
      </div>
    </div>
  );
}
