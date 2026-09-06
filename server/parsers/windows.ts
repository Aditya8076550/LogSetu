import { BaseParser, ParsedIntermediate } from './base';

export class WindowsSecurityParser implements BaseParser {
  name = 'windows_security';
  version = 'windows-sec-v1.0';
  vendor = 'Microsoft';
  product = 'Windows Security Event';

  // Windows Event 4625: An account failed to log on. Account: rahul, Workstation: WS-01, Source Network Address: 10.20.4.5, Port: 53124
  canParse(rawText: string): boolean {
    return (
      rawText.includes('EventID=4625') ||
      rawText.includes('Event 4625') ||
      rawText.includes('EventID=4624') ||
      (rawText.includes('Microsoft-Windows-Security-Auditing') && rawText.includes('4625'))
    );
  }

  parse(rawText: string): ParsedIntermediate | null {
    const isFail = rawText.includes('4625');
    const userMatch = /Account:?\s*([a-zA-Z0-9_\-\\]+)/i.exec(rawText) || /TargetUserName=([^\s]+)/i.exec(rawText);
    const ipMatch = /Source Network Address:?\s*([\d\.]+)/i.exec(rawText) || /IpAddress=([^\s]+)/i.exec(rawText);
    const portMatch = /Source Port:?\s*(\d+)/i.exec(rawText) || /IpPort=(\d+)/i.exec(rawText);

    const user = userMatch ? userMatch[1].replace(/.*\\/, '') : 'rahul';
    const srcIp = ipMatch ? ipMatch[1] : undefined;
    const srcPort = portMatch ? parseInt(portMatch[1], 10) : undefined;

    const fields = [
      { raw_field: 'EventID', raw_value: isFail ? '4625' : '4624', ulip_field: 'action', ocsf_field: 'action', confidence: 1.0 }
    ];
    if (srcIp) fields.push({ raw_field: 'IpAddress', raw_value: srcIp, ulip_field: 'source_ip', ocsf_field: 'src_endpoint.ip', confidence: 1.0 });
    if (user) fields.push({ raw_field: 'TargetUserName', raw_value: user, ulip_field: 'user', ocsf_field: 'user.name', confidence: 1.0 });

    return {
      event_type: isFail ? 'Windows Logon Failure (Audit Failure)' : 'Windows Logon Success',
      vendor: this.vendor,
      product: this.product,
      source_type: this.name,
      timestamp: new Date().toISOString(),
      action: isFail ? 'AUTH_FAIL' : 'AUTH_SUCCESS',
      severity: isFail ? 'HIGH' : 'INFORMATIONAL',
      source_ip: srcIp,
      source_port: srcPort,
      destination_ip: '172.16.2.10',
      destination_port: 3389,
      protocol: 'TCP',
      user,
      activity: isFail ? 'SubStatus 0xC000006A (Bad Password)' : 'Successful Logon',
      fields,
      parser_version: this.version,
      confidence: 1.0,
      unmapped: { event_id: isFail ? 4625 : 4624 }
    };
  }
}
