export const ACTION_SYNONYMS: Record<string, 'ALLOW' | 'DENY' | 'DROP' | 'ALERT' | 'AUTH_SUCCESS' | 'AUTH_FAIL'> = {
  permit: 'ALLOW',
  permitted: 'ALLOW',
  pass: 'ALLOW',
  accept: 'ALLOW',
  allowed: 'ALLOW',
  built: 'ALLOW',
  allow: 'ALLOW',
  success: 'ALLOW',
  login_success: 'AUTH_SUCCESS',
  auth_ok: 'AUTH_SUCCESS',
  login_ok: 'AUTH_SUCCESS',
  connection_success: 'AUTH_SUCCESS',
  auth_success: 'AUTH_SUCCESS',
  
  deny: 'DENY',
  denied: 'DENY',
  block: 'DENY',
  blocked: 'DENY',
  drop: 'DROP',
  dropped: 'DROP',
  reject: 'DENY',
  rejected: 'DENY',
  close: 'DENY',
  teardown: 'ALLOW',

  auth_failed: 'AUTH_FAIL',
  auth_fail: 'AUTH_FAIL',
  failed: 'AUTH_FAIL',
  login_fail: 'AUTH_FAIL',
  login_failed: 'AUTH_FAIL',
  auth_denied: 'AUTH_FAIL',
  brute_force_lockout: 'AUTH_FAIL',

  alert: 'ALERT',
  warning: 'ALERT',
  detected: 'ALERT'
};

export const SEVERITY_SYNONYMS: Record<string, 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
  '0': 'INFORMATIONAL',
  '1': 'CRITICAL',
  '2': 'HIGH',
  '3': 'MEDIUM',
  '4': 'LOW',
  '5': 'INFORMATIONAL',
  '6': 'INFORMATIONAL',
  '7': 'INFORMATIONAL',
  debug: 'INFORMATIONAL',
  info: 'INFORMATIONAL',
  information: 'INFORMATIONAL',
  informational: 'INFORMATIONAL',
  notice: 'LOW',
  low: 'LOW',
  warn: 'MEDIUM',
  warning: 'MEDIUM',
  medium: 'MEDIUM',
  err: 'HIGH',
  error: 'HIGH',
  high: 'HIGH',
  crit: 'CRITICAL',
  critical: 'CRITICAL',
  emerg: 'CRITICAL',
  emergency: 'CRITICAL',
  alert: 'CRITICAL'
};

export function standardizeAction(rawAction: string): 'ALLOW' | 'DENY' | 'DROP' | 'ALERT' | 'AUTH_SUCCESS' | 'AUTH_FAIL' | 'OTHER' {
  if (!rawAction) return 'ALLOW';
  const cleaned = rawAction.trim().toLowerCase();
  return ACTION_SYNONYMS[cleaned] || 'OTHER';
}

export function standardizeSeverity(rawSeverity: string | number): 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (rawSeverity === undefined || rawSeverity === null) return 'INFORMATIONAL';
  const cleaned = String(rawSeverity).trim().toLowerCase();
  return SEVERITY_SYNONYMS[cleaned] || 'INFORMATIONAL';
}
