import { BaseParser, ParsedIntermediate } from './base';
import { standardizeAction, standardizeSeverity } from '../taxonomy';

export class SuricataParser implements BaseParser {
  name = 'suricata';
  version = 'suricata-eve-v1.0';
  vendor = 'OISF';
  product = 'Suricata IDS/IPS';

  canParse(rawText: string): boolean {
    const trimmed = rawText.trim();
    return trimmed.startsWith('{') && trimmed.endsWith('}') && (trimmed.includes('"event_type"') || trimmed.includes('"alert"'));
  }

  parse(rawText: string): ParsedIntermediate | null {
    try {
      const data = JSON.parse(rawText.trim());
      const eventType = data.event_type || 'alert';
      const alert = data.alert || {};
      const srcIp = data.src_ip;
      const srcPort = data.src_port;
      const dstIp = data.dest_ip;
      const dstPort = data.dest_port;
      const proto = (data.proto || 'TCP').toUpperCase();
      const actionRaw = alert.action || 'alert';
      const signature = alert.signature || 'Suspicious Activity Detected';
      const sevNum = alert.severity || 2;

      let timestamp = new Date().toISOString();
      if (data.timestamp) {
        try {
          timestamp = new Date(data.timestamp).toISOString();
        } catch {}
      }

      const fields = [
        { raw_field: 'src_ip', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 },
        { raw_field: 'dest_ip', raw_value: dstIp, ulip_field: 'destination_ip', ocsf_field: 'dst_endpoint.ip', confidence: 1.0 },
        { raw_field: 'alert.action', raw_value: actionRaw, ulip_field: 'action', ocsf_field: 'action', confidence: 1.0 }
      ];
      if (srcPort) fields.push({ raw_field: 'src_port', raw_value: String(srcPort), ulip_field: 'source_port', ocsf_field: 'src_endpoint.port', confidence: 1.0 });
      if (dstPort) fields.push({ raw_field: 'dest_port', raw_value: String(dstPort), ulip_field: 'destination_port', ocsf_field: 'dst_endpoint.port', confidence: 1.0 });

      return {
        event_type: `IDS Alert: ${signature}`,
        vendor: this.vendor,
        product: this.product,
        source_type: this.name,
        timestamp,
        action: actionRaw.toLowerCase() === 'drop' ? 'DROP' : 'ALERT',
        severity: sevNum === 1 ? 'HIGH' : (sevNum === 2 ? 'MEDIUM' : 'LOW'),
        source_ip: srcIp,
        source_port: srcPort,
        destination_ip: dstIp,
        destination_port: dstPort,
        protocol: proto,
        activity: signature,
        fields,
        parser_version: this.version,
        confidence: 1.0,
        unmapped: { signature_id: alert.signature_id, category: alert.category, gid: alert.gid }
      };
    } catch {
      return null;
    }
  }
}
