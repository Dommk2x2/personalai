// utils/colorUtils.ts
export const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || typeof hex !== 'string' || hex.charAt(0) !== '#') {
    // Return a default semi-transparent color or throw an error if preferred
    return `rgba(128, 128, 128, ${alpha})`;
  }
  let r = 0, g = 0, b = 0;
  // Handle 3-digit hex
  if (hex.length === 4) { // #RGB
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } 
  // Handle 6-digit hex
  else if (hex.length === 7) { // #RRGGBB
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } 
  // Invalid hex length
  else {
    return `rgba(128, 128, 128, ${alpha})`;
  }

  // Check if parsing was successful
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(128, 128, 128, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const lightenHexColor = (hex: string, intensity: number): string => {
  if (!hex || typeof hex !== 'string' || hex.charAt(0) !== '#') {
    return '#FFFFFF'; // default to white on error
  }
  
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) { // #RGB
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) { // #RRGGBB
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  } else {
    return '#FFFFFF';
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return '#FFFFFF';
  }

  // Mix with white. intensity is the amount of original color to keep.
  const p = intensity;
  const w = 1 - p;
  const rNew = Math.round(r * p + 255 * w);
  const gNew = Math.round(g * p + 255 * w);
  const bNew = Math.round(b * p + 255 * w);
  
  const toHex = (c: number) => ('00' + c.toString(16)).slice(-2);

  return `#${toHex(rNew)}${toHex(gNew)}${toHex(bNew)}`;
};
