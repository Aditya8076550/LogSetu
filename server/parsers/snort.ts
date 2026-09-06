import { BaseParser, ParsedIntermediate } from './base';
import { standardizeAction, standardizeSeverity } from '../taxonomy';

export class SnortParser implements BaseParser {
  name = 'snort';
  version = 'snort-v1.0';
  vendor = 'Cisco';
  product = 'Snort NIDS';

  // [**] [1:2100498:7] GPL ATTACK_RESPONSE id check returned root [**] [Classification: Potentially Bad Traffic] [Priority: 1] {TCP} 10.20.4.18:51521 -> 172.16.2.10:443
  private pattern = /\[\*\*\]\s+\[\d+:(\d+):\d+\]\s+(.*?)\s+\[\*\*\]\s*(?:\[Classification:\s*(.*?)\])?\s*(?:\[Priority:\s*(\d+)\])?\s*\{(\w+)\}\s*([\d\.]+):(\d+)\s*->\s*([\d\.]+):(\d+)/i;

  canParse(rawText: string): boolean {
    return rawText.includes('[**]') && (rawText.includes('Priority:') || rawText.includes('Classification:') || rawText.includes('->'));
  }

  parse(rawText: string): ParsedIntermediate | null {
    const match = this.pattern.exec(rawText);
    if (!match) return null;

    const [, sid, msg, classification, priority, proto, srcIp, srcPort, dstIp, dstPort] = match;
    const pri = priority ? parseInt(priority, 10) : 2;
    const severity = pri === 1 ? 'HIGH' : (pri === 2 ? 'MEDIUM' : 'LOW');

    return {
      event_type: `Snort Alert: ${msg.trim()}`,
      vendor: this.vendor,
      product: this.product,
      source_type: this.name,
      timestamp: new Date().toISOString(),
      action: 'ALERT',
      severity,
      source_ip: srcIp,
      source_port: parseInt(srcPort, 10),
      destination_ip: dstIp,
      destination_port: parseInt(dstPort, 10),
      protocol: proto.toUpperCase(),
      activity: msg.trim(),
      fields: [
        { raw_field: 'src_ip', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 },
        { raw_field: 'src_port', raw_value: srcPort, ulip_field: 'source_port', ocsf_field: 'src_endpoint.port', confidence: 1.0 },
        { raw_field: 'dst_ip', raw_value: dstIp, ulip_field: 'destination_ip', ocsf_field: 'dst_endpoint.ip', confidence: 1.0 },
        { raw_field: 'dst_port', raw_value: dstPort, ulip_field: 'destination_port', ocsf_field: 'dst_endpoint.port', confidence: 1.0 },
        { raw_field: 'msg', raw_value: msg.trim(), ulip_field: 'activity', ocsf_field: 'activity', confidence: 1.0 }
      ],
      parser_version: this.version,
      confidence: 1.0,
      unmapped: { sid, classification }
    };
  }
}
