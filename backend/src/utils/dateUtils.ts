import { env } from '../config/env';

/**
 * Date and Timezone Utilities for Deterministic Daily Usage Windows
 * Default Timezone: Asia/Kolkata (IST = UTC + 5:30)
 * Usage window: 00:00:00 to 23:59:59 in the target timezone
 */

export interface DailyResetInfo {
  dateKey: string;
  resetAtIso: string;
  secondsRemaining: number;
  formattedResetTime: string;
}

/**
 * Returns YYYY-MM-DD for the specified timezone
 */
export function getCurrentDateKey(timezone: string = env.APP_TIMEZONE): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Outputs YYYY-MM-DD in en-CA locale
  } catch {
    // Fallback to UTC if timezone is invalid
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Computes exact next midnight in target timezone, with remaining seconds
 */
export function getDailyResetInfo(timezone: string = env.APP_TIMEZONE): DailyResetInfo {
  const dateKey = getCurrentDateKey(timezone);
  const now = new Date();

  // Get current hour, minute, second in target timezone
  let tzHours = 0;
  let tzMinutes = 0;
  let tzSeconds = 0;

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    for (const part of parts) {
      if (part.type === 'hour') tzHours = parseInt(part.value, 10);
      if (part.type === 'minute') tzMinutes = parseInt(part.value, 10);
      if (part.type === 'second') tzSeconds = parseInt(part.value, 10);
    }
  } catch {
    tzHours = now.getUTCHours();
    tzMinutes = now.getUTCMinutes();
    tzSeconds = now.getUTCSeconds();
  }

  // Seconds elapsed today in target timezone
  const secondsElapsedToday = tzHours * 3600 + tzMinutes * 60 + tzSeconds;
  const totalSecondsInDay = 86400;
  const secondsRemaining = Math.max(0, totalSecondsInDay - secondsElapsedToday);

  // Exact next reset time timestamp
  const resetAtDate = new Date(now.getTime() + secondsRemaining * 1000);

  return {
    dateKey,
    resetAtIso: resetAtDate.toISOString(),
    secondsRemaining,
    formattedResetTime: 'Tomorrow at 12:00 AM IST',
  };
}
