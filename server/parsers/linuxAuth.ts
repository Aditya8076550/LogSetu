import { BaseParser, ParsedIntermediate } from './base';

export class LinuxAuthParser implements BaseParser {
  name = 'linux_auth';
  version = 'linux-auth-v1.0';
  vendor = 'Linux';
  product = 'OpenSSH Server';

  // sshd[4192]: Failed password for rahul from 10.20.4.5 port 49822 ssh2
  // sshd[4192]: Accepted publickey for admin from 192.168.1.100 port 51234 ssh2
  canParse(rawText: string): boolean {
    return rawText.includes('sshd[') && (rawText.includes('Failed password') || rawText.includes('Accepted password') || rawText.includes('Accepted publickey'));
  }

  parse(rawText: string): ParsedIntermediate | null {
    const isFail = rawText.includes('Failed password');
    const userMatch = /(?:for|user)\s+([a-zA-Z0-9_\-]+)\s+from/i.exec(rawText);
    const ipMatch = /from\s+([\d\.]+)/i.exec(rawText);
    const portMatch = /port\s+(\d+)/i.exec(rawText);

    const user = userMatch ? userMatch[1] : undefined;
    const srcIp = ipMatch ? ipMatch[1] : undefined;
    const srcPort = portMatch ? parseInt(portMatch[1], 10) : 22;

    const fields = [
      { raw_field: 'status', raw_value: isFail ? 'Failed password' : 'Accepted', ulip_field: 'action', ocsf_field: 'action', confidence: 1.0 }
    ];
    if (srcIp) fields.push({ raw_field: 'from', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 });
    if (user) fields.push({ raw_field: 'user', raw_value: user, ulip_field: 'user', ocsf_field: 'user.name', confidence: 1.0 });

    return {
      event_type: isFail ? 'SSH Authentication Failure' : 'SSH Authentication Success',
      vendor: this.vendor,
      product: this.product,
      source_type: this.name,
      timestamp: new Date().toISOString(),
      action: isFail ? 'AUTH_FAIL' : 'AUTH_SUCCESS',
      severity: isFail ? 'HIGH' : 'INFORMATIONAL',
      source_ip: srcIp,
      source_port: srcPort,
      destination_ip: '172.16.2.10',
      destination_port: 22,
      protocol: 'TCP',
      user,
      activity: isFail ? 'sshd: Invalid credentials rejected' : 'sshd: Session established',
      fields,
      parser_version: this.version,
      confidence: 1.0,
      unmapped: {}
    };
  }
}
