// src/lib/time.ts
import { formatInTimeZone } from "date-fns-tz";

const INDIA_TIME_ZONE = "Asia/Kolkata";

/* -----------------------------
   FORMATTERS (Already in your code)
------------------------------ */
export function formatISTDate(date: Date | string | number) {
  return formatInTimeZone(date, INDIA_TIME_ZONE, "EEEE, MMMM d, yyyy");
}

export function formatISTTime(date: Date | string | number) {
  return formatInTimeZone(date, INDIA_TIME_ZONE, "h:mm a");
}

export function formatISTDateTime(date: Date | string | number) {
  return formatInTimeZone(date, INDIA_TIME_ZONE, "MMMM d, yyyy, h:mm a");
}

/* -----------------------------
   NEW UTILITY — RAW IST DATE
   Used for clock-in, meetings, reminders etc.
------------------------------ */
export function newDateInIndiaTime(): Date {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: INDIA_TIME_ZONE })
  );
}

/* -----------------------------
   OPTIONAL — Cleaner alias
------------------------------ */
export function nowIST(): Date {
  return newDateInIndiaTime();
}

/* -----------------------------
   Safe converter (optional)
------------------------------ */
export function toIST(date: Date | string | number): Date {
  return new Date(
    new Date(date).toLocaleString("en-US", { timeZone: INDIA_TIME_ZONE })
  );
}
