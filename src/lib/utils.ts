import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  // Remove #
  const sanitizedHex = hex.replace(/^#/, '');

  // Parse r, g, b values
  let r: number, g: number, b: number;
  if (sanitizedHex.length === 3) {
    r = parseInt(sanitizedHex[0] + sanitizedHex[0], 16);
    g = parseInt(sanitizedHex[1] + sanitizedHex[1], 16);
    b = parseInt(sanitizedHex[2] + sanitizedHex[2], 16);
  } else if (sanitizedHex.length === 6) {
    r = parseInt(sanitizedHex.substring(0, 2), 16);
    g = parseInt(sanitizedHex.substring(2, 4), 16);
    b = parseInt(sanitizedHex.substring(4, 6), 16);
  } else {
    return null; // Invalid hex length
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null; // Invalid hex character
  }

  // Convert r, g, b to percentages
  const r_percent = r / 255;
  const g_percent = g / 255;
  const b_percent = b / 255;

  // Find min and max values
  const min = Math.min(r_percent, g_percent, b_percent);
  const max = Math.max(r_percent, g_percent, b_percent);
  const delta = max - min;

  let h_val = 0, s_val = 0;
  const l_val = (max + min) / 2;

  if (delta === 0) { // Achromatic
    h_val = 0;
    s_val = 0;
  } else {
    s_val = l_val > 0.5 ? delta / (2 - max - min) : delta / (max + min);
    switch (max) {
      case r_percent: h_val = (g_percent - b_percent) / delta + (g_percent < b_percent ? 6 : 0); break;
      case g_percent: h_val = (b_percent - r_percent) / delta + 2; break;
      case b_percent: h_val = (r_percent - g_percent) / delta + 4; break;
    }
    h_val /= 6;
  }

  return {
    h: Math.round(h_val * 360),
    s: Math.round(s_val * 100),
    l: Math.round(l_val * 100),
  };
}
