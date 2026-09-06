import { DiscoveredField, ReplayValidationResult, ParserSpecification } from '../types';
import { DynamicConfiguredParser } from '../parsers/dynamicParser';

export function validateMappingSchema(mappings: DiscoveredField[]): {
  isValid: boolean;
  requiredCoverage: number;
  errors: string[];
  typeConflicts: string[];
} {
  const targets = new Set(mappings.map(m => m.ocsf_target));
  const errors: string[] = [];
  const typeConflicts: string[] = [];

  // 1. Essential field presence check
  const hasOrigin = targets.has('src_endpoint.ip') || targets.has('src_endpoint') || targets.has('user.name') || targets.has('user') || targets.has('dst_endpoint.ip');
  if (!hasOrigin) {
    errors.push('Missing origin/subject identifier (src_endpoint.ip or user.name)');
  }
  if (!targets.has('action') && !targets.has('activity')) {
    errors.push('Missing security disposition (action or activity)');
  }

  // 2. Type validation
  for (const m of mappings) {
    if (m.ocsf_target.includes('ip') && m.data_type !== 'ip' && m.data_type !== 'string') {
      typeConflicts.push(`Field '${m.raw_field}' maps to IP target but has data type '${m.data_type}'`);
    }
    if (m.ocsf_target.includes('port') && m.data_type !== 'integer' && m.data_type !== 'port') {
      typeConflicts.push(`Field '${m.raw_field}' maps to port target but has data type '${m.data_type}'`);
    }
  }

  // 3. Core field coverage evaluation
  const coreRequired = ['src_endpoint.ip', 'dst_endpoint.ip', 'action', 'severity', 'user.name'];
  let mappedCoreCount = 0;
  for (const c of coreRequired) {
    if (targets.has(c) || (c === 'user.name' && targets.has('user'))) {
      mappedCoreCount++;
    }
  }

  const requiredCoverage = Math.round((mappedCoreCount / coreRequired.length) * 100) / 100;
  const isValid = errors.length === 0 && typeConflicts.length === 0;

  return { isValid, requiredCoverage, errors, typeConflicts };
}

export function runReplayValidation(
  spec: ParserSpecification,
  testSamples: string[]
): ReplayValidationResult {
  const parser = new DynamicConfiguredParser(spec);
  const cleanSamples = testSamples.map(s => s.trim()).filter(s => s.length > 0);

  let successCount = 0;
  let malformedCount = 0;
  const samplePreviews: Array<{ raw: string; parsed: any; valid: boolean }> = [];
  const schemaConflicts: string[] = [];
  const unknownFieldsSet = new Set<string>();

  for (const sample of cleanSamples) {
    try {
      const canParseSample = parser.canParse(sample);
      const parsed = parser.parse(sample);

      // Validate parser fingerprint, structure, required mappings, and normalized event structure
      const hasAction = Boolean(parsed && parsed.action);
      const hasOrigin = Boolean(parsed && (parsed.source_ip || parsed.user || parsed.destination_ip));
      const hasFields = Boolean(parsed && parsed.fields && parsed.fields.length >= 1);

      if (canParseSample && parsed && (hasAction || hasOrigin) && hasFields) {
        successCount++;
        // Track unmapped extra tokens
        if (parsed.unmapped) {
          Object.keys(parsed.unmapped).forEach(k => {
            if (!k.startsWith('POS_') && k !== 'ACTION' && k !== 'SEV' && k !== 'TIMESTAMP') {
              unknownFieldsSet.add(k);
            }
          });
        }
        samplePreviews.push({
          raw: sample,
          parsed,
          valid: true
        });
      } else {
        malformedCount++;
        samplePreviews.push({
          raw: sample,
          parsed: parsed || {},
          valid: false
        });
      }
    } catch (err: any) {
      malformedCount++;
      schemaConflicts.push(`Failed to parse sample: ${sample.slice(0, 40)}... (${err.message})`);
    }
  }

  const total = cleanSamples.length;
  const parseSuccessRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
  const schemaCheck = validateMappingSchema(spec.mappings || []);

  // Strict Activation Gate
  const isPass = parseSuccessRate >= 80 && schemaCheck.isValid && schemaConflicts.length === 0;
  const isReady = isPass && schemaCheck.requiredCoverage >= 0.6;

  return {
    samples_tested: total,
    successfully_parsed: successCount,
    parse_success_rate: parseSuccessRate,
    required_fields_coverage: schemaCheck.requiredCoverage,
    mapped_fields_count: (spec.mappings || []).length,
    unmapped_fields_count: unknownFieldsSet.size,
    unknown_fields: Array.from(unknownFieldsSet).slice(0, 5),
    malformed_events: malformedCount,
    type_conflicts: schemaCheck.typeConflicts,
    schema_conflicts: [...schemaCheck.errors, ...schemaConflicts].slice(0, 5),
    replay_status: isPass ? 'PASS' : 'FAIL',
    activation_readiness: isReady ? 'READY' : 'PENDING',
    is_ready_for_activation: isReady,
    sample_previews: samplePreviews.slice(0, 5)
  };
}

