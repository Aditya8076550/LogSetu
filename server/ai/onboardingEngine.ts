import { GoogleGenAI } from '@google/genai';
import { DiscoveredStructure, DiscoveredField } from '../types';
import { redactSensitiveData } from './redaction';

export async function analyzeUnknownLogs(
  sourceName: string,
  samples: string[]
): Promise<DiscoveredStructure> {
  const cleanSamples = samples
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, 8);

  if (cleanSamples.length === 0) {
    throw new Error('No sample logs provided for structure discovery.');
  }

  // Local Privacy-First Redaction
  const redactedSamples = cleanSamples.map(s => redactSensitiveData(s).redactedText);

  // Try Gemini API if key is available
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are LogSetu's AI Security Log Architect.
Analyze the following unknown perimeter security log samples.
Discover their structural syntax, extract semantic fields, and map them to OCSF v1.1 Class 4001 (Network Activity).

SAMPLES:
${redactedSamples.join('\n')}

Output JSON format strictly matching this JSON schema:
{
  "source_type": "${sourceName || 'unknown_appliance'}",
  "format_type": "delimited_kv" | "delimited" | "xml_tags" | "json",
  "delimiter": string or null,
  "kv_delimiter": string or null,
  "header_delimiter": string or null,
  "explanation": "Brief explanation of format discovered",
  "confidence": 0.95,
  "fields": [
    {
      "raw_field": "token or key name",
      "semantic_name": "source_ip | destination_ip | source_port | destination_port | action | severity | username | protocol | timestamp",
      "ocsf_target": "src_endpoint.ip | dst_endpoint.ip | src_endpoint.port | dst_endpoint.port | action | severity | user.name | protocol | timestamp",
      "data_type": "ip" | "port" | "timestamp" | "string" | "integer" | "action" | "severity",
      "confidence": 0.95,
      "example_value": "example value",
      "reasoning": "rationale for mapping"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed && parsed.fields && Array.isArray(parsed.fields)) {
          return {
            source_type: sourceName || parsed.source_type || 'unknown_device',
            format_type: parsed.format_type || 'delimited_kv',
            delimiter: parsed.delimiter,
            kv_delimiter: parsed.kv_delimiter,
            header_delimiter: parsed.header_delimiter,
            detected_tokens: parsed.fields.map((f: any) => f.raw_field),
            confidence: parsed.confidence || 0.94,
            explanation: parsed.explanation || 'Structure discovered via AI model analysis.',
            fields: parsed.fields
          };
        }
      }
    } catch (geminiErr) {
      console.warn('Gemini API call failed, gracefully using local discovery engine:', geminiErr);
    }
  }

  // High-Fidelity Local Air-Gapped Structure Discovery Fallback
  return discoverStructureLocally(sourceName, cleanSamples);
}

function discoverStructureLocally(sourceName: string, samples: string[]): DiscoveredStructure {
  const firstLine = samples[0];
  const fields: DiscoveredField[] = [];

  // Case 1: JSON format
  if (firstLine.startsWith('{') && firstLine.endsWith('}')) {
    try {
      const obj = JSON.parse(firstLine);
      for (const [k, v] of Object.entries(obj)) {
        inferFieldMapping(k, String(v), fields);
      }
      return {
        source_type: sourceName || 'json_security_feed',
        format_type: 'json',
        detected_tokens: fields.map(f => f.raw_field),
        confidence: 0.97,
        explanation: 'Discovered standard JSON structured security object.',
        fields
      };
    } catch {
      // fallback
    }
  }

  // Case 2: XML / Tag based format (e.g. <evt t="10:44:02" usr="admin" remote="10.1.4.8" act="denied" dst="server01" sev="critical"/>)
  if (firstLine.startsWith('<') && firstLine.includes('>')) {
    const attrRegex = /([a-zA-Z0-9_\-:]+)=["']([^"']*)["']/g;
    let m: RegExpExecArray | null;
    while ((m = attrRegex.exec(firstLine)) !== null) {
      const k = m[1];
      const v = m[2];
      inferFieldMapping(k, v, fields);
    }

    return {
      source_type: sourceName || 'xml_tag_appliance',
      format_type: 'xml_tags',
      detected_tokens: fields.map(f => f.raw_field),
      confidence: 0.96,
      explanation: 'Discovered tag-based XML attribute schema with key-value pairs.',
      fields
    };
  }

  // Case 3: Delimited formats (e.g. GWX#2026/09/06 10:42|LOGIN_FAIL|U=admin|IP=10.1.4.8|R=HIGH or SECURENODE::... or EDGESEC|...)
  let delimiter = '|';
  if (firstLine.includes('::')) delimiter = '::';
  else if (firstLine.includes('|')) delimiter = '|';
  else if (firstLine.includes(';') && !firstLine.includes('&#')) delimiter = ';';
  else if (firstLine.includes(',')) delimiter = ',';

  let kvDelimiter: string | undefined = undefined;
  if (firstLine.includes('=')) kvDelimiter = '=';
  else if (firstLine.includes(':') && delimiter !== '::') kvDelimiter = ':';

  let headerDelimiter: string | undefined = undefined;
  let payload = firstLine;

  // Detect header delimiters like '#' or custom prefix
  if (firstLine.includes('#') && delimiter !== '#') {
    headerDelimiter = '#';
    const parts = firstLine.split('#', 2);
    payload = parts[1];
  }

  const tokens = payload.split(delimiter).map(t => t.trim());

  for (const token of tokens) {
    if (kvDelimiter && token.includes(kvDelimiter)) {
      const [k, v] = token.split(kvDelimiter, 2);
      inferFieldMapping(k.trim(), v.trim().replace(/^["']|["']$/g, ''), fields);
    } else {
      // Positional token check
      const upper = token.toUpperCase();
      if (['LOGIN_FAIL', 'AUTH_DENIED', 'DENY', 'ALLOW', 'DROP', 'ALERT', 'BLOCK', 'PERMIT', 'REJECT', 'FAILED', 'SUCCESS'].includes(upper)) {
        fields.push({
          raw_field: 'ACTION',
          semantic_name: 'action',
          ocsf_target: 'action',
          data_type: 'action',
          confidence: 0.99,
          example_value: token,
          reasoning: 'Security enforcement disposition verb detected in stream'
        });
      } else if ((token.includes('/') || token.includes('-')) && token.includes(':')) {
        fields.push({
          raw_field: 'TIMESTAMP',
          semantic_name: 'timestamp',
          ocsf_target: 'timestamp',
          data_type: 'timestamp',
          confidence: 0.98,
          example_value: token,
          reasoning: 'Date & clock timestamp pattern'
        });
      }
    }
  }

  return {
    source_type: sourceName || 'custom_appliance',
    format_type: kvDelimiter ? 'delimited_kv' : 'delimited',
    delimiter,
    kv_delimiter: kvDelimiter,
    header_delimiter: headerDelimiter,
    detected_tokens: fields.map(f => f.raw_field),
    confidence: 0.95,
    explanation: `Discovered delimited key-value log syntax using separator "${delimiter}" and KV delimiter "${kvDelimiter || 'none'}".`,
    fields
  };
}

function inferFieldMapping(k: string, v: string, fields: DiscoveredField[]): void {
  const kLower = k.toLowerCase();
  const kUpper = k.toUpperCase();

  if (kLower === 'remote' || kLower === 'src' || kLower === 'ip' || kUpper === 'IP' || kUpper.includes('SRC') || kUpper.includes('ORIGIN') || kLower === 'client_ip' || kLower === 'source_ip') {
    if (kUpper.includes('PORT') || kUpper === 'SPORT') {
      fields.push({
        raw_field: k,
        semantic_name: 'source_port',
        ocsf_target: 'src_endpoint.port',
        data_type: 'port',
        confidence: 0.98,
        example_value: v,
        reasoning: 'Source network client port'
      });
    } else {
      fields.push({
        raw_field: k,
        semantic_name: 'source_ip',
        ocsf_target: 'src_endpoint.ip',
        data_type: 'ip',
        confidence: 0.99,
        example_value: v,
        reasoning: 'Origin client IPv4/IPv6 address'
      });
    }
  } else if (kLower === 'dst' || kLower === 'target' || kLower === 'dest' || kUpper.includes('DST') || kUpper.includes('DEST') || kLower === 'destination_ip') {
    if (kUpper.includes('PORT') || kUpper === 'DPORT') {
      fields.push({
        raw_field: k,
        semantic_name: 'destination_port',
        ocsf_target: 'dst_endpoint.port',
        data_type: 'port',
        confidence: 0.98,
        example_value: v,
        reasoning: 'Destination service listening port'
      });
    } else {
      fields.push({
        raw_field: k,
        semantic_name: 'destination_ip',
        ocsf_target: 'dst_endpoint.ip',
        data_type: 'ip',
        confidence: 0.97,
        example_value: v,
        reasoning: 'Target server endpoint address'
      });
    }
  } else if (kLower === 'usr' || kLower === 'user' || kLower === 'actor' || kUpper === 'U' || kUpper.includes('USR') || kUpper.includes('USER') || kUpper.includes('ACTOR')) {
    fields.push({
      raw_field: k,
      semantic_name: 'user',
      ocsf_target: 'user.name',
      data_type: 'string',
      confidence: 0.97,
      example_value: v,
      reasoning: 'Authenticated subject username or principal identity'
    });
  } else if (kLower === 'act' || kLower === 'action' || kUpper === 'ACTION' || kLower === 'status') {
    fields.push({
      raw_field: k,
      semantic_name: 'action',
      ocsf_target: 'action',
      data_type: 'action',
      confidence: 0.99,
      example_value: v,
      reasoning: 'Access control enforcement decision verb'
    });
  } else if (kLower === 'sev' || kLower === 'severity' || kUpper === 'R' || kUpper.includes('SEV') || kLower === 'risk' || kLower === 'level') {
    fields.push({
      raw_field: k,
      semantic_name: 'severity',
      ocsf_target: 'severity',
      data_type: 'severity',
      confidence: 0.98,
      example_value: v,
      reasoning: 'Security incident risk severity classification'
    });
  } else if (kLower === 't' || kLower === 'time' || kLower === 'timestamp' || kLower === 'date' || kLower === 'datetime') {
    fields.push({
      raw_field: k,
      semantic_name: 'timestamp',
      ocsf_target: 'timestamp',
      data_type: 'timestamp',
      confidence: 0.96,
      example_value: v,
      reasoning: 'Event occurrence clock time'
    });
  } else if (kUpper.includes('PROTO') || kLower === 'protocol') {
    fields.push({
      raw_field: k,
      semantic_name: 'protocol',
      ocsf_target: 'protocol',
      data_type: 'string',
      confidence: 0.95,
      example_value: v,
      reasoning: 'Network layer transport protocol'
    });
  } else if (kUpper.includes('ZONE')) {
    fields.push({
      raw_field: k,
      semantic_name: 'network_zone',
      ocsf_target: 'unmapped.zone',
      data_type: 'string',
      confidence: 0.90,
      example_value: v,
      reasoning: 'Firewall network segment zone'
    });
  } else if (kUpper.includes('REASON') || kUpper.includes('POLICY')) {
    fields.push({
      raw_field: k,
      semantic_name: 'policy_id',
      ocsf_target: 'activity',
      data_type: 'string',
      confidence: 0.92,
      example_value: v,
      reasoning: 'Security rule or enforcement policy identifier'
    });
  } else {
    fields.push({
      raw_field: k,
      semantic_name: k.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      ocsf_target: `unmapped.${k.toLowerCase()}`,
      data_type: 'string',
      confidence: 0.88,
      example_value: v,
      reasoning: 'Extracted source attribute preserved for forensic completeness'
    });
  }
}

