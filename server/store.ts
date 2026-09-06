import {
  ULIPUniversalEvent,
  RawEventRecord,
  FieldLineageRecord,
  ParserSpecification,
  IntegrityBatch,
  CorrelationAlert,
  AdaptiveAggregationRecord
} from './types';
import { computeSha256, computeCanonicalJsonHash, computeChainHash, GENESIS_HASH, MerkleTree } from './integrity';
import { detectSourceAndParser, BUILTIN_DETERMINISTIC_PARSERS } from './parsers/detector';
import { DynamicConfiguredParser } from './parsers/dynamicParser';
import { evaluateCorrelation } from './correlation/correlator';

export const UNKNOWN_FORMAT_PRESETS = [
  {
    id: 'gwx_gateway',
    name: 'GWX Perimeter Access Gateway',
    formatLabel: 'Synthetic proprietary format — demonstration source',
    sampleLog: 'GWX#2026/09/06 10:42|LOGIN_FAIL|U=admin|IP=10.1.4.8|R=HIGH',
    description: 'Pipe-delimited format with hash header (#) and key-value attributes.'
  },
  {
    id: 'securenode_appliance',
    name: 'SecureNode Industrial Appliance',
    formatLabel: 'Synthetic proprietary format — demonstration source',
    sampleLog: 'SECURENODE::2026-09-06T10:43:11::AUTH_DENIED::actor=admin::origin=10.1.4.8::target=server01',
    description: 'Double-colon (::) delimited key-value token stream.'
  },
  {
    id: 'xml_micro_appliance',
    name: 'Embedded Micro-Firewall',
    formatLabel: 'Synthetic proprietary format — demonstration source',
    sampleLog: '<evt t="10:44:02" usr="admin" remote="10.1.4.8" act="denied" dst="server01" sev="critical"/>',
    description: 'XML / Tag-based attribute stream with quoted parameters.'
  },
  {
    id: 'edgesec_device',
    name: 'EDGESEC Multi-Zone UTM',
    formatLabel: 'Synthetic proprietary format — demonstration source',
    sampleLog: 'EDGESEC|2026-08-20T10:31:44Z|DENY|SRC=10.20.4.18|DST=172.16.2.10|SPORT=51521|DPORT=443|USR=rahul|ZONE=EXT|REASON=POLICY_17|SEV=HIGH',
    description: 'Multi-attribute perimeter firewall record with positional action and zone keys.'
  }
];

export const JUDGE_DEMO_LOGS = [
  // Multi-source coordinated attack on subject 10.20.4.5 & user rahul
  'date=2026-08-20 time=10:31:44 devname="FGT-60F" type="traffic" subtype="forward" action="deny" srcip=10.20.4.5 dstip=172.16.2.10 srcport=51521 dstport=443 proto=6 service="HTTPS" policyid=17 user="rahul" level="warning"',
  '%ASA-4-106023: Deny tcp src outside:10.20.4.5/51523 dst inside:172.16.2.10/22 by access-group "OUTSIDE-IN" [0x106023]',
  'filterlog[1234]: 4,,,1000000103,em0,match,block,in,4,0x0,,64,0,0,DF,6,tcp,60,10.20.4.5,172.16.2.10,51524,445,0,S,12345678,,65535,,',
  '{"timestamp":"2026-08-20T10:32:01.123456+0000","event_type":"alert","src_ip":"10.20.4.5","src_port":51521,"dest_ip":"172.16.2.10","dest_port":443,"proto":"TCP","alert":{"action":"alert","gid":1,"signature_id":2100498,"rev":7,"signature":"ET EXPLOIT Suspicious Multi-Port Lateral Reconnaissance","category":"Attempted Information Leak","severity":1}}',
  'openvpn[2341]: AUTH_FAILED,user=rahul,src_ip=10.20.4.5,src_port=51525,dst_ip=172.16.2.1,reason="brute_force_lockout"',
  'sshd[4192]: Failed password for rahul from 10.20.4.5 port 49822 ssh2',
  'Microsoft-Windows-Security-Auditing: EventID=4625 An account failed to log on. Account: rahul, Source Network Address: 10.20.4.5, Source Port: 53124',
  '%SEC-6-IPACCESSLOGP: list 101 denied tcp 10.20.4.5(51526) -> 172.16.2.10(3389), 1 packet',
  // Repetitive background port scan connection events (Demonstrates Adaptive Noise Reduction)
  '%ASA-4-106023: Deny tcp src outside:198.51.100.44/41201 dst inside:172.16.2.10/80 by access-group "OUTSIDE-IN" [0x106023]',
  '%ASA-4-106023: Deny tcp src outside:198.51.100.44/41202 dst inside:172.16.2.10/80 by access-group "OUTSIDE-IN" [0x106023]',
  '%ASA-4-106023: Deny tcp src outside:198.51.100.44/41203 dst inside:172.16.2.10/80 by access-group "OUTSIDE-IN" [0x106023]',
  '%ASA-4-106023: Deny tcp src outside:198.51.100.44/41204 dst inside:172.16.2.10/80 by access-group "OUTSIDE-IN" [0x106023]',
  // Normal background traffic
  '%ASA-6-302013: Built outbound TCP connection 208394 for outside:198.51.100.22/443 to inside:10.0.1.5/49152',
  'openvpn[2341]: CONNECTION_SUCCESS,user=vikram,src_ip=192.168.1.105,assigned_ip=10.8.0.14'
];

export class LogSetuStore {
  public rawEvents: Map<string, RawEventRecord> = new Map();
  public universalEvents: Map<string, ULIPUniversalEvent> = new Map();
  public lineages: Map<string, FieldLineageRecord[]> = new Map();
  public dynamicSpecs: Map<string, ParserSpecification> = new Map();
  public dynamicParsers: Map<string, DynamicConfiguredParser> = new Map();
  public integrityBatches: IntegrityBatch[] = [];
  public correlationAlerts: CorrelationAlert[] = [];
  public onboardingJobs: Map<string, any> = new Map();

  constructor() {
    this.seedDefaultState();
  }

  public seedDefaultState(): void {
    // Start fresh and seed initial judge demo dataset
    this.rawEvents.clear();
    this.universalEvents.clear();
    this.lineages.clear();
    this.integrityBatches = [];
    this.correlationAlerts = [];
    this.onboardingJobs.clear();

    for (const log of JUDGE_DEMO_LOGS) {
      this.ingestSingleLog(log);
    }
  }

  public getActiveDynamicParsers(): DynamicConfiguredParser[] {
    return Array.from(this.dynamicParsers.values());
  }

  public registerDynamicParser(spec: ParserSpecification): DynamicConfiguredParser {
    const cleanSpec: ParserSpecification = {
      ...spec,
      source_identity: spec.source_identity || {
        name: spec.source_type,
        vendor: 'Custom Appliance',
        product: spec.source_type.toUpperCase(),
        format: (spec.format_type as any) || 'delimited_kv',
        fingerprint: {
          delimiter: spec.delimiter || spec.fingerprint?.delimiter || '|',
          kv_delimiter: spec.kv_delimiter || '=',
          header_delimiter: spec.header_delimiter || spec.fingerprint?.header_delimiter,
          required_markers: spec.fingerprint?.required_tokens || spec.mappings?.map(m => m.raw_field).slice(0, 3)
        }
      },
      field_mappings: spec.field_mappings || (spec.mappings || []).reduce((acc: any, m) => {
        acc[m.raw_field] = m.ocsf_target;
        return acc;
      }, {})
    };

    this.dynamicSpecs.set(spec.source_type, cleanSpec);
    const parser = new DynamicConfiguredParser(cleanSpec);
    this.dynamicParsers.set(spec.source_type, parser);
    return parser;
  }

  public ingestSingleLog(rawText: string, sourceHint?: string): {
    event_id: string;
    source_type: string;
    status: 'NORMALIZED' | 'UNKNOWN_FORMAT_REQUIRES_ONBOARDING';
    raw_hash: string;
    integrity_hash: string;
    parser_version: string;
    parser_confidence: number;
    normalized?: ULIPUniversalEvent;
  } {
    const text = rawText.trim();
    const eventId = `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const rawHash = computeSha256(text);

    // Save Raw Event (Lossless Preservation)
    const rawRecord: RawEventRecord = {
      event_id: eventId,
      source_type: 'unknown',
      raw_payload: text,
      raw_hash: rawHash,
      ingested_at: new Date().toISOString()
    };

    const { sourceName, parser, confidence } = detectSourceAndParser(text, this.getActiveDynamicParsers());
    rawRecord.source_type = sourceName;
    this.rawEvents.set(eventId, rawRecord);

    if (!parser) {
      return {
        event_id: eventId,
        source_type: 'unknown',
        status: 'UNKNOWN_FORMAT_REQUIRES_ONBOARDING',
        raw_hash: rawHash,
        integrity_hash: rawHash,
        parser_version: 'none',
        parser_confidence: confidence
      };
    }

    const intermediate = parser.parse(text, eventId);
    if (!intermediate) {
      return {
        event_id: eventId,
        source_type: sourceName,
        status: 'UNKNOWN_FORMAT_REQUIRES_ONBOARDING',
        raw_hash: rawHash,
        integrity_hash: rawHash,
        parser_version: parser.version,
        parser_confidence: 0.5
      };
    }

    // Canonical digest
    const canonicalPayload = {
      event_id: eventId,
      timestamp: intermediate.timestamp,
      class_uid: 4001,
      action: intermediate.action,
      severity: intermediate.severity,
      source_ip: intermediate.source_ip,
      source_port: intermediate.source_port,
      destination_ip: intermediate.destination_ip,
      destination_port: intermediate.destination_port,
      protocol: intermediate.protocol,
      user: intermediate.user
    };
    const integrityHash = computeCanonicalJsonHash(canonicalPayload);

    // Create ULIP Universal Event
    const universalEvent: ULIPUniversalEvent = {
      event_id: eventId,
      timestamp: intermediate.timestamp,
      event_time: intermediate.timestamp !== 'SOURCE_TIMESTAMP_UNAVAILABLE' ? intermediate.timestamp : undefined,
      ingestion_time: rawRecord.ingested_at,
      source_vendor: intermediate.vendor,
      source_product: intermediate.product,
      source_type: intermediate.source_type,
      event_type: intermediate.event_type,
      activity: intermediate.activity,
      source_ip: intermediate.source_ip,
      source_port: intermediate.source_port,
      destination_ip: intermediate.destination_ip,
      destination_port: intermediate.destination_port,
      protocol: intermediate.protocol,
      action: intermediate.action,
      severity: intermediate.severity,
      user: intermediate.user,
      raw_event_ref: eventId,
      parser_version: intermediate.parser_version,
      parser_confidence: intermediate.confidence,
      integrity_hash: integrityHash,
      unmapped: intermediate.unmapped,
      ocsf_aligned: {
        class_uid: 4001,
        class_name: 'Network Activity',
        category_uid: 4,
        category_name: 'Network Activity',
        src_endpoint: { ip: intermediate.source_ip, port: intermediate.source_port },
        dst_endpoint: { ip: intermediate.destination_ip, port: intermediate.destination_port },
        source: { vendor: intermediate.vendor, product: intermediate.product, version: intermediate.parser_version },
        user: intermediate.user ? { name: intermediate.user } : undefined
      }
    };

    this.universalEvents.set(eventId, universalEvent);

    // Save Lineages
    const lineageList: FieldLineageRecord[] = intermediate.fields.map(f => ({
      event_id: eventId,
      raw_field: f.raw_field,
      raw_value: f.raw_value,
      ulip_field: f.ulip_field,
      ocsf_field: f.ocsf_field,
      parser_version: intermediate.parser_version,
      confidence: f.confidence
    }));
    this.lineages.set(eventId, lineageList);

    // Seal into Merkle batch if we reached 5 events or on demand
    this.checkAndSealBatch();

    // Cross-Source Correlation Evaluation
    const alert = evaluateCorrelation(universalEvent, Array.from(this.universalEvents.values()));
    if (alert) {
      const existing = this.correlationAlerts.find(a => a.correlated_ip === alert.correlated_ip);
      if (existing) {
        existing.sources = Array.from(new Set([...existing.sources, ...alert.sources]));
        existing.event_ids = Array.from(new Set([...existing.event_ids, ...alert.event_ids]));
        existing.score = Math.max(existing.score, alert.score);
        existing.factors = alert.factors;
      } else {
        this.correlationAlerts.unshift(alert);
      }
    }

    return {
      event_id: eventId,
      source_type: sourceName,
      status: 'NORMALIZED',
      raw_hash: rawHash,
      integrity_hash: integrityHash,
      parser_version: intermediate.parser_version,
      parser_confidence: intermediate.confidence,
      normalized: universalEvent
    };
  }

  public checkAndSealBatch(): void {
    const unbatched = Array.from(this.universalEvents.values()).filter(e => !e.batch_id);
    if (unbatched.length >= 5) {
      this.sealBatch(unbatched);
    }
  }

  public sealBatch(eventsToBatch: ULIPUniversalEvent[]): IntegrityBatch {
    const batchId = `batch_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const eventHashes = eventsToBatch.map(e => e.integrity_hash);
    const tree = new MerkleTree(eventHashes);
    const merkleRoot = tree.getRoot();

    const previousRoot = this.integrityBatches.length > 0
      ? this.integrityBatches[0].merkle_root
      : GENESIS_HASH;

    const chainHash = computeChainHash(previousRoot, merkleRoot, batchId);

    const batch: IntegrityBatch = {
      batch_id: batchId,
      merkle_root: merkleRoot,
      previous_batch_root: previousRoot,
      chain_hash: chainHash,
      event_count: eventsToBatch.length,
      event_hashes: eventHashes,
      created_at: new Date().toISOString()
    };

    for (const ev of eventsToBatch) {
      ev.batch_id = batchId;
    }

    this.integrityBatches.unshift(batch);
    return batch;
  }

  /**
   * Adaptive Noise Reduction & Aggregation
   * Summarizes repetitive low-value events into 1 analytical representation
   * while preserving forensic evidence (list of all original raw event IDs).
   */
  public getAggregatedEvents(): {
    total_raw_events: number;
    aggregated_representations: number;
    noise_reduction_ratio: string;
    aggregations: AdaptiveAggregationRecord[];
  } {
    const all = Array.from(this.universalEvents.values());
    const groups: Map<string, ULIPUniversalEvent[]> = new Map();

    for (const ev of all) {
      const key = `${ev.source_product}|${ev.source_ip || 'none'}|${ev.destination_ip || 'none'}|${ev.action}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(ev);
    }

    const aggregations: AdaptiveAggregationRecord[] = [];
    let aggIndex = 1;

    for (const [key, evList] of groups.entries()) {
      const rep = evList[0];
      const count = evList.length;

      aggregations.push({
        aggregation_id: `agg_${aggIndex++}_${rep.source_product.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        window: count > 1 ? '60s' : '0s',
        count,
        source: `${rep.source_vendor} ${rep.source_product}`,
        source_ip: rep.source_ip,
        destination_ip: rep.destination_ip,
        action: rep.action,
        severity: rep.severity,
        first_seen: evList[evList.length - 1].timestamp,
        last_seen: rep.timestamp,
        representative_event: rep,
        raw_event_refs: evList.map(e => e.event_id)
      });
    }

    // Sort by count descending
    aggregations.sort((a, b) => b.count - a.count);

    const totalRaw = all.length;
    const totalAgg = aggregations.length;
    const reductionPercent = totalRaw > 0 ? Math.round(((totalRaw - totalAgg) / totalRaw) * 100) : 0;

    return {
      total_raw_events: totalRaw,
      aggregated_representations: totalAgg,
      noise_reduction_ratio: `${reductionPercent}% Noise Reduction`,
      aggregations
    };
  }
}

export const store = new LogSetuStore();

