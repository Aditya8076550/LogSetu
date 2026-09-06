import React, { useEffect, useState } from 'react';
import {
  Activity,
  Layers,
  Network,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  Database,
  Cpu,
  GitBranch,
  Shield,
  Eye,
  CheckCircle2,
  FileCode
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent, MetricCard, StatusBadge, Button } from '../components/UIComponents';
import { BeforeAfterGraphic } from '../components/BeforeAfterGraphic';
import { PipelineGraphic } from '../components/PipelineGraphic';
import { fetchStats, fetchEvents, fetchCorrelations, seedDemoScenario } from '../services/api';
import { DashboardStats, ULIPUniversalEvent, CorrelationAlert } from '../types';
import { NavTab } from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

interface OverviewPageProps {
  onExplain: (eventId: string) => void;
  onNavigate: (tab: NavTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onExplain, onNavigate }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<ULIPUniversalEvent[]>([]);
  const [correlations, setCorrelations] = useState<CorrelationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingDemo, setSeedingDemo] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [s, evts, corrs] = await Promise.all([
        fetchStats(),
        fetchEvents({ limit: 6 }),
        fetchCorrelations()
      ]);
      setStats(s);
      setRecentEvents(evts.events);
      setCorrelations(corrs);
    } catch (e) {
      console.error('Error loading overview data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDemo = async () => {
    try {
      setSeedingDemo(true);
      await seedDemoScenario();
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSeedingDemo(false);
    }
  };

  const topCorrelation = correlations[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. TOP HERO: MAKE THE PRODUCT EXPLAIN ITSELF (Requirement 8) */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-[#29264D] bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-[#14122D] dark:via-[#0D0B1D] dark:to-[#080714] p-6 sm:p-8 shadow-sm dark:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
        {/* Subtle decorative radial glow behind hero */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6657E8]/10 dark:bg-[#7868FF]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ECEAFF] text-[#5748D6] dark:bg-[#302A68] dark:text-[#7868FF] border border-[#CDD0DF] dark:border-[#6657E8]/30">
                LOGSETU • UNIVERSAL SECURITY EVENT INTEROPERABILITY
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400 dark:text-[#777492]">
                SIH260156 • NTRO
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-[#F5F5FF] leading-tight">
              One common language for every security event.
            </h1>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-[#B7B5D0] leading-relaxed max-w-2xl">
              Connect heterogeneous security sources, validate previously unseen formats, preserve original evidence and correlate events across systems — without writing a new parser every time.
            </p>

            {/* Status Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-medium text-slate-600 dark:text-[#B7B5D0]">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#35D58A] border border-emerald-200 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Interoperability Engine Online
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-[#123B4A]/50 text-[#079ACB] dark:text-[#35C7F4] border border-cyan-200 dark:border-cyan-800/50">
                <ShieldCheck className="w-3 h-3" />
                Integrity Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1C1940] text-slate-700 dark:text-[#F5F5FF] border border-slate-200 dark:border-[#39345F]">
                <Cpu className="w-3 h-3 text-[#6657E8] dark:text-[#7868FF]" />
                Air-Gapped Ready
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 flex-shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={PlusCircle}
              onClick={() => onNavigate('onboarding')}
              className="w-full sm:w-auto"
            >
              + Onboard New Source
            </Button>
            <Button
              variant="secondary"
              size="md"
              icon={Sparkles}
              loading={seedingDemo}
              onClick={handleRunDemo}
              className="w-full sm:w-auto"
            >
              Run Judge Demo
            </Button>
          </div>
        </div>
      </div>

      {/* 2. COMPACT KPI AREA (Requirement 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <MetricCard
          label="Events Ingested"
          value={stats?.total_events ?? '—'}
          icon={Activity}
          indicatorText="LIVE"
          indicatorStatus="success"
          subtext="Lossless capture"
          onClick={() => onNavigate('events')}
        />
        <MetricCard
          label="Normalized Events"
          value={stats?.normalized_events ?? '—'}
          icon={Layers}
          indicatorText="OCSF 4001"
          indicatorStatus="brand"
          subtext="Universal format"
          onClick={() => onNavigate('events')}
        />
        <MetricCard
          label="Active Sources"
          value={stats?.active_parsers ?? '—'}
          icon={Cpu}
          indicatorText="DETERMINISTIC"
          indicatorStatus="info"
          subtext="No runtime AI cost"
          onClick={() => onNavigate('sources')}
        />
        <MetricCard
          label="Correlation Candidates"
          value={stats?.correlation_alerts ?? '—'}
          icon={Network}
          indicatorText="EXPLAINABLE"
          indicatorStatus="warning"
          subtext="Cross-source links"
          onClick={() => onNavigate('correlation')}
        />
        <MetricCard
          label="Integrity Status"
          value="SEALED"
          icon={ShieldCheck}
          indicatorText="VERIFIED"
          indicatorStatus="success"
          subtext="Merkle batch custody"
          onClick={() => onNavigate('integrity')}
        />
      </div>

      {/* 3. HOW LOGSETU WORKS: PIPELINE ARCHITECTURE (Requirement 9) */}
      <PipelineGraphic />

      {/* 4. HERO DIFFERENTIATOR: UNKNOWN LOG ONBOARDING + CORRELATION PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card A: Zero-Parser AI Onboarding Preview */}
        <Card className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#ECEAFF] text-[#5748D6] dark:bg-[#302A68] dark:text-[#7868FF]">
                Core Differentiator
              </span>
              <span className="text-xs text-slate-400 dark:text-[#777492] font-mono">
                Zero-Code Ingestion
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F5FF] mt-2">
              From Unknown Log to Deterministic Parser
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#B7B5D0] mt-1 leading-relaxed">
              When encountering a novel security appliance or proprietary format, LogSetu automatically discovers delimiters, infers semantic roles, verifies schema against unseen samples, and compiles a safe deterministic specification.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-[#1C1940]/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-[#29264D] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-[#B7B5D0]">
              <span>Synthetic Unknown Vendor Format:</span>
              <span className="text-[#6657E8] dark:text-[#7868FF] font-mono font-bold">GWX Perimeter GW</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-900 text-slate-200 font-mono text-[10px] break-all border border-slate-800">
              GWX#2026/09/06 10:42|LOGIN_FAIL|U=admin|IP=10.1.4.8|R=HIGH
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#777492] pt-1">
              <span>Status: Learned & Compiled</span>
              <span className="text-emerald-600 dark:text-[#35D58A] font-semibold">Replay Pass: 100%</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-[#29264D]">
            <span className="text-xs text-slate-500 dark:text-[#777492]">
              Try all 3 unknown synthetic presets in the onboarder
            </span>
            <Button
              variant="primary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onNavigate('onboarding')}
            >
              Test Onboarder
            </Button>
          </div>
        </Card>

        {/* Card B: Cross-Source Explainable Correlation Preview */}
        <Card className="p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-[#F6B94A]">
                Explainable Insight
              </span>
              <span className="text-xs text-slate-400 dark:text-[#777492] font-mono">
                Cross-Device Graph
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-[#F5F5FF] mt-2">
              Explainable Threat Correlation
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#B7B5D0] mt-1 leading-relaxed">
              Transparent additive scoring links events across heterogeneous vendors (Windows AD, Cisco ASA, Suricata IDS, VPN) based on verified deterministic factors — not blackbox AI guesses.
            </p>
          </div>

          {topCorrelation ? (
            <div className="bg-slate-50 dark:bg-[#1C1940]/40 rounded-xl p-3.5 border border-slate-200/80 dark:border-[#29264D] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-[#F5F5FF]">
                  {topCorrelation.title}
                </span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Score: {topCorrelation.risk_score}/100
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#B7B5D0]">
                {topCorrelation.summary}
              </p>
              <div className="text-[10px] font-mono text-[#6657E8] dark:text-[#7868FF] flex gap-2">
                <span>Sources: {topCorrelation.sources.join(', ')}</span>
                <span>•</span>
                <span>Events: {topCorrelation.event_ids.length} Linked</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-[#1C1940]/40 rounded-xl p-4 border border-slate-200/80 dark:border-[#29264D] text-center text-xs text-slate-500 dark:text-[#B7B5D0]">
              <span>No active correlation candidates. Click &ldquo;Run Judge Demo&rdquo; to simulate a coordinated multi-layer event.</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-[#29264D]">
            <span className="text-xs text-slate-500 dark:text-[#777492]">
              Additive Heuristics: IP (+25) • User (+20) • Layers (+15)
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowRight}
              onClick={() => onNavigate('correlation')}
            >
              View Analysis
            </Button>
          </div>
        </Card>
      </div>

      {/* 5. RECENT VERIFIED UNIVERSAL EVENTS TABLE */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-slate-200/80 dark:border-[#29264D]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Event Stream</CardTitle>
              <p className="text-xs text-slate-500 dark:text-[#B7B5D0] mt-0.5">
                Heterogeneous logs normalized to OCSF Class 4001 Network Activity with verifiable cryptographic lineage
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              onClick={() => onNavigate('events')}
            >
              View All Events
            </Button>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#14122D] text-slate-500 dark:text-[#777492] uppercase font-mono text-[10px] border-b border-slate-200 dark:border-[#29264D]">
              <tr>
                <th className="px-5 py-3">Timestamp</th>
                <th className="px-4 py-3">Source Vendor</th>
                <th className="px-4 py-3">Normalized Activity</th>
                <th className="px-4 py-3">User / Actor</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-5 py-3 text-right">Lineage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-[#29264D] font-mono text-[11px]">
              {recentEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-8 text-center text-slate-400">
                    No events ingested yet. Click &ldquo;Run Judge Demo&rdquo; to populate multi-source security events.
                  </td>
                </tr>
              ) : (
                recentEvents.map((ev) => (
                  <tr
                    key={ev.event_id}
                    onClick={() => onExplain(ev.event_id)}
                    className="hover:bg-[#F5F4FF] dark:hover:bg-[#1C1940]/60 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-3 text-slate-500 dark:text-[#777492]">
                      {ev.timestamp.split('T')[1]?.slice(0, 8) || ev.timestamp}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-[#F5F5FF]">
                      {ev.source_vendor} {ev.source_product}
                    </td>
                    <td className="px-4 py-3 font-sans text-slate-700 dark:text-[#B7B5D0]">
                      {ev.activity}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-[#B7B5D0]">
                      {ev.user || '—'}
                    </td>
                    <td className="px-4 py-3 text-[#079ACB] dark:text-[#35C7F4]">
                      {ev.source_ip || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.action === 'AUTH_FAIL' || ev.action === 'DENY' || ev.action === 'DROP'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {ev.action}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold ${
                          ev.severity === 'CRITICAL' || ev.severity === 'HIGH'
                            ? 'text-rose-600 dark:text-[#FF5D73]'
                            : ev.severity === 'MEDIUM'
                            ? 'text-amber-600 dark:text-[#F6B94A]'
                            : 'text-slate-500 dark:text-[#777492]'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#6657E8] dark:text-[#7868FF] group-hover:underline font-sans font-medium">
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. WHY LOGSETU: 3-COLUMN VALUE PROPOSITION COMPARISON (Requirement 40) */}
      <BeforeAfterGraphic />
    </div>
  );
};
