/**
 * Format utilities for the application
 */

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format timestamp to MM:SS or HH:MM:SS format
 */
export function formatTimestamp(seconds: number): string {
  return formatDuration(Math.floor(seconds));
}

/**
 * Format currency based on locale
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(
  num: number,
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 0
): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format date relative to now
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return then.toLocaleDateString();
  }
}

/**
 * Format SEA currencies with proper symbols
 */
export function formatSEACurrency(
  amount: number,
  currencyCode: string
): string {
  const currencyMap: Record<string, { symbol: string; locale: string }> = {
    SGD: { symbol: 'S$', locale: 'en-SG' },
    IDR: { symbol: 'Rp', locale: 'id-ID' },
    MYR: { symbol: 'RM', locale: 'ms-MY' },
    THB: { symbol: '฿', locale: 'th-TH' },
    VND: { symbol: '₫', locale: 'vi-VN' },
    PHP: { symbol: '₱', locale: 'en-PH' },
    USD: { symbol: '$', locale: 'en-US' },
  };

  const currency = currencyMap[currencyCode] || currencyMap.USD;

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format language code to readable name
 */
export function formatLanguage(code: string): string {
  const languages: Record<string, string> = {
    en: 'English',
    id: 'Bahasa Indonesia',
    ms: 'Bahasa Melayu',
    th: 'ไทย (Thai)',
    vi: 'Tiếng Việt',
    tl: 'Tagalog',
    zh: '中文 (Chinese)',
    ta: 'தமிழ் (Tamil)',
    hi: 'हिन्दी (Hindi)',
  };

  return languages[code] || code.toUpperCase();
}