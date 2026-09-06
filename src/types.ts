export interface OCSFEndpoint {
  ip?: string;
  port?: number;
  hostname?: string;
}

export interface OCSFSource {
  vendor?: string;
  product?: string;
  version?: string;
}

export interface OCSFUser {
  name?: string;
  domain?: string;
}

export interface ULIPUniversalEvent {
  event_id: string;
  timestamp: string;
  event_time?: string;
  ingestion_time: string;
  source_vendor: string;
  source_product: string;
  source_type: string;
  event_type: string;
  activity: string;
  source_ip?: string;
  source_port?: number;
  destination_ip?: string;
  destination_port?: number;
  protocol?: string;
  action: 'ALLOW' | 'DENY' | 'DROP' | 'ALERT' | 'AUTH_SUCCESS' | 'AUTH_FAIL' | 'OTHER';
  severity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  user?: string;
  raw_event_ref: string;
  parser_version: string;
  parser_confidence: number;
  integrity_hash: string;
  batch_id?: string;
  unmapped: Record<string, any>;
  ocsf_aligned: {
    class_uid: number;
    class_name: string;
    category_uid: number;
    category_name: string;
    src_endpoint: OCSFEndpoint;
    dst_endpoint: OCSFEndpoint;
    source: OCSFSource;
    user?: OCSFUser;
  };
}

export interface FieldLineageItem {
  event_id: string;
  raw_field: string;
  raw_value: string;
  ulip_field: string;
  ocsf_field: string;
  parser_version: string;
  confidence: number;
}

export interface EventExplainResponse {
  event_id: string;
  source_type: string;
  raw_payload: string;
  raw_hash: string;
  integrity_hash: string;
  timestamp: string;
  parser_version: string;
  parser_confidence: number;
  lineage: FieldLineageItem[];
  universal_event: ULIPUniversalEvent;
  ocsf_aligned: any;
}

export interface FieldMappingItem {
  raw_field: string;
  semantic_name: string;
  ocsf_target: string;
  data_type: 'ip' | 'port' | 'timestamp' | 'string' | 'integer' | 'action' | 'severity';
  confidence: number;
  example_value?: string;
  reasoning?: string;
  is_user_edited?: boolean;
}

export interface DiscoveredStructure {
  source_type: string;
  format_type: 'delimited_kv' | 'delimited' | 'xml_tags' | 'json' | 'regex';
  delimiter?: string;
  kv_delimiter?: string;
  header_delimiter?: string;
  wrapper_tag?: string;
  detected_tokens: string[];
  confidence: number;
  explanation?: string;
  fields: FieldMappingItem[];
}

export interface ReplayValidationResult {
  samples_tested: number;
  successfully_parsed: number;
  parse_success_rate: number;
  required_fields_coverage: number;
  mapped_fields_count: number;
  unmapped_fields_count: number;
  unknown_fields: string[];
  malformed_events: number;
  type_conflicts: string[];
  schema_conflicts: string[];
  replay_status: 'PASS' | 'FAIL';
  activation_readiness: 'READY' | 'PENDING';
  is_ready_for_activation: boolean;
  sample_previews: Array<{
    raw: string;
    parsed: any;
    valid: boolean;
  }>;
}

export interface ConfidenceSummary {
  ai_mapping_confidence: number;
  heuristic_label: string;
  schema_validation: 'PASS' | 'FAIL';
  field_type_validation: 'PASS' | 'FAIL';
  replay_validation: 'PASS' | 'FAIL';
  activation_readiness: 'READY' | 'PENDING';
}

export interface ParserSpecification {
  source_identity?: {
    name: string;
    vendor?: string;
    product?: string;
    format: string;
    fingerprint?: any;
  };
  field_mappings?: Record<string, string>;
  source_type: string;
  version: string;
  format_type: string;
  delimiter?: string;
  kv_delimiter?: string;
  header_delimiter?: string;
  tag_pattern?: string;
  mappings: FieldMappingItem[];
  event_mappings?: Record<string, string>;
  severity_mappings?: Record<string, string>;
  fingerprint?: {
    source?: string;
    format?: string;
    required_prefix?: string;
    required_tokens?: string[];
    delimiter?: string;
    header_delimiter?: string;
    min_segments?: number;
    min_delimiter_count?: number;
    action_tokens?: string[];
  };
  confidence_summary?: ConfidenceSummary;
  created_at: string;
}

export interface OnboardingAnalysisResponse {
  job_id: string;
  source_name: string;
  detected_structure: DiscoveredStructure;
  proposed_mappings: FieldMappingItem[];
  confidence: number;
  confidence_summary: ConfidenceSummary;
  parser_specification: ParserSpecification;
  time_to_analyze_seconds: number;
  replay_result: ReplayValidationResult;
  explanation?: string;
}

export interface CorrelationFactor {
  factor: string;
  weight: number;
  detail: string;
}

export interface CorrelationAlert {
  alert_id: string;
  title: string;
  description: string;
  correlated_ip?: string;
  correlated_user?: string;
  sources: string[];
  event_ids: string[];
  score: number;
  factors: CorrelationFactor[];
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

export interface IntegrityBatch {
  batch_id: string;
  merkle_root: string;
  previous_batch_root: string;
  chain_hash: string;
  event_count: number;
  event_hashes: string[];
  created_at: string;
}

export interface DashboardStats {
  total_events: number;
  normalized_events: number;
  unknown_events: number;
  correlation_alerts: number;
  integrity_status: string;
  active_parsers: number;
  adaptive_aggregation?: {
    raw_count: number;
    aggregated_count: number;
    reduction_ratio: string;
  };
  source_distribution: { name: string; value: number }[];
  action_distribution: { action: string; count: number }[];
  severity_distribution: { severity: string; count: number }[];
}

export interface AdaptiveAggregationRecord {
  aggregation_id: string;
  window: string;
  count: number;
  source: string;
  source_ip?: string;
  destination_ip?: string;
  action: string;
  severity: string;
  first_seen: string;
  last_seen: string;
  representative_event: ULIPUniversalEvent;
  raw_event_refs: string[];
}

export interface ParserInfo {
  name: string;
  version: string;
  type: string;
  vendor: string;
  product: string;
  status: string;
  latency: string;
  fields_count?: number;
}

export interface BenchmarkResult {
  source: string;
  format: string;
  events_tested: number;
  events_parsed: number;
  parse_success_rate: string;
  required_field_coverage: string;
  avg_processing_time: string;
  parser_version: string;
  status: string;
}

export interface OTelLogRecord {
  timeUnixNano: string;
  observedTimeUnixNano: string;
  severityNumber: number;
  severityText: string;
  body: { stringValue: string };
  attributes: Array<{
    key: string;
    value: { stringValue?: string; intValue?: number; boolValue?: boolean };
  }>;
}

export interface OTelResourceLog {
  resource: {
    attributes: Array<{
      key: string;
      value: { stringValue: string };
    }>;
  };
  scopeLogs: Array<{
    scope: { name: string; version: string };
    logRecords: OTelLogRecord[];
  }>;
}

