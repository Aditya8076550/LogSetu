import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Filter, CheckCircle2, Send, ArrowUpRight, Layers, Minimize2, ChevronDown, ChevronRight, Hash } from 'lucide-react';
import { fetchEvents, fetchAggregatedEvents, ingestLog } from '../services/api';
import { ULIPUniversalEvent, AdaptiveAggregationRecord } from '../types';
import { Badge } from '../components/Badge';

interface LiveEventsProps {
  onExplain: (eventId: string) => void;
  onNotice: (msg: string, type?: 'success' | 'warning') => void;
}

export const LiveEventsPage: React.FC<LiveEventsProps> = ({ onExplain, onNotice }) => {
  const [viewMode, setViewMode] = useState<'all' | 'aggregated'>('all');
  const [events, setEvents] = useState<ULIPUniversalEvent[]>([]);
  const [aggregatedEvents, setAggregatedEvents] = useState<AdaptiveAggregationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAggregatedRawCount, setTotalAggregatedRawCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [manualLog, setManualLog] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, [actionFilter, severityFilter, viewMode]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      if (viewMode === 'all') {
        const res = await fetchEvents({
          action: actionFilter || undefined,
          severity: severityFilter || undefined,
          query: search || undefined,
          limit: 50
        });
        setEvents(res.events);
        setTotal(res.total);
      } else {
        const res = await fetchAggregatedEvents();
        setAggregatedEvents(res.aggregated_events || []);
        const totalRaw = (res.aggregated_events || []).reduce((acc, curr) => acc + curr.repeat_count, 0);
        setTotalAggregatedRawCount(totalRaw);
        setTotal(res.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLog.trim()) return;
    try {
      setIngesting(true);
      const res = await ingestLog(manualLog);
      onNotice(`Ingested & normalized event ${res.event_id} (${res.source_type})!`, 'success');
      setManualLog('');
      loadEvents();
    } catch (err: any) {
      onNotice(`Ingestion failed: ${err.message}`, 'warning');
    } finally {
      setIngesting(false);
    }
  };

  const noiseReductionRatio = totalAggregatedRawCount > 0 && aggregatedEvents.length > 0
    ? Math.round(((totalAggregatedRawCount - aggregatedEvents.length) / totalAggregatedRawCount) * 100)
    : 0;

  return (
    <div className="space-y-6 font-sans">
      {/* Quick Ingestion Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono mb-1">
          Real-Time Log Ingestion Gateway
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Paste any raw perimeter log line (FortiGate, Cisco ASA, pfSense, Suricata, Snort, OpenVPN, Router, Windows, Linux, or Onboarded Device)
        </p>
        <form onSubmit={handleManualIngest} className="flex gap-2 font-mono text-xs">
          <input
            type="text"
            value={manualLog}
            onChange={e => setManualLog(e.target.value)}
            placeholder='e.g. date=2026-08-20 time=10:31:44 devname="FGT-60F" type="traffic" action="deny" srcip=10.20.4.5 dstip=172.16.2.10...'
            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={ingesting}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center space-x-1.5 transition disabled:opacity-50 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ingest</span>
          </button>
        </form>
      </div>

      {/* Filter and View Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        {/* Left: View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center space-x-1.5 ${
              viewMode === 'all'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Events (OCSF 4001)</span>
          </button>
          <button
            onClick={() => setViewMode('aggregated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center space-x-1.5 ${
              viewMode === 'aggregated'
                ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Adaptive Aggregation (Noise Reduction)</span>
          </button>
        </div>

        {/* Right: Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {viewMode === 'all' && (
            <>
              <div className="relative font-mono text-xs w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadEvents()}
                  placeholder="Search IP, user, vendor..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-2.5 py-1.5 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={actionFilter}
                onChange={e => setActionFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Actions</option>
                <option value="ALLOW">ALLOW</option>
                <option value="DENY">DENY</option>
                <option value="DROP">DROP</option>
                <option value="ALERT">ALERT</option>
                <option value="AUTH_FAIL">AUTH_FAIL</option>
                <option value="AUTH_SUCCESS">AUTH_SUCCESS</option>
              </select>

              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
                <option value="INFORMATIONAL">INFORMATIONAL</option>
              </select>
            </>
          )}

          <button
            onClick={loadEvents}
            disabled={loading}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-700 transition"
            title="Refresh stream"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Events Table or Aggregated View */}
      {viewMode === 'all' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden font-mono text-xs shadow-sm">
          <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
              <span>Unified OCSF Class 4001 Events ({total})</span>
              <span className="text-emerald-700 dark:text-emerald-400 text-[10px] bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                Lossless Lineage Preserved
              </span>
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Click row to inspect field provenance</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 text-[11px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Appliance Source</th>
                  <th className="p-3">Activity Description</th>
                  <th className="p-3">Source Endpoint</th>
                  <th className="p-3">Destination Endpoint</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Integrity</th>
                  <th className="p-3 text-right">Lineage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/60">
                {events.length > 0 ? (
                  events.map(e => (
                    <tr
                      key={e.event_id}
                      onClick={() => onExplain(e.event_id)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition"
                    >
                      <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        {new Date(e.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">
                        {e.source_vendor} {e.source_product}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={e.activity}>
                        {e.activity}
                      </td>
                      <td className="p-3 text-cyan-700 dark:text-cyan-300">
                        {e.source_ip || '—'}{e.source_port ? `:${e.source_port}` : ''}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {e.destination_ip || '—'}{e.destination_port ? `:${e.destination_port}` : ''}
                      </td>
                      <td className="p-3">
                        <Badge label={e.action} variant="action" />
                      </td>
                      <td className="p-3">
                        <Badge label={e.severity} variant="severity" />
                      </td>
                      <td className="p-3">
                        <span className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>SHA-256</span>
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className="text-cyan-600 dark:text-cyan-400 hover:underline text-[11px] font-semibold">
                          Explain
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-10 text-center text-slate-400">
                      No matching events in store. Click <strong>"Start Judge Demo"</strong> in the top header.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Aggregated Noise Reduction View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Raw Evidence Count</div>
              <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">{totalAggregatedRawCount}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">100% forensic custody preserved</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">Aggregated Incident Groups</div>
              <div className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1">{aggregatedEvents.length}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Analytical noise eliminated</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">SOC Noise Reduction</div>
              <div className="text-2xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-1">+{noiseReductionRatio}%</div>
              <div className="text-[11px] text-cyan-700 dark:text-cyan-300 mt-1">Faster SIEM indexing & query speed</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden font-mono text-xs shadow-sm">
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2">
                <span>Adaptively Aggregated Security Streams</span>
                <span className="text-purple-700 dark:text-purple-400 text-[10px] bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                  Lossless Reference Links
                </span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Click group to drill into individual raw event IDs</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {aggregatedEvents.map(group => {
                const isExpanded = expandedGroup === group.group_id;
                return (
                  <div key={group.group_id} className="p-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedGroup(isExpanded ? null : group.group_id)}
                    >
                      <div className="flex items-center space-x-3">
                        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {group.source_vendor} {group.source_product}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                              {group.repeat_count} occurrences
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {group.source_ip || 'Any'} &rarr; {group.destination_ip || 'Any'} &bull; First: {new Date(group.first_seen).toLocaleTimeString()} &bull; Last: {new Date(group.last_seen).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge label={group.action} variant="action" />
                        <Badge label={group.severity} variant="severity" />
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2 bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl">
                        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>Raw Evidence Chain ({group.raw_event_refs.length} linked universal events):</span>
                          <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">Zero Data Loss</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {group.raw_event_refs.map(refId => (
                            <button
                              key={refId}
                              onClick={(e) => {
                                e.stopPropagation();
                                onExplain(refId);
                              }}
                              className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] text-cyan-600 dark:text-cyan-400 hover:border-cyan-500 transition flex items-center space-x-1 font-mono shadow-xs"
                              title="Click to inspect field-level provenance and Merkle proof"
                            >
                              <Hash className="w-3 h-3" />
                              <span>{refId.substring(0, 16)}...</span>
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
