
// src/lib/time.ts
import { formatInTimeZone } from 'date-fns-tz';

const INDIA_TIME_ZONE = 'Asia/Kolkata';

export function formatISTDate(date: Date | string | number) {
  return formatInTimeZone(date, INDIA_TIME_ZONE, "EEEE, MMMM d, yyyy");
}

export function formatISTTime(date: Date | string | number) {
  return formatInTimeZone(date, INDIA_TIME_ZONE, "h:mm a");
}

export function formatISTDateTime(date: Date | string | number) {
  return formatInTimeZone(date, INDIA_TIME_ZONE, "MMMM d, yyyy, h:mm a");
}
