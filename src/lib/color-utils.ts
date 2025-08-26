/**
 * Color utility functions
 */

// Common color names mapped to their hex values
const colorMap: Record<string, string> = {
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#FF0000': 'Red',
  '#00FF00': 'Lime',
  '#0000FF': 'Blue',
  '#FFFF00': 'Yellow',
  '#00FFFF': 'Cyan',
  '#FF00FF': 'Magenta',
  '#C0C0C0': 'Silver',
  '#808080': 'Gray',
  '#800000': 'Maroon',
  '#808000': 'Olive',
  '#008000': 'Green',
  '#800080': 'Purple',
  '#008080': 'Teal',
  '#000080': 'Navy',
  '#FFA500': 'Orange',
  '#FFC0CB': 'Pink',
  '#FFD700': 'Gold',
  '#A52A2A': 'Brown',
  '#F0E68C': 'Khaki',
  '#E6E6FA': 'Lavender',
  '#FF6347': 'Tomato',
  '#40E0D0': 'Turquoise',
  '#EE82EE': 'Violet',
  '#F5DEB3': 'Wheat',
  '#FF69B4': 'Hot Pink',
  '#87CEEB': 'Sky Blue',
  '#228B22': 'Forest Green',
  '#DC143C': 'Crimson',
  '#F4A460': 'Sandy Brown',
  '#2E8B57': 'Sea Green',
  '#D8BFD8': 'Thistle',
  '#FF1493': 'Deep Pink',
  '#1E90FF': 'Dodger Blue',
  '#B22222': 'Fire Brick',
  '#FF4500': 'Orange Red',
  '#DA70D6': 'Orchid',
  '#32CD32': 'Lime Green',
  '#F08080': 'Light Coral',
  '#90EE90': 'Light Green',
  '#FFB6C1': 'Light Pink',
  '#FFA07A': 'Light Salmon',
  '#87CEFA': 'Light Sky Blue',
  '#B0C4DE': 'Light Steel Blue',
  '#ADD8E6': 'Light Blue',
  '#F5F5DC': 'Beige',
  '#FFDAB9': 'Peach Puff',
  '#EEE8AA': 'Pale Goldenrod',
  '#98FB98': 'Pale Green',
  '#FFEFD5': 'Papaya Whip',
  '#FFE4B5': 'Moccasin',
  '#FFF8DC': 'Cornsilk',
  '#F0F8FF': 'Alice Blue',
  '#F5FFFA': 'Mint Cream',
  '#FFFAF0': 'Floral White',
  '#FAF0E6': 'Linen',
  '#FDF5E6': 'Old Lace',
  '#FFFAFA': 'Snow',
  '#F0FFF0': 'Honeydew',
  '#F5F5F5': 'White Smoke',
  '#FFF0F5': 'Lavender Blush',
  '#FFFFF0': 'Ivory',
};

/**
 * Convert HEX color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate color distance using Euclidean distance formula
 */
function colorDistance(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Get the name of a color from its HEX value
 * @param hex - The HEX color value (e.g., "#FF0000" or "FF0000")
 * @returns The color name (e.g., "Red")
 */
export function getColorNameFromHex(hex: string): string {
  // Normalize the hex value
  const normalizedHex = hex.startsWith('#') ? hex.toUpperCase() : `#${hex.toUpperCase()}`;

  // Check for exact match
  if (colorMap[normalizedHex]) {
    return colorMap[normalizedHex];
  }

  // Find the closest color
  const inputRgb = hexToRgb(normalizedHex);
  if (!inputRgb) {
    return 'Unknown';
  }

  let closestColor = '';
  let minDistance = Infinity;

  for (const [hexValue, colorName] of Object.entries(colorMap)) {
    const rgb = hexToRgb(hexValue);
    if (rgb) {
      const distance = colorDistance(inputRgb, rgb);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = colorName;
      }
    }
  }

  return closestColor || 'Custom Color';
}

/**
 * Get the HEX value from a color name
 * @param colorName - The name of the color
 * @returns The HEX value or null if not found
 */
export function getHexFromColorName(colorName: string): string | null {
  const normalizedName = colorName.charAt(0).toUpperCase() + colorName.slice(1).toLowerCase();
  for (const [hex, name] of Object.entries(colorMap)) {
    if (name === normalizedName) {
      return hex;
    }
  }
  return null;
}

/**
 * Check if a string is a valid HEX color
 */
export function isValidHex(hex: string): boolean {
  return /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Get a list of common color options
 */
export function getCommonColorOptions() {
  return Object.entries(colorMap).map(([hex, name]) => ({
    value: hex,
    label: name,
    hex: hex,
  }));
}
