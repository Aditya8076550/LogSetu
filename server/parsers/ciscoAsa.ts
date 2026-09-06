import { BaseParser, ParsedIntermediate } from './base';
import { standardizeAction, standardizeSeverity } from '../taxonomy';

export class CiscoAsaParser implements BaseParser {
  name = 'cisco_asa';
  version = 'cisco-asa-v1.0';
  vendor = 'Cisco';
  product = 'ASA Firewall';

  // %ASA-4-106023: Deny tcp src outside:10.20.4.18/51523 dst inside:172.16.2.10/22 by access-group "OUTSIDE-IN"
  // %ASA-6-302013: Built outbound TCP connection 208394 for outside:198.51.100.22/443 (198.51.100.22/443) to inside:10.0.1.5/49152 (10.0.1.5/49152)
  private denyPattern = /%ASA-(\d)-106023:\s+(Deny|Permit)\s+(\w+)\s+src\s+[\w\-]+:([\d\.]+)\/(\d+)\s+dst\s+[\w\-]+:([\d\.]+)\/(\d+)/i;
  private connPattern = /%ASA-(\d)-302013:\s+Built\s+\w+\s+(\w+)\s+connection\s+\d+\s+for\s+[\w\-]+:([\d\.]+)\/(\d+)(?:\s+\([^)]+\))?\s+to\s+[\w\-]+:([\d\.]+)\/(\d+)/i;

  canParse(rawText: string): boolean {
    return rawText.includes('%ASA-');
  }

  parse(rawText: string): ParsedIntermediate | null {
    const denyMatch = this.denyPattern.exec(rawText);
    if (denyMatch) {
      const [, sevNum, actionStr, proto, srcIp, srcPort, dstIp, dstPort] = denyMatch;
      const action = actionStr.toUpperCase() === 'DENY' ? 'DENY' : 'ALLOW';
      const severity = standardizeSeverity(sevNum);

      return {
        event_type: 'Firewall Access Control',
        vendor: this.vendor,
        product: this.product,
        source_type: this.name,
        timestamp: new Date().toISOString(),
        action: standardizeAction(action),
        severity,
        source_ip: srcIp,
        source_port: parseInt(srcPort, 10),
        destination_ip: dstIp,
        destination_port: parseInt(dstPort, 10),
        protocol: proto.toUpperCase(),
        activity: `ASA ACL ${actionStr} (${proto.toUpperCase()})`,
        fields: [
          { raw_field: 'src', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 },
          { raw_field: 'src_port', raw_value: srcPort, ulip_field: 'source_port', ocsf_field: 'src_endpoint.port', confidence: 1.0 },
          { raw_field: 'dst', raw_value: dstIp, ulip_field: 'destination_ip', ocsf_field: 'dst_endpoint.ip', confidence: 1.0 },
          { raw_field: 'dst_port', raw_value: dstPort, ulip_field: 'destination_port', ocsf_field: 'dst_endpoint.port', confidence: 1.0 },
          { raw_field: 'proto', raw_value: proto, ulip_field: 'protocol', ocsf_field: 'protocol', confidence: 1.0 },
          { raw_field: 'action', raw_value: actionStr, ulip_field: 'action', ocsf_field: 'action', confidence: 1.0 }
        ],
        parser_version: this.version,
        confidence: 1.0,
        unmapped: { message_code: '106023' }
      };
    }

    const connMatch = this.connPattern.exec(rawText);
    if (connMatch) {
      const [, sevNum, proto, dstIp, dstPort, srcIp, srcPort] = connMatch;
      return {
        event_type: 'Network Connection Built',
        vendor: this.vendor,
        product: this.product,
        source_type: this.name,
        timestamp: new Date().toISOString(),
        action: 'ALLOW',
        severity: 'INFORMATIONAL',
        source_ip: srcIp,
        source_port: parseInt(srcPort, 10),
        destination_ip: dstIp,
        destination_port: parseInt(dstPort, 10),
        protocol: proto.toUpperCase(),
        activity: 'Outbound TCP Connection Established',
        fields: [
          { raw_field: 'src', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 },
          { raw_field: 'src_port', raw_value: srcPort, ulip_field: 'source_port', ocsf_field: 'src_endpoint.port', confidence: 1.0 },
          { raw_field: 'dst', raw_value: dstIp, ulip_field: 'destination_ip', ocsf_field: 'dst_endpoint.ip', confidence: 1.0 },
          { raw_field: 'dst_port', raw_value: dstPort, ulip_field: 'destination_port', ocsf_field: 'dst_endpoint.port', confidence: 1.0 },
          { raw_field: 'proto', raw_value: proto, ulip_field: 'protocol', ocsf_field: 'protocol', confidence: 1.0 },
          { raw_field: 'action', raw_value: 'Built', ulip_field: 'action', ocsf_field: 'action', confidence: 1.0 }
        ],
        parser_version: this.version,
        confidence: 1.0,
        unmapped: { message_code: '302013' }
      };
    }

    return null;
  }
}
