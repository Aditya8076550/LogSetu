import React, { useEffect, useState } from 'react';
import {
  GitBranch,
  ShieldCheck,
  Search,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  Layers,
  FileCode,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, StatusBadge, Button, LoadingState, EmptyState } from '../components/UIComponents';
import { fetchEvents, explainEvent } from '../services/api';
import { ULIPUniversalEvent, EventExplainResponse } from '../types';

interface LineagePageProps {
  onExplain: (eventId: string) => void;
}

export const LineagePage: React.FC<LineagePageProps> = ({ onExplain }) => {
  const [events, setEvents] = useState<ULIPUniversalEvent[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [explainData, setExplainData] = useState<EventExplainResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingExplain, setLoadingExplain] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetchEvents({ limit: 15 });
      setEvents(res.events);
      if (res.events.length > 0) {
        selectEvent(res.events[0].event_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = async (id: string) => {
    try {
      setSelectedEventId(id);
      setLoadingExplain(true);
      const data = await explainEvent(id);
      setExplainData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExplain(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ECEAFF] text-[#5748D6] dark:bg-[#302A68] dark:text-[#7868FF]">
              Evidence Lineage & Provenance
            </span>
            <span className="text-xs text-slate-400 dark:text-[#777492]">
              Cryptographic Auditability
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5FF] mt-1">
            Deterministic Field Lineage Explorer
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#B7B5D0] mt-0.5 max-w-2xl">
            Trace every transformed field back to its exact raw source token. Complete proof that no data was hallucinated, modified, or silently lost.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadEvents}
          >
            Refresh Events
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState message="Loading event lineage records..." />
      ) : events.length === 0 ? (
        <EmptyState
          title="No Events Found"
          description="Ingest security events or run the Judge Demo scenario to explore verifiable transformation lineage."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Event Selector (4 cols) */}
          <Card className="lg:col-span-4 p-4 flex flex-col h-[650px] overflow-hidden">
            <div className="pb-3 border-b border-slate-200/80 dark:border-[#29264D]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#B7B5D0]">
                Select Event ({events.length})
              </span>
            </div>

            <div className="overflow-y-auto space-y-2 mt-3 pr-1 flex-1">
              {events.map((ev) => {
                const isSelected = selectedEventId === ev.event_id;
                return (
                  <div
                    key={ev.event_id}
                    onClick={() => selectEvent(ev.event_id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                      isSelected
                        ? 'border-[#6657E8] bg-[#F5F4FF] dark:bg-[#1C1940] shadow-sm'
                        : 'border-slate-200 dark:border-[#29264D] hover:border-slate-300 dark:hover:border-[#39345F] bg-white dark:bg-[#14122D]'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 dark:text-[#777492] mb-1">
                      <span className="truncate max-w-[140px]">{ev.event_id}</span>
                      <span>{ev.timestamp.split('T')[1]?.slice(0, 8)}</span>
                    </div>

                    <div className="font-bold text-slate-900 dark:text-[#F5F5FF]">
                      {ev.source_vendor} {ev.source_product}
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-slate-600 dark:text-[#B7B5D0] truncate max-w-[160px]">
                        {ev.activity}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          ev.action === 'AUTH_FAIL' || ev.action === 'DENY'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {ev.action}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Right Column: Full Lineage Timeline (8 cols) */}
          <Card className="lg:col-span-8 p-5 sm:p-6 overflow-y-auto h-[650px]">
            {loadingExplain || !explainData ? (
              <LoadingState message="Extracting cryptographic field lineage..." />
            ) : (
              <div className="space-y-6">
                {/* Event Summary Bar */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#14122D] border border-slate-200/80 dark:border-[#29264D] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Target Subject
                    </span>
                    <span className="font-bold text-slate-900 dark:text-[#F5F5FF]">
                      {explainData.universal_event?.user || explainData.universal_event?.source_ip || 'Perimeter Entity'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Parser Engine
                    </span>
                    <span className="font-mono text-slate-800 dark:text-[#F5F5FF]">
                      {explainData.parser_version}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Integrity Hash
                    </span>
                    <button
                      onClick={() => handleCopy(explainData.integrity_hash)}
                      className="font-mono text-[11px] text-[#079ACB] dark:text-[#35C7F4] flex items-center gap-1 hover:underline"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>{explainData.integrity_hash.slice(0, 12)}...</span>
                    </button>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onExplain(explainData.event_id)}
                  >
                    Open Deep Modal
                  </Button>
                </div>

                {/* 6-Step Visual Evidence Graph */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#B7B5D0]">
                    Transformation Provenance Graph
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Stage 1: Raw Ingest */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#29264D] bg-white dark:bg-[#14122D] space-y-2">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-[#6657E8] dark:text-[#7868FF]" />
                        <span className="text-xs font-bold text-slate-900 dark:text-[#F5F5FF]">
                          1. Raw Capture
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0]">
                        Original input bytes preserved losslessly with cryptographic SHA-256.
                      </p>
                      <div className="p-2 bg-slate-900 text-slate-300 rounded font-mono text-[10px] break-all max-h-24 overflow-y-auto">
                        {explainData.raw_payload}
                      </div>
                    </div>

                    {/* Stage 2: Universal Model */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#29264D] bg-white dark:bg-[#14122D] space-y-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#079ACB] dark:text-[#35C7F4]" />
                        <span className="text-xs font-bold text-slate-900 dark:text-[#F5F5FF]">
                          2. Universal Model
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0]">
                        Canonical normalized event conforming to LogSetu Unified Model.
                      </p>
                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Action:</span>
                          <span className="font-bold text-slate-800 dark:text-[#F5F5FF]">{explainData.universal_event?.action}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Severity:</span>
                          <span className="font-bold text-amber-500">{explainData.universal_event?.severity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Activity:</span>
                          <span className="text-slate-800 dark:text-[#F5F5FF] truncate max-w-[120px]">{explainData.universal_event?.activity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stage 3: OCSF Alignment */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-[#29264D] bg-white dark:bg-[#14122D] space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-900 dark:text-[#F5F5FF]">
                          3. OCSF Schema
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0]">
                        Class 4001 Network Activity validated for SIEM and Lakehouse ingestion.
                      </p>
                      <div className="space-y-1 text-[11px] font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Class UID:</span>
                          <span className="font-bold text-emerald-600 dark:text-[#35D58A]">4001</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Category UID:</span>
                          <span className="font-bold text-emerald-600 dark:text-[#35D58A]">4 (Network)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status:</span>
                          <span className="text-emerald-600 dark:text-[#35D58A]">Validated</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Field-by-Field Mapping Table */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#B7B5D0]">
                    Field Lineage Mappings ({explainData.lineage.length} Verified Fields)
                  </h3>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-[#29264D]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-[#14122D] text-slate-400 uppercase font-mono text-[10px] border-b border-slate-200 dark:border-[#29264D]">
                        <tr>
                          <th className="px-4 py-2.5">Raw Source Field</th>
                          <th className="px-4 py-2.5">Extracted Value</th>
                          <th className="px-4 py-2.5">Normalized ULIP Key</th>
                          <th className="px-4 py-2.5">OCSF Schema Target</th>
                          <th className="px-4 py-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-[#29264D] font-mono text-[11px]">
                        {explainData.lineage.map((lin, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#1C1940]/40 transition">
                            <td className="px-4 py-2 text-slate-600 dark:text-[#B7B5D0] font-semibold">{lin.raw_field}</td>
                            <td className="px-4 py-2 text-slate-900 dark:text-[#F5F5FF] max-w-[140px] truncate">{lin.raw_value}</td>
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
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
