import { ULIPUniversalEvent, FieldLineageRecord } from '../types';

export interface ParsedIntermediate {
  event_type: string;
  vendor: string;
  product: string;
  source_type: string;
  timestamp: string; // ISO
  action: 'ALLOW' | 'DENY' | 'DROP' | 'ALERT' | 'AUTH_SUCCESS' | 'AUTH_FAIL' | 'OTHER';
  severity: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source_ip?: string;
  source_port?: number;
  destination_ip?: string;
  destination_port?: number;
  protocol?: string;
  user?: string;
  activity: string;
  fields: Array<{
    raw_field: string;
    raw_value: string;
    ulip_field: string;
    ocsf_field: string;
    confidence: number;
  }>;
  parser_version: string;
  confidence: number;
  unmapped: Record<string, any>;
}

export interface BaseParser {
  name: string;
  version: string;
  vendor: string;
  product: string;
  canParse(rawText: string): boolean;
  parse(rawText: string, eventId: string): ParsedIntermediate | null;
}
