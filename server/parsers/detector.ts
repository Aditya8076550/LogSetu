import { BaseParser } from './base';
import { FortiGateParser } from './fortigate';
import { CiscoAsaParser } from './ciscoAsa';
import { PfSenseParser } from './pfsense';
import { SuricataParser } from './suricata';
import { SnortParser } from './snort';
import { VPNParser } from './vpn';
import { RouterParser } from './router';
import { WindowsSecurityParser } from './windows';
import { LinuxAuthParser } from './linuxAuth';
import { DynamicConfiguredParser } from './dynamicParser';

export const BUILTIN_DETERMINISTIC_PARSERS: BaseParser[] = [
  new FortiGateParser(),
  new CiscoAsaParser(),
  new PfSenseParser(),
  new SuricataParser(),
  new SnortParser(),
  new VPNParser(),
  new RouterParser(),
  new WindowsSecurityParser(),
  new LinuxAuthParser()
];

export function detectSourceAndParser(
  rawText: string,
  dynamicParsers: DynamicConfiguredParser[] = []
): { sourceName: string; parser: BaseParser | null; confidence: number } {
  // 1. Check approved dynamic parsers with strict fingerprinting
  for (const dynParser of dynamicParsers) {
    if (dynParser.canParse(rawText)) {
      return { sourceName: dynParser.name, parser: dynParser, confidence: 0.98 };
    }
  }

  // 2. Check built-in deterministic parsers
  for (const parser of BUILTIN_DETERMINISTIC_PARSERS) {
    if (parser.canParse(rawText)) {
      return { sourceName: parser.name, parser, confidence: 1.0 };
    }
  }

  // 3. Unknown format detected
  return { sourceName: 'unknown_source', parser: null, confidence: 0.4 };
}
