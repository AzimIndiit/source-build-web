/**
 * Date formatting utilities
 */

/**
 * Formats a date to "Month DD, YYYY" format (e.g., "May 12, 2025")
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Formats a date to "MMM DD, YYYY" format (e.g., "May 12, 2025")
 * Using short month format
 * @param date - Date object, string, or timestamp
 * @returns Formatted date string
 */
export const formatDateShort = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  };
  
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Formats a date to relative time (e.g., "2 days ago", "in 3 hours")
 * @param date - Date object, string, or timestamp
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const now = new Date();
  const diffInMilliseconds = now.getTime() - dateObj.getTime();
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);
  
  if (diffInSeconds < 0) {
    // Future dates
    const absDiffInSeconds = Math.abs(diffInSeconds);
    const absDiffInMinutes = Math.abs(diffInMinutes);
    const absDiffInHours = Math.abs(diffInHours);
    const absDiffInDays = Math.abs(diffInDays);
    
    if (absDiffInSeconds < 60) return `in ${absDiffInSeconds} seconds`;
    if (absDiffInMinutes < 60) return `in ${absDiffInMinutes} minutes`;
    if (absDiffInHours < 24) return `in ${absDiffInHours} hours`;
    return `in ${absDiffInDays} days`;
  }
  
  // Past dates
  if (diffInSeconds < 60) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
};

/**
 * Formats a date to ISO string for forms and APIs
 * @param date - Date object, string, or timestamp
 * @returns ISO date string (YYYY-MM-DD)
 */
export const formatDateISO = (date: Date | string | number): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Parses a date string and returns a Date object
 * @param dateString - Date string to parse
 * @returns Date object or null if invalid
 */
export const parseDate = (dateString: string): Date | null => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};