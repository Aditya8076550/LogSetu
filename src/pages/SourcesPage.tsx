import React, { useState, useEffect } from 'react';
import { Cpu, ShieldCheck, Zap, ArrowRight, PlusCircle, CheckCircle2 } from 'lucide-react';
import { fetchParsers } from '../services/api';
import { ParserInfo } from '../types';
import { Badge } from '../components/Badge';

interface SourcesProps {
  onNavigateOnboarding: () => void;
}

export const SourcesPage: React.FC<SourcesProps> = ({ onNavigateOnboarding }) => {
  const [parsers, setParsers] = useState<ParserInfo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadParsers();
  }, []);

  const loadParsers = async () => {
    try {
      setLoading(true);
      const res = await fetchParsers();
      setParsers(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[10px] font-bold uppercase tracking-wider font-mono">
                Appliance Registry
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Connected Perimeter Security Appliances
              </span>
            </div>
            <h1 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
              Active Security Sources & Deterministic Parsers
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Every connected appliance operates on a compiled deterministic fast-path engine.
              Known legacy formats run via optimized regex/tokenizers, while newly onboarded devices execute via safe schema-compiled rules.
            </p>
          </div>

          <button
            onClick={onNavigateOnboarding}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs font-mono flex items-center space-x-1.5 transition shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Onboard Novel Appliance</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
        {parsers.map((p, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {p.vendor} {p.product}
              </span>
              <Badge label={p.status} variant="status" />
            </div>

            <div className="space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
              <div>Engine: <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{p.name} ({p.version})</span></div>
              <div>Category: <span className="text-slate-800 dark:text-slate-200">{p.type}</span></div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-[10px]">Processing Latency</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                <Zap className="w-3.5 h-3.5" />
                <span>{p.latency}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
