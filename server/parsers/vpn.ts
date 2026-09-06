import { BaseParser, ParsedIntermediate } from './base';
import { standardizeAction } from '../taxonomy';

export class VPNParser implements BaseParser {
  name = 'vpn';
  version = 'vpn-gateway-v1.0';
  vendor = 'OpenVPN';
  product = 'Access Gateway';

  // openvpn[2341]: AUTH_FAILED,user=rahul,src_ip=10.20.4.18,src_port=51525,dst_ip=172.16.2.1,reason="brute_force_lockout"
  private pattern = /openvpn(?:\[\d+\])?:\s*([A-Z_]+)(?:,([^\r\n]+))?/i;

  canParse(rawText: string): boolean {
    return rawText.toLowerCase().includes('openvpn') || rawText.toLowerCase().includes('vpn_gateway');
  }

  parse(rawText: string): ParsedIntermediate | null {
    const match = this.pattern.exec(rawText);
    if (!match) return null;

    const eventCode = match[1].toUpperCase();
    const paramsStr = match[2] || '';
    const params: Record<string, string> = {};

    for (const item of paramsStr.split(',')) {
      if (item.includes('=')) {
        const [k, v] = item.split('=', 2);
        params[k.trim().toLowerCase()] = v.trim().replace(/^"|"$/g, '');
      }
    }

    const srcIp = params['src_ip'] || params['src'];
    const srcPort = params['src_port'] && /^\d+$/.test(params['src_port']) ? parseInt(params['src_port'], 10) : undefined;
    const dstIp = params['dst_ip'] || params['dst'] || '172.16.2.1';
    const user = params['user'] || params['usr'];
    const reason = params['reason'] || eventCode;

    const action = eventCode.includes('FAIL') || eventCode.includes('DENY') ? 'AUTH_FAIL' : 'AUTH_SUCCESS';
    const severity = action === 'AUTH_FAIL' ? 'HIGH' : 'INFORMATIONAL';

    const fields = [
      { raw_field: 'event', raw_value: eventCode, ulip_field: 'action', ocsf_field: 'action', confidence: 1.0 }
    ];
    if (srcIp) fields.push({ raw_field: 'src_ip', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 });
    if (user) fields.push({ raw_field: 'user', raw_value: user, ulip_field: 'user', ocsf_field: 'user.name', confidence: 1.0 });

    return {
      event_type: `VPN Session: ${eventCode}`,
      vendor: this.vendor,
      product: this.product,
      source_type: this.name,
      timestamp: new Date().toISOString(),
      action,
      severity,
      source_ip: srcIp,
      source_port: srcPort,
      destination_ip: dstIp,
      destination_port: 1194,
      protocol: 'UDP',
      user,
      activity: `VPN User Authentication: ${reason}`,
      fields,
      parser_version: this.version,
      confidence: 1.0,
      unmapped: { reason: params['reason'] }
    };
  }
}
