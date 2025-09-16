import { getColorNameFromNTC } from './ntc/index';

interface ColorResult {
  hex: string;
  name: string;
  exactMatch: boolean;
}

export function getColorName(hexCode: string): ColorResult {
  try {
    // Ensure hex code starts with #
    const formattedHex = hexCode.startsWith('#') ? hexCode : `#${hexCode}`;
    
    // Validate hex format
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(formattedHex)) {
      return {
        hex: hexCode,
        name: 'Invalid Color',
        exactMatch: false
      };
    }
    
    // Get color name from our local NTC implementation
    const result = getColorNameFromNTC(formattedHex);
    
    return {
      hex: formattedHex,
      name: result.name,
      exactMatch: result.exactMatch
    };
  } catch (error) {
    console.error('Error getting color name:', error);
    return {
      hex: hexCode,
      name: 'Unknown Color',
      exactMatch: false
    };
  }
}

