import React, { useState, useEffect } from 'react';
import {
  Network,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  ChevronRight,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { fetchCorrelations, fetchEvents } from '../services/api';
import { CorrelationAlert, ULIPUniversalEvent } from '../types';
import { Badge } from '../components/Badge';

interface CorrelationProps {
  onExplain: (eventId: string) => void;
  onNotice: (msg: string, type?: 'success' | 'warning') => void;
}

export const CorrelationPage: React.FC<CorrelationProps> = ({ onExplain, onNotice }) => {
  const [alerts, setAlerts] = useState<CorrelationAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<CorrelationAlert | null>(null);
  const [incidentEvents, setIncidentEvents] = useState<ULIPUniversalEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCorrelations();
  }, []);

  const loadCorrelations = async () => {
    try {
      setLoading(true);
      const res = await fetchCorrelations();
      setAlerts(res);
      if (res.length > 0) {
        selectAlert(res[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectAlert = async (alert: CorrelationAlert) => {
    setSelectedAlert(alert);
    try {
      const res = await fetchEvents({ limit: 100 });
      const matched = res.events.filter(e => alert.event_ids.includes(e.event_id));
      setIncidentEvents(matched);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-bold uppercase tracking-wider font-mono">
                Explainable Threat Correlation
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Rule-Based Additive Scoring (Zero Blackbox)
              </span>
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              Cross-Source Coordinated Attack Correlation
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              When diverse perimeter appliances speak the same ULIP language, multi-stage attacks become immediately visible.
              Scores are calculated via <strong>fully transparent additive weights</strong> linking identical IP addresses, users,
              temporal windows, and cross-device containment layers.
            </p>
          </div>

          <div className="text-right font-mono text-xs">
            <span className="text-slate-400 block text-[10px] uppercase">Active Incidents</span>
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {alerts.length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Incident List + Deep-Dive Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Alerts List */}
        <div className="space-y-3 font-mono text-xs">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Correlated Attack Incidents
          </span>
          {alerts.length > 0 ? (
            alerts.map(a => {
              const isSelected = selectedAlert?.alert_id === a.alert_id;
              return (
                <div
                  key={a.alert_id}
                  onClick={() => selectAlert(a)}
                  className={`p-4 rounded-2xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[200px]">
                      {a.title}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/80 text-rose-700 dark:text-rose-200 text-[10px] font-bold">
                      Score: {a.score}/100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {a.description}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-500">
                    <span>{a.sources.length} Heterogeneous Devices</span>
                    <Badge label={a.severity} variant="severity" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400">
              No correlation alerts. Click <strong>"Start Judge Demo"</strong> in top navbar to trigger multi-source scenario.
            </div>
          )}
        </div>

        {/* Right 2 Columns: Explainable Breakdown & Multi-Source Timeline */}
        {selectedAlert ? (
          <div className="lg:col-span-2 space-y-6 font-mono text-xs">
            {/* Top Score Breakdown Card (Requirement 13) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      Incident ID: {selectedAlert.alert_id}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(selectedAlert.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {selectedAlert.title}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                    {selectedAlert.score}
                  </span>
                  <span className="text-xs text-slate-400 block uppercase text-[10px]">Additive Score</span>
                </div>
              </div>

              {/* Additive Weight Breakdown (Explainable Scoring) */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Additive Score Calculation (Transparent Weighting)
                </span>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  {selectedAlert.factors.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-rose-600 dark:text-rose-400 w-12">
                          +{f.weight}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {f.factor}
                        </span>
                      </div>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                        {f.detail}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>Total Explainable Score</span>
                    <span className="text-rose-600 dark:text-rose-400">{selectedAlert.score} / 100</span>
                  </div>
                </div>
              </div>

              {/* Contributing Heterogeneous Sources */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                  Contributing Heterogeneous Security Devices
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedAlert.sources.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Attack Progression Timeline across Devices */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Multi-Device Attack Progression Timeline
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Chronological events from {incidentEvents.length} distinct appliances connected by LogSetu
                  </p>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                  Cross-Source Aligned
                </span>
              </div>

              <div className="space-y-3">
                {incidentEvents.map((evt, idx) => (
                  <div
                    key={evt.event_id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {evt.source_vendor} {evt.source_product}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {new Date(evt.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {evt.activity} (IP: {evt.source_ip || '—'} → {evt.destination_ip || '—'})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Badge label={evt.action} variant="action" />
                      <button
                        onClick={() => onExplain(evt.event_id)}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-cyan-600 dark:text-cyan-400 text-[11px] rounded border border-slate-300 dark:border-slate-700 transition"
                      >
                        Explain
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex items-center justify-center text-slate-400 font-mono text-xs">
            Select an incident on the left to inspect explainable correlation factors.
          </div>
        )}
      </div>
    </div>
  );
};
