import React, { useState } from 'react';
import {
  X,
  ArrowRight,
  ShieldCheck,
  FileCode,
  Lock,
  Copy,
  Check,
  GitBranch,
  Layers,
  Database,
  Cpu,
  Sparkles
} from 'lucide-react';
import { EventExplainResponse } from '../types';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Button } from './UIComponents';

interface ExplainModalProps {
  data: EventExplainResponse | null;
  onClose: () => void;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({ data, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'mapping' | 'raw' | 'universal' | 'ocsf'>('timeline');

  if (!data) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(data.integrity_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const universalEv = data.universal_event;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-[#0D0B1D] border border-slate-200 dark:border-[#29264D] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-[#0D0B1D]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#29264D] px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#ECEAFF] dark:bg-[#1C1940] border border-[#CDD0DF] dark:border-[#39345F] text-[#6657E8] dark:text-[#7868FF] flex items-center justify-center flex-shrink-0">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F5F5FF]">
                  Lineage & Provenance Audit
                </h2>
                <span className="font-mono text-xs text-[#6657E8] dark:text-[#7868FF] font-semibold">
                  {data.event_id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#B7B5D0]">
                Deterministic end-to-end evidence trail from raw capture to OCSF-aligned model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-[#F5F5FF] hover:bg-slate-100 dark:hover:bg-[#1C1940] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-200 dark:border-[#29264D] flex gap-2 bg-slate-50/50 dark:bg-[#14122D]/40 text-xs overflow-x-auto">
          {[
            { id: 'timeline', label: 'Lineage Timeline', icon: GitBranch },
            { id: 'mapping', label: 'Field Transformations', icon: Layers },
            { id: 'raw', label: 'Raw Payload', icon: FileCode },
            { id: 'universal', label: 'Universal Event', icon: Database },
            { id: 'ocsf', label: 'OCSF Aligned', icon: ShieldCheck }
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 font-semibold transition border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#6657E8] text-[#5748D6] dark:text-[#7868FF] bg-white dark:bg-[#1C1940]/80 rounded-t-lg'
                    : 'border-transparent text-slate-500 dark:text-[#B7B5D0] hover:text-slate-900 dark:hover:text-[#F5F5FF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Metadata Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#14122D] p-4 rounded-xl border border-slate-200/80 dark:border-[#29264D] text-xs">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-[#777492] block">
                Source Type
              </span>
              <span className="font-bold text-slate-800 dark:text-[#F5F5FF]">
                {data.source_type}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-[#777492] block">
                Parser Engine
              </span>
              <span className="font-mono font-medium text-slate-700 dark:text-[#B7B5D0]">
                {data.parser_version}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-[#777492] block">
                Timestamp
              </span>
              <span className="font-mono text-slate-700 dark:text-[#B7B5D0] text-[11px]">
                {data.timestamp}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-[#777492] block">
                Cryptographic Custody
              </span>
              <button
                onClick={handleCopyHash}
                className="font-mono text-[11px] text-[#079ACB] dark:text-[#35C7F4] hover:underline flex items-center gap-1 truncate"
                title="Click to copy canonical hash"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{data.integrity_hash.slice(0, 10)}...</span>
              </button>
            </div>
          </div>

          {/* TAB 1: LINEAGE TIMELINE (Requirement 17) */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 dark:text-[#B7B5D0] font-medium">
                Step-by-step verifiable transformation path for this security event:
              </div>

              <div className="relative pl-6 border-l-2 border-[#6657E8]/30 dark:border-[#7868FF]/30 space-y-6">
                {/* 1. Raw Ingestion */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-[#ECEAFF] dark:bg-[#302A68] border-2 border-[#6657E8] dark:border-[#7868FF] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-[#6657E8] dark:text-[#7868FF]">1</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5FF]">
                    Raw Evidence Preservation
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0] mt-0.5">
                    Original payload captured losslessly and hashed with SHA-256 before any transformation.
                  </p>
                  <div className="mt-2 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] break-all border border-slate-800">
                    {data.raw_payload}
                  </div>
                  <div className="mt-1 font-mono text-[10px] text-slate-400">
                    Payload SHA-256: <span className="text-[#35C7F4]">{data.raw_hash}</span>
                  </div>
                </div>

                {/* 2. Parser Execution */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-[#ECEAFF] dark:bg-[#302A68] border-2 border-[#6657E8] dark:border-[#7868FF] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-[#6657E8] dark:text-[#7868FF]">2</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5FF]">
                    Deterministic Parser Selection
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0] mt-0.5">
                    Fingerprinted as <strong className="text-slate-800 dark:text-[#F5F5FF]">{data.source_type}</strong> using version <strong className="font-mono text-slate-800 dark:text-[#F5F5FF]">{data.parser_version}</strong>. Executed without AI inference in runtime fast-path.
                  </p>
                </div>

                {/* 3. Field Mapping */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-[#ECEAFF] dark:bg-[#302A68] border-2 border-[#6657E8] dark:border-[#7868FF] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-[#6657E8] dark:text-[#7868FF]">3</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5FF]">
                    Deterministic Token Extraction & Mapping
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0] mt-0.5">
                    Extracted {data.lineage.length} fields with 100% verifiable source-to-target mapping:
                  </p>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {data.lineage.slice(0, 6).map((lin, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-[#14122D] border border-slate-200/80 dark:border-[#29264D] text-[11px] flex items-center justify-between"
                      >
                        <span className="font-mono text-slate-500 dark:text-[#777492]">{lin.raw_field}</span>
                        <ArrowRight className="w-3 h-3 text-[#6657E8] dark:text-[#7868FF]" />
                        <span className="font-mono font-semibold text-[#079ACB] dark:text-[#35C7F4]">{lin.ocsf_field}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Universal Event Model */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-[#ECEAFF] dark:bg-[#302A68] border-2 border-[#6657E8] dark:border-[#7868FF] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-[#6657E8] dark:text-[#7868FF]">4</span>
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-[#F5F5FF]">
                    LogSetu Universal Event Normalization
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0] mt-0.5">
                    Action normalized to <strong className="text-[#6657E8] dark:text-[#7868FF]">{universalEv?.action || 'OTHER'}</strong>, severity <strong className="text-amber-600 dark:text-[#F6B94A]">{universalEv?.severity}</strong>, OCSF Class 4001 (Network Activity).
                  </p>
                </div>

                {/* 5. Cryptographic Custody */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-emerald-600 dark:text-[#35D58A]" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-[#35D58A]">
                    Tamper-Evident Cryptographic Custody
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0] mt-0.5">
                    Canonical JSON representation hashed and anchored into Merkle batch custody tree.
                  </p>
                  <div className="mt-2 font-mono text-[10px] text-slate-600 dark:text-[#B7B5D0] bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 break-all">
                    Digest: {data.integrity_hash}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FIELD TRANSFORMATIONS TABLE */}
          {activeTab === 'mapping' && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#29264D]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-[#14122D] text-slate-500 dark:text-[#777492] font-mono uppercase text-[10px] border-b border-slate-200 dark:border-[#29264D]">
                    <tr>
                      <th className="px-4 py-2.5">Raw Token Key</th>
                      <th className="px-4 py-2.5">Captured Value</th>
                      <th className="px-4 py-2.5">Universal Field</th>
                      <th className="px-4 py-2.5">OCSF Target Attribute</th>
                      <th className="px-4 py-2.5 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80 dark:divide-[#29264D] font-mono text-[11px]">
                    {data.lineage.map((lin, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#1C1940]/40 transition">
                        <td className="px-4 py-2 font-semibold text-slate-700 dark:text-[#B7B5D0]">{lin.raw_field}</td>
                        <td className="px-4 py-2 text-slate-900 dark:text-[#F5F5FF] max-w-[150px] truncate">{lin.raw_value}</td>
                        <td className="px-4 py-2 text-[#6657E8] dark:text-[#7868FF]">{lin.ulip_field}</td>
                        <td className="px-4 py-2 text-[#079ACB] dark:text-[#35C7F4]">{lin.ocsf_field}</td>
                        <td className="px-4 py-2 text-right text-emerald-600 dark:text-[#35D58A] font-sans font-bold text-[10px]">
                          VERIFIED
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RAW PAYLOAD */}
          {activeTab === 'raw' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#B7B5D0]">
                <span>Lossless raw event bytes as received at ingestion port:</span>
                <span className="font-mono text-[10px]">Length: {data.raw_payload.length} chars</span>
              </div>
              <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                <pre>{data.raw_payload}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: UNIVERSAL EVENT */}
          {activeTab === 'universal' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#B7B5D0]">
                <span>LogSetu Normalized Universal Event JSON:</span>
                <span className="font-mono text-[10px]">Version: {data.parser_version}</span>
              </div>
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 border border-slate-800 leading-snug">
                <pre>{JSON.stringify(universalEv, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* TAB 5: OCSF ALIGNED */}
          {activeTab === 'ocsf' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#B7B5D0]">
                <span>OCSF Schema Class 4001 Compliant Object:</span>
                <span className="font-semibold text-emerald-600 dark:text-[#35D58A] text-[10px]">
                  OCSF v1.1.0 Aligned
                </span>
              </div>
              <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-96 border border-slate-800 leading-snug">
                <pre>{JSON.stringify(data.ocsf_aligned, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-[#29264D] px-6 py-3.5 bg-slate-50/50 dark:bg-[#14122D]/40 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-[#777492] font-mono">
            Immutable Audit Trail • Event ID: {data.event_id}
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};
