import { BaseParser, ParsedIntermediate } from './base';
import { standardizeAction } from '../taxonomy';

export class PfSenseParser implements BaseParser {
  name = 'pfsense';
  version = 'pfsense-filterlog-v1.0';
  vendor = 'Netgate';
  product = 'pfSense Firewall';

  canParse(rawText: string): boolean {
    return rawText.includes('filterlog[') || rawText.includes('filterlog:');
  }

  parse(rawText: string): ParsedIntermediate | null {
    try {
      const colonIdx = rawText.indexOf(':');
      const csvPart = colonIdx !== -1 ? rawText.substring(colonIdx + 1).trim() : rawText.trim();
      const parts = csvPart.split(',').map(p => p.trim());

      if (parts.length < 16) return null;

      const actionRaw = parts[6]?.toLowerCase() || 'pass';
      const action = actionRaw === 'block' || actionRaw === 'drop' ? 'DENY' : 'ALLOW';
      const proto = parts[16]?.toUpperCase() || 'TCP';
      const srcIp = parts[18];
      const dstIp = parts[19];
      const srcPort = parts[20] && /^\d+$/.test(parts[20]) ? parseInt(parts[20], 10) : undefined;
      const dstPort = parts[21] && /^\d+$/.test(parts[21]) ? parseInt(parts[21], 10) : undefined;

      const fields = [
        { raw_field: 'action', raw_value: actionRaw, ulip_field: 'action', ocsf_field: 'action', confidence: 1.0 }
      ];
      if (srcIp) fields.push({ raw_field: 'src_ip', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 });
      if (dstIp) fields.push({ raw_field: 'dst_ip', raw_value: dstIp, ulip_field: 'destination_ip', ocsf_field: 'dst_endpoint.ip', confidence: 1.0 });
      if (srcPort) fields.push({ raw_field: 'src_port', raw_value: String(srcPort), ulip_field: 'source_port', ocsf_field: 'src_endpoint.port', confidence: 1.0 });
      if (dstPort) fields.push({ raw_field: 'dst_port', raw_value: String(dstPort), ulip_field: 'destination_port', ocsf_field: 'dst_endpoint.port', confidence: 1.0 });

      return {
        event_type: 'Filterlog Rule Match',
        vendor: this.vendor,
        product: this.product,
        source_type: this.name,
        timestamp: new Date().toISOString(),
        action: standardizeAction(action),
        severity: action === 'DENY' ? 'HIGH' : 'INFORMATIONAL',
        source_ip: srcIp,
        source_port: srcPort,
        destination_ip: dstIp,
        destination_port: dstPort,
        protocol: proto,
        activity: `Packet ${actionRaw.toUpperCase()} on interface ${parts[4] || 'wan'}`,
        fields,
        parser_version: this.version,
        confidence: 1.0,
        unmapped: { rule_id: parts[0], tracker: parts[3], interface: parts[4] }
      };
    } catch {
      return null;
    }
  }
}
