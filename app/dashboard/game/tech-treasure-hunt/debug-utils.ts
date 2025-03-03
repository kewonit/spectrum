/**
 * Debug utility to help identify issues with round types
 */

/**
 * Normalizes any round type string to ensure consistent matching
 * This is a more thorough implementation than the one in round-switcher
 */
export function normalizeRoundType(type: string): string {
  if (!type) return '';
  
  // Convert to lowercase and replace underscores/hyphens with empty string
  const normalized = type.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  console.log(`[DEBUG] Round type "${type}" normalized to "${normalized}"`);
  
  // Map common variations to standard types
  const typeMap: Record<string, string> = {
    'mathquiz': 'mathquiz',
    'math': 'mathquiz',
    'quiz': 'mathquiz',
    'imagecode': 'imagecode',
    'imagecodehunt': 'imagecode',
    'codehunt': 'imagecode',
    'image': 'imagecode'
  };
  
  const mappedType = typeMap[normalized] || normalized;
  if (mappedType !== normalized) {
    console.log(`[DEBUG] Further mapped to standard type: "${mappedType}"`);
  }
  
  return mappedType;
}

/**
 * Debug function to log round data to console
 */
export function debugRound(label: string, data: any) {
  console.log(`[DEBUG ${label}]`, {
    id: data?.id || 'missing',
    type: data?.round_type || 'missing',
    normalized: normalizeRoundType(data?.round_type || ''),
    name: data?.name || 'missing'
  });
}

/**
 * Debug function to track component state changes
 */
export function debugState(component: string, stateName: string, previousValue: any, newValue: any) {
  console.log(`[STATE] ${component} - ${stateName} changed:`, {
    from: previousValue,
    to: newValue,
    changed: JSON.stringify(previousValue) !== JSON.stringify(newValue)
  });
}
