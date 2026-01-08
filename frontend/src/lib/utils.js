import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Sophisticated Color Palette
export const colors = {
    dark: {
      bg: '#1E1E1E',
      bgSecondary: '#252526',
      bgTertiary: '#2D2D2D',
      sidebar: '#1A1A1A',
      border: '#3E3E42',
      text: '#E0E0E0',
      textMuted: '#9CA3AF',
      textDim: '#6B7280',
      accent: '#B0C4DE',
      accentHover: '#C0D0E8',
      success: '#A9B7B7',
      error: '#D2B48C',
      activeTab: '#37373D',
    },
    light: {
      bg: '#FFFFFF',
      bgSecondary: '#F8F8F8',
      bgTertiary: '#F0F0F0',
      sidebar: '#F5F5F5',
      border: '#E0E0E0',
      text: '#2D2D2D',
      textMuted: '#6B7280',
      textDim: '#9CA3AF',
      accent: '#36454F',
      accentHover: '#4B5A68',
      success: '#8A9A9A',
      error: '#8B7355',
      activeTab: '#E8E8E8',
    }
  };
  

  