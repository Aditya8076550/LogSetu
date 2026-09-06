import { ULIPUniversalEvent, CorrelationAlert, CorrelationFactor } from '../types';

export function evaluateCorrelation(
  newEvent: ULIPUniversalEvent,
  recentEvents: ULIPUniversalEvent[],
  windowMinutes: number = 15
): CorrelationAlert | null {
  if (!newEvent.source_ip && !newEvent.user) return null;

  const newTime = new Date(newEvent.timestamp).getTime();
  const windowMs = windowMinutes * 60 * 1000;

  // Filter events within sliding window matching IP or User
  const matchedEvents = recentEvents.filter(e => {
    const eTime = new Date(e.timestamp).getTime();
    const timeDiff = Math.abs(newTime - eTime);
    if (timeDiff > windowMs) return false;

    const ipMatch = newEvent.source_ip && e.source_ip && newEvent.source_ip === e.source_ip;
    const userMatch = newEvent.user && e.user && newEvent.user.toLowerCase() === e.user.toLowerCase();
    return ipMatch || userMatch;
  });

  // Check distinct security appliance sources
  const distinctSources = new Set<string>();
  const distinctDevices = new Set<string>();
  for (const e of matchedEvents) {
    distinctSources.add(e.source_vendor || e.source_product);
    distinctDevices.add(e.source_product);
  }

  if (distinctDevices.size < 2) {
    return null; // Must span at least two distinct security layers
  }

  // Calculate Explainable Additive Correlation Score
  const factors: CorrelationFactor[] = [];
  let score = 0;

  // Factor 1: Same Source IP
  if (newEvent.source_ip) {
    const countIp = matchedEvents.filter(e => e.source_ip === newEvent.source_ip).length;
    if (countIp >= 2) {
      factors.push({
        factor: 'Common Attacking Source IP',
        weight: 25,
        detail: `Observed across ${countIp} events originating from address ${newEvent.source_ip}`
      });
      score += 25;
    }
  }

  // Factor 2: Same Target User Identity
  if (newEvent.user) {
    const countUser = matchedEvents.filter(e => e.user && e.user.toLowerCase() === newEvent.user!.toLowerCase()).length;
    if (countUser >= 2) {
      factors.push({
        factor: 'Correlated User Account Target',
        weight: 20,
        detail: `Subject identity "${newEvent.user}" targeted across multiple access control points`
      });
      score += 20;
    }
  }

  // Factor 3: Time Proximity
  factors.push({
    factor: 'Rapid Temporal Proximity',
    weight: 15,
    detail: `All ${matchedEvents.length} events occurred within a ${windowMinutes}-minute window`
  });
  score += 15;

  // Factor 4: Multiple Security Layers
  factors.push({
    factor: 'Cross-Perimeter Heterogeneous Devices',
    weight: 15,
    detail: `Correlated across ${distinctDevices.size} disparate technologies: ${Array.from(distinctDevices).join(', ')}`
  });
  score += 15;

  // Factor 5: High Severity Actions
  const hasHighSev = matchedEvents.some(e => e.severity === 'HIGH' || e.severity === 'CRITICAL');
  if (hasHighSev) {
    factors.push({
      factor: 'Security Enforcement / Threat Severity',
      weight: 12,
      detail: 'Includes active firewall blocking or authentication lockout failures'
    });
    score += 12;
  }

  // Factor 6: Repeated Adverse Action
  const failCount = matchedEvents.filter(e => e.action === 'DENY' || e.action === 'DROP' || e.action === 'AUTH_FAIL' || e.action === 'ALERT').length;
  if (failCount >= 3) {
    factors.push({
      factor: 'Repeated Adverse Policy Trigger',
      weight: 13,
      detail: `${failCount} security blocks/failures detected across sequence`
    });
    score += 13;
  }

  // Determine Title & Description
  const subject = newEvent.source_ip || newEvent.user || 'Unknown Subject';
  const alertId = `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  const title = `Possible Coordinated Attack Involving ${subject}`;
  const description = `Subject "${subject}" was observed across ${distinctDevices.size} distinct perimeter security layers (${Array.from(distinctDevices).join(', ')}) within ${windowMinutes} minutes. Correlation score: ${score}/100.`;

  return {
    alert_id: alertId,
    title,
    description,
    correlated_ip: newEvent.source_ip,
    correlated_user: newEvent.user,
    sources: Array.from(distinctDevices),
    event_ids: matchedEvents.map(e => e.event_id),
    score: Math.min(100, score),
    factors,
    severity: score >= 80 ? 'CRITICAL' : 'HIGH',
    created_at: new Date().toISOString(),
    status: 'OPEN'
  };
}
