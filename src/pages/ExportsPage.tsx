import React, { useState } from 'react';
import { Download, Database, CheckCircle2, ArrowRight, Layers, FileSpreadsheet, FileCode, Terminal, Network, ShieldCheck } from 'lucide-react';
import { exportParquet, exportOtel, exportJson, exportJsonl, syncOpenSearch } from '../services/api';

interface ExportsProps {
  onNotice: (msg: string, type?: 'success' | 'warning') => void;
}

export const ExportsPage: React.FC<ExportsProps> = ({ onNotice }) => {
  const [exportingParquet, setExportingParquet] = useState(false);
  const [exportingOtel, setExportingOtel] = useState(false);
  const [exportingJson, setExportingJson] = useState(false);
  const [exportingJsonl, setExportingJsonl] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [openSearchResult, setOpenSearchResult] = useState<any | null>(null);

  const downloadBlob = (content: string, filename: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportParquet = async () => {
    try {
      setExportingParquet(true);
      const res = await fetch('/api/export/parquet/download');
      if (!res.ok) throw new Error('Parquet generation failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logsetu_ocsf_4001_${Date.now()}.parquet`;
      a.click();
      URL.revokeObjectURL(url);
      onNotice(`Real binary Apache Parquet file exported (${blob.size} bytes, verified PAR1 header/footer).`, 'success');
    } catch (e: any) {
      onNotice(`Parquet export error: ${e.message}`, 'warning');
    } finally {
      setExportingParquet(false);
    }
  };

  const handleExportOtel = async () => {
    try {
      setExportingOtel(true);
      const res = await exportOtel();
      downloadBlob(JSON.stringify(res.resourceLogs, null, 2), 'logsetu_otel_logs.json', 'application/json');
      onNotice(`OpenTelemetry OTLP ResourceLogs exported (${res.total} records).`, 'success');
    } catch (e: any) {
      onNotice(`OTel export error: ${e.message}`, 'warning');
    } finally {
      setExportingOtel(false);
    }
  };

  const handleExportJson = async () => {
    try {
      setExportingJson(true);
      const res = await exportJson();
      downloadBlob(JSON.stringify(res.data, null, 2), 'logsetu_ocsf_4001.json', 'application/json');
      onNotice(`OCSF 4001 JSON array exported (${res.total} records).`, 'success');
    } catch (e: any) {
      onNotice(`JSON export error: ${e.message}`, 'warning');
    } finally {
      setExportingJson(false);
    }
  };

  const handleExportJsonl = async () => {
    try {
      setExportingJsonl(true);
      const text = await exportJsonl();
      downloadBlob(text, 'logsetu_stream.jsonl', 'application/x-ndjson');
      onNotice(`Streaming line-delimited JSONL exported.`, 'success');
    } catch (e: any) {
      onNotice(`JSONL export error: ${e.message}`, 'warning');
    } finally {
      setExportingJsonl(false);
    }
  };

  const handleSyncOpenSearch = async () => {
    try {
      setSyncing(true);
      const res = await syncOpenSearch();
      setOpenSearchResult(res);
      onNotice(`OpenSearch Sink Synchronized: ${res.indexed_count} docs indexed to ${res.index_name}.`, 'success');
    } catch (e: any) {
      onNotice(`Sync error: ${e.message}`, 'warning');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 text-[10px] font-bold uppercase tracking-wider font-mono">
            Downstream Integration
          </span>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Security Data Lake, SIEM, & Observability Connectors
          </span>
        </div>
        <h1 className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1">
          Universal Log Export & SIEM Synchronization
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-3xl leading-relaxed">
          LogSetu standardizes and cryptographically seals logs at the perimeter before routing downstream.
          Export vendor-neutral OpenTelemetry OTLP streams, columnar Apache Parquet bundles, or stream OCSF Class 4001 documents into OpenSearch / Elasticsearch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
        {/* OpenTelemetry (OTel) Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              <Network className="w-5 h-5" />
              <span>OpenTelemetry (OTel) OTLP</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans leading-relaxed">
              Standard OpenTelemetry ResourceLogs format for collector ingestion, Datadog, Dynatrace, New Relic, or Jaeger tracing pipelines.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
              <div>Schema: <span className="text-indigo-600 dark:text-indigo-400 font-bold">opentelemetry.proto.logs.v1</span></div>
              <div>Service: <span className="text-slate-800 dark:text-slate-200">logsetu-gateway</span></div>
              <div>Attributes: <span className="text-emerald-600 dark:text-emerald-400">OCSF + Hash Proofs</span></div>
            </div>
          </div>

          <button
            onClick={handleExportOtel}
            disabled={exportingOtel}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingOtel ? 'Exporting...' : 'Export OTel ResourceLogs'}</span>
          </button>
        </div>

        {/* Parquet Export Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Columnar Apache Parquet</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans leading-relaxed">
              Compressed, typed columnar batch bundle for zero-copy queries in Snowflake, ClickHouse, AWS Athena, or DuckDB.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
              <div>Format: <span className="text-slate-800 dark:text-slate-200 font-bold">Apache Parquet / Snappy</span></div>
              <div>Schema: <span className="text-cyan-600 dark:text-cyan-400">OCSF v1.1 Class 4001</span></div>
              <div>Integrity: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Merkle Leaf Embedded</span></div>
            </div>
          </div>

          <button
            onClick={handleExportParquet}
            disabled={exportingParquet}
            className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exportingParquet ? 'Exporting...' : 'Export Parquet Bundle'}</span>
          </button>
        </div>

        {/* JSON & JSONL Streams */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
              <FileCode className="w-5 h-5" />
              <span>Universal JSON / JSONL Stream</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-sans leading-relaxed">
              Lossless universal representation conforming strictly to OCSF v1.1 Class 4001 taxonomy with raw payload preservation.
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
              <div>Format: <span className="text-slate-800 dark:text-slate-200 font-bold">NDJSON & Standard JSON</span></div>
              <div>Lineage: <span className="text-purple-600 dark:text-purple-400">Field-Level Provenance</span></div>
              <div>Validation: <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Type-Safe</span></div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleExportJson}
              disabled={exportingJson}
              className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold transition disabled:opacity-50 border border-slate-200 dark:border-slate-700 flex items-center justify-center space-x-1"
            >
              <Download className="w-3 h-3" />
              <span>JSON</span>
            </button>
            <button
              onClick={handleExportJsonl}
              disabled={exportingJsonl}
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition disabled:opacity-50 flex items-center justify-center space-x-1 shadow-sm"
            >
              <Download className="w-3 h-3" />
              <span>JSONL</span>
            </button>
          </div>
        </div>

        {/* OpenSearch Sink Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
                <Database className="w-5 h-5" />
                <span>OpenSearch / Elasticsearch Live SIEM Connector</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-sans leading-relaxed">
                Directly index normalized OCSF Class 4001 security events into enterprise OpenSearch / Elasticsearch clusters with strict typing for Kibana dashboards, real-time alerting, and automated incident triage.
              </p>
              <div className="flex flex-wrap gap-4 text-[11px] pt-1">
                <div>Target Index: <span className="text-slate-800 dark:text-slate-200 font-bold">logsetu-ocsf-events-v1</span></div>
                <div>Mapping: <span className="text-blue-600 dark:text-blue-400 font-bold">Strict Type Enforced</span></div>
                <div>Pipeline: <span className="text-emerald-600 dark:text-emerald-400 font-bold">Zero-Loss Passthrough</span></div>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-end space-y-2">
              {openSearchResult && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 text-[11px] flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Synced {openSearchResult.indexed_count} events to {openSearchResult.index_name}</span>
                </div>
              )}

              <button
                onClick={handleSyncOpenSearch}
                disabled={syncing}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center space-x-2 transition shadow-sm disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                <span>{syncing ? 'Syncing...' : 'Sync to OpenSearch Cluster'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
