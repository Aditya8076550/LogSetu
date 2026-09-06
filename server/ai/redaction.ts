/**
 * Privacy-First Local Preprocessing & Redaction
 * Scrubs sensitive tokens, passwords, and private identifiers
 * before sending logs to an external AI provider.
 */

export interface RedactionResult {
  redactedText: string;
  redactedCount: number;
  redactedTypes: string[];
}

export function redactSensitiveData(rawText: string): RedactionResult {
  let text = rawText;
  let redactedCount = 0;
  const typesSet = new Set<string>();

  // 1. Password / Secret / API token patterns
  const secretPattern = /(password|passwd|secret|api_key|token|auth_token)=["']?([^"'\s,;]+)["']?/gi;
  text = text.replace(secretPattern, (match, key) => {
    redactedCount++;
    typesSet.add('CREDENTIAL');
    return `${key}="***REDACTED_SECRET***"`;
  });

  // 2. Private Keys
  if (text.includes('BEGIN PRIVATE KEY') || text.includes('BEGIN RSA PRIVATE KEY')) {
    text = text.replace(/-----BEGIN[^-]+KEY-----[^-]+-----END[^-]+KEY-----/gs, '***REDACTED_CERT_KEY***');
    redactedCount++;
    typesSet.add('CERTIFICATE_KEY');
  }

  // 3. Authorization Bearer / Basic tokens
  const authHeaderPattern = /(Bearer|Basic)\s+([a-zA-Z0-9_\-\.]{15,})/g;
  text = text.replace(authHeaderPattern, (match, prefix) => {
    redactedCount++;
    typesSet.add('AUTH_TOKEN');
    return `${prefix} ***REDACTED_TOKEN***`;
  });

  return {
    redactedText: text,
    redactedCount,
    redactedTypes: Array.from(typesSet)
  };
}
