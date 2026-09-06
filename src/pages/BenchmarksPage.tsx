import React, { useState, useEffect } from 'react';
import { BarChart3, Zap, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { fetchBenchmarks } from '../services/api';
import { BenchmarkResult } from '../types';
import { Badge } from '../components/Badge';

export const BenchmarksPage: React.FC = () => {
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([]);
  const [engine, setEngine] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBenchmarks();
  }, []);

  const loadBenchmarks = async () => {
    try {
      setLoading(true);
      const res = await fetchBenchmarks();
      setBenchmarks(res.results);
      setEngine(res.benchmark_engine);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold uppercase tracking-wider font-mono">
            Performance Metrics
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Real Measured Parsing Times & Field Coverage
          </span>
        </div>
        <h1 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
          Standardization & Ingestion Benchmarks
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Engine: <strong>{engine}</strong>. Every parser is benchmarked on raw sample events for throughput,
          normalization success rate, and required OCSF attribute completeness.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden font-mono text-xs shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-[11px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Device / Source</th>
                <th className="p-3">Log Format</th>
                <th className="p-3">Events Tested</th>
                <th className="p-3">Success Rate</th>
                <th className="p-3">Required Field Coverage</th>
                <th className="p-3">Avg Latency</th>
                <th className="p-3">Parser Engine</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900/60">
              {benchmarks.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{b.source}</td>
                  <td className="p-3 text-slate-500 dark:text-slate-400">{b.format}</td>
                  <td className="p-3 text-slate-900 dark:text-white">{b.events_tested}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold">{b.parse_success_rate}</td>
                  <td className="p-3 text-cyan-600 dark:text-cyan-400 font-bold">{b.required_field_coverage}</td>
                  <td className="p-3 text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{b.avg_processing_time}</span>
                  </td>
                  <td className="p-3 text-slate-500 dark:text-slate-400 text-[11px]">{b.parser_version}</td>
                  <td className="p-3 text-right">
                    <Badge label={b.status} variant="status" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
