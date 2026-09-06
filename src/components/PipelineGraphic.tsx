import React, { useState } from 'react';
import {
  Cable,
  Search,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Database,
  Lock,
  Network,
  Layers,
  Sparkles,
  EyeOff
} from 'lucide-react';
import { Card } from './UIComponents';

interface StageInfo {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  description: string;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PipelineGraphic: React.FC = () => {
  const [activeStage, setActiveStage] = useState<string | null>(null);

  const stages: StageInfo[] = [
    {
      id: 'ingest',
      step: '01',
      title: 'Lossless Ingestion',
      subtitle: 'Raw Evidence Preservation',
      description: 'Ingests raw telemetry from any heterogeneous perimeter firewall, auth server, or proprietary device while generating an immutable SHA-256 raw hash.',
      metric: 'Verifiable Raw Hash',
      icon: Cable
    },
    {
      id: 'preprocessing',
      step: '02',
      title: 'Edge Preprocessing',
      subtitle: 'Redaction + Noise Reduction',
      description: 'Performs local privacy-first PII/credential scrubbing and adaptive noise reduction for high-frequency events while preserving raw references.',
      metric: 'Zero PII Leakage',
      icon: EyeOff
    },
    {
      id: 'discovery',
      step: '03',
      title: 'Structure Discovery',
      subtitle: 'Syntax Fingerprinting',
      description: 'Discovers format syntax (delimited, key-value, XML tags, JSON) to generate a declarative parser specification with structural markers.',
      metric: 'Declarative Spec',
      icon: Search
    },
    {
      id: 'validation',
      step: '04',
      title: 'Replay Validation',
      subtitle: 'Deterministic Quality Gate',
      description: 'Replays proposed specification against test samples, enforcing strict schema compliance and field coverage before human activation.',
      metric: 'Strict Validation Gate',
      icon: CheckCircle2
    },
    {
      id: 'universal',
      step: '05',
      title: 'Universal Model',
      subtitle: 'Compiled Deterministic Engine',
      description: 'Executes via high-speed in-memory deterministic engine at <0.1ms with $0 recurring AI cost, standardizing events to OCSF Class 4001.',
      metric: 'OCSF Class 4001',
      icon: Database
    },
    {
      id: 'trust',
      step: '06',
      title: 'Trust & Correlate',
      subtitle: 'Merkle Batches + Graph',
      description: 'Anchors canonical events into Merkle batches with chained root hashes while evaluating transparent additive threat scores across devices.',
      metric: 'Cryptographic Custody',
      icon: Network
    }
  ];

  const sourceInputs = [
    'Windows Security',
    'Linux Syslog',
    'Cisco ASA',
    'FortiGate FW',
    'pfSense CSV',
    'Suricata EVE',
    'OpenVPN',
    'Custom Unknown Appliance'
  ];

  return (
    <Card className="p-5 sm:p-6 space-y-5 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-[#29264D] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ECEAFF] text-[#5748D6] dark:bg-[#302A68] dark:text-[#7868FF]">
              Universal Interoperability Pipeline
            </span>
            <span className="text-xs text-slate-500 dark:text-[#B7B5D0]">
              From Raw Ingestion to Downstream Analytics
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-[#F5F5FF] mt-1">
            How LogSetu Eliminates Custom Parser Fragility
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-[#B7B5D0]">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Active Pipeline Flow</span>
        </div>
      </div>

      {/* Upstream Heterogeneous Inputs */}
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-[#777492] mb-2 flex items-center justify-between">
          <span>Heterogeneous Input Feeds (Disparate Vendor Dialects)</span>
          <span className="text-[#6657E8] dark:text-[#7868FF] font-mono text-[10px]">Multi-Vendor Ingestion</span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {sourceInputs.map((src, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 text-xs rounded-xl bg-slate-100 dark:bg-[#1C1940] border border-slate-200 dark:border-[#39345F] text-slate-700 dark:text-[#B7B5D0] font-medium"
            >
              {src}
            </span>
          ))}
        </div>
      </div>

      {/* Interactive 6-Stage Flow Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
        {stages.map((st) => {
          const Icon = st.icon;
          const isSelected = activeStage === st.id;

          return (
            <div
              key={st.id}
              onMouseEnter={() => setActiveStage(st.id)}
              onMouseLeave={() => setActiveStage(null)}
              className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-[#F5F4FF] dark:bg-[#1C1940] border-[#6657E8] dark:border-[#7868FF] shadow-lg shadow-[#6657E8]/10 -translate-y-0.5'
                  : 'bg-white dark:bg-[#14122D] border-slate-200 dark:border-[#29264D] hover:border-[#6657E8]/50'
              }`}
            >
              {/* Stage Step + Icon */}
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-[#6657E8] dark:text-[#7868FF]">
                  {st.step}
                </span>
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-[#6657E8] text-white'
                      : 'bg-[#ECEAFF] dark:bg-[#1C1940] text-[#6657E8] dark:text-[#7868FF]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-[#F5F5FF]">
                  {st.title}
                </h4>
                <p className="text-[10px] text-[#6657E8] dark:text-[#35C7F4] font-medium">
                  {st.subtitle}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0] mt-1.5 leading-snug line-clamp-3">
                  {st.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#29264D] text-[10px] font-mono font-medium text-slate-400 dark:text-[#777492]">
                {st.metric}
              </div>
            </div>
          );
        })}
      </div>

      {/* Downstream Destination Outputs */}
      <div className="p-3.5 bg-slate-50 dark:bg-[#14122D] rounded-xl border border-slate-200/80 dark:border-[#29264D] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-[#B7B5D0]">
          <span className="font-semibold text-slate-900 dark:text-[#F5F5FF]">Downstream Sinks & Exporters:</span>
          <span>OpenTelemetry (OTel OTLP) • Apache Parquet Data Lake • JSONL • OpenSearch SIEM • SOC Threat Hunters</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-[#35D58A] font-semibold font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>UPI for Security Events</span>
        </div>
      </div>
    </Card>
  );
};

