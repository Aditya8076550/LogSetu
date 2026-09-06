import { BaseParser, ParsedIntermediate } from './base';
import { standardizeAction, standardizeSeverity } from '../taxonomy';

export class FortiGateParser implements BaseParser {
  name = 'fortigate';
  version = 'fortigate-v1.0';
  vendor = 'Fortinet';
  product = 'FortiGate';

  canParse(rawText: string): boolean {
    return (
      rawText.includes('type=traffic') ||
      rawText.includes('type="traffic"') ||
      rawText.includes('devname="FGT') ||
      rawText.includes('devname=FGT') ||
      (rawText.includes('srcip=') && rawText.includes('dstip=') && rawText.includes('proto='))
    );
  }

  parse(rawText: string): ParsedIntermediate | null {
    const kvRegex = /(\w+)=(?:"([^"]*)"|([^\s]+))/g;
    const kv: Record<string, string> = {};
    let match: RegExpExecArray | null;

    while ((match = kvRegex.exec(rawText)) !== null) {
      const k = match[1].toLowerCase();
      const v = match[2] !== undefined ? match[2] : match[3];
      kv[k] = v;
    }

    if (Object.keys(kv).length === 0) return null;

    const srcIp = kv['srcip'];
    const srcPort = kv['srcport'] ? parseInt(kv['srcport'], 10) : undefined;
    const dstIp = kv['dstip'];
    const dstPort = kv['dstport'] ? parseInt(kv['dstport'], 10) : undefined;
    const actionRaw = kv['action'] || 'allow';
    const protoRaw = kv['proto'] || '6';
    const protoMap: Record<string, string> = { '6': 'TCP', '17': 'UDP', '1': 'ICMP' };
    const protocol = protoMap[protoRaw] || kv['service']?.toUpperCase() || 'TCP';
    const user = kv['user'];
    const level = kv['level'] || 'information';

    let timestamp = new Date().toISOString();
    if (kv['date'] && kv['time']) {
      try {
        timestamp = new Date(`${kv['date']}T${kv['time']}Z`).toISOString();
      } catch {}
    }

    const fields = [];
    if (srcIp) {
      fields.push({
        raw_field: 'srcip',
        raw_value: srcIp,
        ulip_field: 'source_ip',
        ocsf_field: 'src_endpoint.ip',
        confidence: 1.0
      });
    }
    if (srcPort) {
      fields.push({
        raw_field: 'srcport',
        raw_value: String(srcPort),
        ulip_field: 'source_port',
        ocsf_field: 'src_endpoint.port',
        confidence: 1.0
      });
    }
    if (dstIp) {
      fields.push({
        raw_field: 'dstip',
        raw_value: dstIp,
        ulip_field: 'destination_ip',
        ocsf_field: 'dst_endpoint.ip',
        confidence: 1.0
      });
    }
    if (dstPort) {
      fields.push({
        raw_field: 'dstport',
        raw_value: String(dstPort),
        ulip_field: 'destination_port',
        ocsf_field: 'dst_endpoint.port',
        confidence: 1.0
      });
    }
    if (user) {
      fields.push({
        raw_field: 'user',
        raw_value: user,
        ulip_field: 'user',
        ocsf_field: 'user.name',
        confidence: 1.0
      });
    }
    fields.push({
      raw_field: 'action',
      raw_value: actionRaw,
      ulip_field: 'action',
      ocsf_field: 'action',
      confidence: 1.0
    });

    const unmapped: Record<string, any> = {};
    for (const [k, v] of Object.entries(kv)) {
      if (!['srcip', 'srcport', 'dstip', 'dstport', 'action', 'user', 'proto', 'date', 'time'].includes(k)) {
        unmapped[k] = v;
      }
    }

    return {
      event_type: 'Network Traffic Session',
      vendor: this.vendor,
      product: this.product,
      source_type: this.name,
      timestamp,
      action: standardizeAction(actionRaw),
      severity: standardizeSeverity(level),
      source_ip: srcIp,
      source_port: srcPort,
      destination_ip: dstIp,
      destination_port: dstPort,
      protocol,
      user,
      activity: `Traffic ${actionRaw.toUpperCase()} on policy ${kv['policyid'] || 'default'}`,
      fields,
      parser_version: this.version,
      confidence: 1.0,
      unmapped
    };
  }
}
