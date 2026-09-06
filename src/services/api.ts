import {
  ULIPUniversalEvent,
  EventExplainResponse,
  OnboardingAnalysisResponse,
  FieldMappingItem,
  ReplayValidationResult,
  CorrelationAlert,
  IntegrityBatch,
  DashboardStats,
  ParserInfo,
  BenchmarkResult
} from '../types';

const API_BASE = '/api';

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/events/stats`);
  if (!res.ok) throw new Error('Failed to fetch platform metrics');
  return res.json();
}

export async function fetchEvents(params?: {
  source?: string;
  src_ip?: string;
  dst_ip?: string;
  action?: string;
  severity?: string;
  user?: string;
  query?: string;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; limit: number; offset: number; events: ULIPUniversalEvent[] }> {
  const query = new URLSearchParams();
  if (params?.source) query.set('source', params.source);
  if (params?.src_ip) query.set('src_ip', params.src_ip);
  if (params?.dst_ip) query.set('dst_ip', params.dst_ip);
  if (params?.action) query.set('action', params.action);
  if (params?.severity) query.set('severity', params.severity);
  if (params?.user) query.set('user', params.user);
  if (params?.query) query.set('query', params.query);
  if (params?.limit) query.set('limit', params.limit.toString());
  if (params?.offset) query.set('offset', params.offset.toString());

  const res = await fetch(`${API_BASE}/events?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function explainEvent(eventId: string): Promise<EventExplainResponse> {
  const res = await fetch(`${API_BASE}/events/${eventId}/explain`);
  if (!res.ok) throw new Error('Failed to explain event provenance');
  return res.json();
}

export async function ingestLog(raw_log: string, source_hint?: string) {
  const res = await fetch(`${API_BASE}/events/ingest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_log, source_hint })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Ingestion request failed');
  }
  return res.json();
}

export async function fetchUnknownPresets(): Promise<Array<{
  id: string;
  name: string;
  formatLabel: string;
  sampleLog: string;
  description: string;
}>> {
  const res = await fetch(`${API_BASE}/unknown-presets`);
  if (!res.ok) throw new Error('Failed to fetch unknown presets');
  return res.json();
}

export async function analyzeUnknownLogs(
  source_name: string,
  sample_logs: string[]
): Promise<OnboardingAnalysisResponse> {
  const res = await fetch(`${API_BASE}/onboarding/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source_name, sample_logs })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis request failed');
  }
  return res.json();
}

export async function validateMappings(mappings: FieldMappingItem[]): Promise<{
  isValid: boolean;
  requiredCoverage: number;
  errors: string[];
}> {
  const res = await fetch(`${API_BASE}/onboarding/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mappings })
  });
  if (!res.ok) throw new Error('Validation request failed');
  return res.json();
}

export async function runReplayTest(payload: {
  source_name: string;
  mappings: FieldMappingItem[];
  delimiter?: string;
  kv_delimiter?: string;
  format_type?: string;
  test_samples: string[];
}): Promise<ReplayValidationResult> {
  const res = await fetch(`${API_BASE}/onboarding/replay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Replay test failed');
  return res.json();
}

export async function approveOnboarding(payload: {
  job_id: string;
  source_name: string;
  mappings: FieldMappingItem[];
  delimiter?: string;
  kv_delimiter?: string;
  format_type?: string;
}) {
  const res = await fetch(`${API_BASE}/onboarding/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Approval failed');
  }
  return res.json();
}

export async function fetchCorrelations(): Promise<CorrelationAlert[]> {
  const res = await fetch(`${API_BASE}/correlations`);
  if (!res.ok) throw new Error('Failed to fetch correlations');
  return res.json();
}

export async function fetchIntegrityBatches(): Promise<IntegrityBatch[]> {
  const res = await fetch(`${API_BASE}/integrity/batches`);
  if (!res.ok) throw new Error('Failed to fetch integrity batches');
  return res.json();
}

export async function verifyEventIntegrity(eventId: string) {
  const res = await fetch(`${API_BASE}/integrity/${eventId}`);
  if (!res.ok) throw new Error('Failed to verify event integrity');
  return res.json();
}

export async function verifySystemIntegrity() {
  const res = await fetch(`${API_BASE}/integrity/verify`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to verify system integrity');
  return res.json();
}

export async function simulateTamperTest() {
  const res = await fetch(`${API_BASE}/integrity/tamper-test`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to run tamper simulation');
  return res.json();
}

export async function fetchParsers(): Promise<ParserInfo[]> {
  const res = await fetch(`${API_BASE}/parsers`);
  if (!res.ok) throw new Error('Failed to fetch parsers');
  return res.json();
}

export async function fetchBenchmarks(): Promise<{
  benchmark_timestamp: string;
  benchmark_engine: string;
  results: BenchmarkResult[];
}> {
  const res = await fetch(`${API_BASE}/benchmarks`);
  if (!res.ok) throw new Error('Failed to fetch benchmarks');
  return res.json();
}

export async function fetchAggregatedEvents(): Promise<{
  total_raw_events: number;
  aggregated_representations: number;
  noise_reduction_ratio: string;
  aggregations: any[];
}> {
  const res = await fetch(`${API_BASE}/events/aggregated`);
  if (!res.ok) throw new Error('Failed to fetch aggregated events');
  return res.json();
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Failed to fetch health status');
  return res.json();
}

export async function exportJson() {
  const res = await fetch(`${API_BASE}/export/json`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to export JSON');
  return res.json();
}

export async function exportJsonl() {
  const res = await fetch(`${API_BASE}/export/jsonl`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to export JSONL');
  return res.json();
}

export async function exportParquet() {
  const res = await fetch(`${API_BASE}/export/parquet`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to export parquet');
  return res.json();
}

export async function exportOtel() {
  const res = await fetch(`${API_BASE}/export/otel`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to export OpenTelemetry records');
  return res.json();
}

export async function syncOpenSearch() {
  const res = await fetch(`${API_BASE}/export/opensearch`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to sync OpenSearch');
  return res.json();
}

export async function seedDemoScenario() {
  const res = await fetch(`${API_BASE}/demo/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to seed demo scenario');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

