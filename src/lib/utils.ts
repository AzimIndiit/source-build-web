import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 10); // Limit to 10 digits
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return '';

  const [, area, prefix, line] = match;
  let result = '';
  if (area) result = `(${area}`;
  if (area.length === 3 && prefix) result += `) ${prefix}`;
  if (prefix.length === 3 && line) result += `-${line}`;
  return result;
};

export const formatCurrency = (value: string | number): string => {
  const numeric = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numeric)) return '';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};


export function truncateFilename(filename: string, maxLength = 15): string {
  if (!filename) return "";

  const dotIndex = filename.lastIndexOf(".");
  const ext = dotIndex !== -1 ? filename.slice(dotIndex) : "";
  const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;

  // If already short enough → return as is
  if (base.length + ext.length <= maxLength) {
    return filename;
  }

  // Truncate base and keep extension
  return `${base.substring(0, 5)}...${ext}`;
}