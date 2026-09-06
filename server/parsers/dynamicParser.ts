import { BaseParser, ParsedIntermediate } from './base';
import { ParserSpecification } from '../types';
import { standardizeAction, standardizeSeverity } from '../taxonomy';

export class DynamicConfiguredParser implements BaseParser {
  public name: string;
  public version: string;
  public vendor: string;
  public product: string;
  public spec: ParserSpecification;

  constructor(spec: ParserSpecification) {
    this.spec = spec;
    this.name = spec.source_type;
    this.version = spec.version || `${spec.source_type}-v1.0`;
    this.vendor = spec.source_identity?.vendor || 'Custom Appliance';
    this.product = (spec.source_identity?.product || spec.source_type).toUpperCase();
  }

  canParse(rawText: string): boolean {
    const text = rawText.trim();
    if (!text) return false;

    const fp = this.spec.fingerprint || this.spec.source_identity?.fingerprint || {};
    const format = this.spec.format_type || this.spec.source_identity?.format || 'delimited_kv';

    // 1. JSON Structured Fingerprint Check
    if (format === 'json') {
      if (!text.startsWith('{') || !text.endsWith('}')) return false;
      try {
        const obj = JSON.parse(text);
        if (fp.required_markers && fp.required_markers.length > 0) {
          const hasMarkers = fp.required_markers.every(k => k in obj);
          if (!hasMarkers) return false;
        }
        return true;
      } catch {
        return false;
      }
    }

    // 2. XML / Tag structured fingerprint
    if (format === 'xml_tags') {
      if (text.startsWith('<') && text.includes('>')) {
        const hasAttributes = text.includes('="') || text.includes("='");
        if (!hasAttributes) return false;
        if (fp.required_markers && fp.required_markers.length > 0) {
          const matchCount = fp.required_markers.filter(m => text.includes(m)).length;
          return matchCount >= Math.min(fp.required_markers.length, 2);
        }
        return true;
      }
      return false;
    }

    // 3. Header Prefix / Identifier Check
    const headerPrefix = fp.header_prefix || fp.required_prefix;
    if (headerPrefix && text.startsWith(headerPrefix)) {
      return true;
    }

    const sourceTag = (fp.source || this.spec.source_type || '').toUpperCase();
    if (sourceTag && (text.toUpperCase().startsWith(sourceTag))) {
      return true;
    }

    // 4. Delimiter & Segment Pattern Check
    const delimiter = fp.delimiter || this.spec.delimiter || '|';
    const headerDelim = fp.header_delimiter || this.spec.header_delimiter;

    let payload = text;
    if (headerDelim && text.includes(headerDelim)) {
      const parts = text.split(headerDelim);
      if (parts.length >= 2) {
        payload = parts.slice(1).join(headerDelim);
      }
    }

    const segments = payload.split(delimiter);
    const minSegments = fp.segment_pattern || fp.min_segments || fp.min_delimiter_count || 2;

    if (segments.length >= minSegments) {
      // Check required structural markers (e.g. ["U=", "IP="] or ["SRC=", "DST="] or ["usr=", "remote="])
      const requiredMarkers = fp.required_markers || fp.required_tokens || [];
      if (requiredMarkers.length > 0) {
        const upperText = text.toUpperCase();
        const matches = requiredMarkers.filter(m => upperText.includes(m.toUpperCase()));
        const threshold = Math.min(requiredMarkers.length, 2);
        if (matches.length >= threshold) {
          return true;
        }
      } else {
        return true;
      }
    }

    return false;
  }

  parse(rawText: string, eventId?: string): ParsedIntermediate | null {
    try {
      const text = rawText.trim();
      const format = this.spec.format_type || this.spec.source_identity?.format || 'delimited_kv';
      const fp = this.spec.fingerprint || this.spec.source_identity?.fingerprint || {};
      const extractedKv: Record<string, string> = {};

      if (format === 'json') {
        const parsedJson = JSON.parse(text);
        this.flattenObject(parsedJson, '', extractedKv);
      } else if (format === 'xml_tags') {
        // Generic XML attribute extraction: attr="value" or attr='value'
        const attrRegex = /([a-zA-Z0-9_\-:]+)=["']([^"']*)["']/g;
        let m: RegExpExecArray | null;
        while ((m = attrRegex.exec(text)) !== null) {
          extractedKv[m[1].toUpperCase()] = m[2];
        }
      } else {
        // Generic Delimited / KV parsing
        const delimiter = fp.delimiter || this.spec.delimiter || '|';
        const kvDelim = fp.kv_delimiter || this.spec.kv_delimiter || '=';
        const headerDelim = fp.header_delimiter || this.spec.header_delimiter;

        let payload = text;
        // Generic header separation if header delimiter is specified in spec
        if (headerDelim && text.includes(headerDelim)) {
          const idx = text.indexOf(headerDelim);
          const header = text.substring(0, idx).trim();
          payload = text.substring(idx + headerDelim.length).trim();
          extractedKv['HEADER_PREFIX'] = header;
        } else if (fp.header_prefix && text.startsWith(fp.header_prefix)) {
          payload = text.substring(fp.header_prefix.length).trim();
        }

        const tokens = payload.split(delimiter);
        for (let i = 0; i < tokens.length; i++) {
          const tok = tokens[i].trim();
          if (!tok) continue;

          if (kvDelim && tok.includes(kvDelim)) {
            const splitIdx = tok.indexOf(kvDelim);
            const k = tok.substring(0, splitIdx).trim().toUpperCase();
            const v = tok.substring(splitIdx + kvDelim.length).trim().replace(/^["']|["']$/g, '');
            extractedKv[k] = v;
          } else {
            // Positional or unlabeled token
            const upper = tok.toUpperCase();
            extractedKv[`POS_${i}`] = tok;

            // Generic action recognition via spec action_tokens or taxonomy
            if (['LOGIN_FAIL', 'AUTH_DENIED', 'AUTH_FAIL', 'DENY', 'ALLOW', 'DROP', 'ALERT', 'BLOCK', 'PERMIT', 'REJECT', 'DENIED', 'ALLOWED'].includes(upper)) {
              extractedKv['ACTION'] = upper;
            } else if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL', 'INFO', 'WARN', 'WARNING'].includes(upper)) {
              extractedKv['SEV'] = upper;
            } else if ((tok.includes('/') || tok.includes('-')) && tok.includes(':')) {
              extractedKv['TIMESTAMP'] = tok;
            }
          }
        }
      }

      // Map according to learned specification mappings
      let srcIp: string | undefined;
      let srcPort: number | undefined;
      let dstIp: string | undefined;
      let dstPort: number | undefined;
      let actionRaw = extractedKv['ACTION'] || extractedKv['ACT'];
      let sevRaw = extractedKv['SEV'] || extractedKv['SEVERITY'] || extractedKv['R'] || extractedKv['LEVEL'];
      let user: string | undefined;
      let protocol: string | undefined;
      const fields = [];

      const mappingsList = this.spec.mappings || [];
      for (const m of mappingsList) {
        const rawK = m.raw_field.toUpperCase();
        // Check exact key or positional key
        const val = extractedKv[rawK] || extractedKv[m.raw_field];

        if (val !== undefined) {
          fields.push({
            raw_field: m.raw_field,
            raw_value: val,
            ulip_field: m.semantic_name,
            ocsf_field: m.ocsf_target,
            confidence: m.confidence || 0.98
          });

          if (m.ocsf_target === 'src_endpoint.ip') {
            srcIp = val;
          } else if (m.ocsf_target === 'src_endpoint.port') {
            srcPort = /^\d+$/.test(val) ? parseInt(val, 10) : undefined;
          } else if (m.ocsf_target === 'dst_endpoint.ip') {
            dstIp = val;
          } else if (m.ocsf_target === 'dst_endpoint.port') {
            dstPort = /^\d+$/.test(val) ? parseInt(val, 10) : undefined;
          } else if (m.ocsf_target === 'action') {
            actionRaw = val;
          } else if (m.ocsf_target === 'severity') {
            sevRaw = val;
          } else if (m.ocsf_target === 'user.name' || m.ocsf_target === 'user') {
            user = val;
          } else if (m.ocsf_target === 'protocol') {
            protocol = val;
          }
        }
      }

      // Apply event action mappings from spec if defined
      let action = 'OTHER' as any;
      if (actionRaw) {
        if (this.spec.event_mappings && this.spec.event_mappings[actionRaw.toUpperCase()]) {
          action = standardizeAction(this.spec.event_mappings[actionRaw.toUpperCase()]);
        } else {
          action = standardizeAction(actionRaw);
        }
      }

      // Apply severity mappings from spec if defined
      let severity = 'INFORMATIONAL' as any;
      if (sevRaw) {
        if (this.spec.severity_mappings && this.spec.severity_mappings[sevRaw.toUpperCase()]) {
          severity = standardizeSeverity(this.spec.severity_mappings[sevRaw.toUpperCase()]);
        } else {
          severity = standardizeSeverity(sevRaw);
        }
      }

      // Timestamp resolution
      let timestamp = 'SOURCE_TIMESTAMP_UNAVAILABLE';
      if (this.spec.timestamp_mapping && extractedKv[this.spec.timestamp_mapping.toUpperCase()]) {
        timestamp = extractedKv[this.spec.timestamp_mapping.toUpperCase()];
      } else {
        const sourceTimestamp = extractedKv['TIMESTAMP'] || extractedKv['TIME'] || extractedKv['T'] || extractedKv['DATE'] || extractedKv['DATETIME'];
        if (sourceTimestamp) {
          timestamp = sourceTimestamp;
        }
      }

      return {
        event_type: `${this.product} Normalized Security Event`,
        vendor: this.vendor,
        product: this.product,
        source_type: this.name,
        timestamp,
        action,
        severity,
        source_ip: srcIp,
        source_port: srcPort,
        destination_ip: dstIp,
        destination_port: dstPort,
        protocol,
        user,
        activity: `${this.product} Security Enforcement (${action})`,
        fields,
        parser_version: this.version,
        confidence: 0.98,
        unmapped: extractedKv
      };
    } catch {
      return null;
    }
  }

  private flattenObject(obj: any, prefix: string, target: Record<string, string>): void {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, v] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
        this.flattenObject(v, fullKey, target);
      } else if (v !== null && v !== undefined) {
        target[fullKey.toUpperCase()] = String(v);
        target[k.toUpperCase()] = String(v); // also store un-nested short key
      }
    }
  }
}

