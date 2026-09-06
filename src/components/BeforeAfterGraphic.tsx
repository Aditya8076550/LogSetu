import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Zap, Layers } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './UIComponents';

export const BeforeAfterGraphic: React.FC = () => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-slate-200/80 dark:border-[#29264D]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ECEAFF] text-[#5748D6] dark:bg-[#302A68] dark:text-[#7868FF]">
              Strategic Value Proposition
            </span>
            <CardTitle className="text-base sm:text-lg mt-1">
              Why LogSetu? The Architectural Shift
            </CardTitle>
          </div>
          <span className="text-xs text-slate-500 dark:text-[#B7B5D0]">
            Universal Security Event Interoperability
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* COLUMN 1: THE CORE PROBLEM */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#29264D] bg-slate-50 dark:bg-[#14122D] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-slate-700 dark:text-[#F5F5FF] font-bold text-xs uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>The Industry Reality</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F5FF]">
                Severe Semantic Log Fragmentation
              </h4>
              <p className="text-xs text-slate-500 dark:text-[#B7B5D0] mt-1.5 leading-relaxed">
                Modern enterprise environments deploy dozens of perimeter firewalls, EDR agents, cloud IAM, and specialized network devices. Each emits logs in proprietary, incompatible dialects.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#29264D] text-xs text-slate-600 dark:text-[#B7B5D0]">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span>Vendor lock-in across SIEM ingestion pipelines</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span>Weeks required to write regex / Grok rules for each device</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span>Inconsistent fields blind SOC correlation engines</span>
              </div>
            </div>
          </div>

          {/* COLUMN 2: TRADITIONAL APPROACH */}
          <div className="p-4 rounded-xl border border-rose-200/80 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs uppercase tracking-wider mb-2">
                <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span>Traditional Brittle Parsing</span>
              </div>
              <h4 className="text-sm font-bold text-rose-950 dark:text-rose-100">
                Manual Grok & Heavy Custom Maintenance
              </h4>
              <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-1.5 leading-relaxed">
                Security engineers spend hundreds of hours drafting brittle regex patterns that break whenever a vendor pushes a minor firmware or timestamp update.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-rose-200/60 dark:border-rose-900/40 text-xs text-rose-900/90 dark:text-rose-200">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>High operational overhead and parsing failures</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>No cryptographic proof that ingested logs weren't modified</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <span>Raw payload discarded after parsing, losing forensic evidence</span>
              </div>
            </div>
          </div>

          {/* COLUMN 3: THE LOGSETU ARCHITECTURE */}
          <div className="p-4 rounded-xl border border-[#6657E8]/40 dark:border-[#7868FF]/40 bg-[#F5F4FF] dark:bg-[#1C1940]/60 flex flex-col justify-between space-y-3 relative">
            <div>
              <div className="flex items-center gap-2 text-[#5748D6] dark:text-[#7868FF] font-bold text-xs uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4 text-[#6657E8] dark:text-[#7868FF] flex-shrink-0" />
                <span>LogSetu Interoperability Layer</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-[#F5F5FF]">
                Zero-Parser Onboarding & Verifiable Trust
              </h4>
              <p className="text-xs text-slate-600 dark:text-[#B7B5D0] mt-1.5 leading-relaxed">
                Discover syntax, propose mappings with AI assistance, validate deterministically against unseen samples, and compile into high-speed deterministic parsers.
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#6657E8]/20 dark:border-[#7868FF]/20 text-xs text-slate-800 dark:text-[#F5F5FF]">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span><strong>Zero-parser AI onboarding:</strong> New formats active in minutes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6657E8] dark:bg-[#7868FF] mt-1.5 flex-shrink-0" />
                <span><strong>OCSF-aligned model:</strong> Universal events across all vendors</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#079ACB] dark:bg-[#35C7F4] mt-1.5 flex-shrink-0" />
                <span><strong>Tamper-evident custody:</strong> Merkle chain seals raw evidence</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
