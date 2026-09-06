import { BaseParser, ParsedIntermediate } from './base';
import { standardizeAction } from '../taxonomy';

export class RouterParser implements BaseParser {
  name = 'router_syslog';
  version = 'cisco-ios-router-v1.0';
  vendor = 'Cisco';
  product = 'IOS Router';

  // %SEC-6-IPACCESSLOGP: list 101 denied tcp 10.20.4.18(51526) -> 172.16.2.10(3389), 1 packet
  private pattern = /%SEC-\d-IPACCESSLOGP:\s+list\s+\w+\s+(denied|permitted)\s+(\w+)\s+([\d\.]+)\((\d+)\)\s*->\s*([\d\.]+)\((\d+)\)/i;

  canParse(rawText: string): boolean {
    return rawText.includes('%SEC-') && rawText.includes('IPACCESSLOGP');
  }

  parse(rawText: string): ParsedIntermediate | null {
    const match = this.pattern.exec(rawText);
    if (!match) return null;

    const [, actionStr, proto, srcIp, srcPort, dstIp, dstPort] = match;
    const action = actionStr.toLowerCase() === 'denied' ? 'DENY' : 'ALLOW';

    return {
      event_type: 'Router ACL Filter',
      vendor: this.vendor,
      product: this.product,
      source_type: this.name,
      timestamp: new Date().toISOString(),
      action,
      severity: action === 'DENY' ? 'HIGH' : 'INFORMATIONAL',
      source_ip: srcIp,
      source_port: parseInt(srcPort, 10),
      destination_ip: dstIp,
      destination_port: parseInt(dstPort, 10),
      protocol: proto.toUpperCase(),
      activity: `ACL Packet Filter ${actionStr}`,
      fields: [
        { raw_field: 'src_ip', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 },
        { raw_field: 'src_port', raw_value: srcPort, ulip_field: 'source_port', ocsf_field: 'src_endpoint.port', confidence: 1.0 },
        { raw_field: 'dst_ip', raw_value: dstIp, ulip_field: 'destination_ip', ocsf_field: 'dst_endpoint.ip', confidence: 1.0 },
        { raw_field: 'dst_port', raw_value: dstPort, ulip_field: 'destination_port', ocsf_field: 'dst_endpoint.port', confidence: 1.0 },
        { raw_field: 'action', raw_value: actionStr, ulip_field: 'action', ocsf_field: 'action', confidence: 1.0 }
      ],
      parser_version: this.version,
      confidence: 1.0,
      unmapped: {}
    };
  }
}
