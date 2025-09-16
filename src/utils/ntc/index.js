import './ntc.js';

// Initialize ntc when module loads
if (typeof globalThis.ntc !== 'undefined' && typeof globalThis.ntc.init === 'function') {
  globalThis.ntc.init();
}

export function getColorNameFromNTC(hex) {
  try {
    if (typeof globalThis.ntc !== 'undefined') {
      const result = globalThis.ntc.name(hex);
      if (result && result[1]) {
        return {
          name: result[1],
          exactMatch: result[2] || false
        };
      }
    }
  } catch (error) {
    console.error('Error getting color name from NTC:', error);
  }
  
  return {
    name: 'Unknown',
    exactMatch: false
  };
}

export default {
  name: getColorNameFromNTC
};