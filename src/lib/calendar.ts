// /src/lib/calendar.ts

export function toUtcStringNoPunct(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function googleCalendarUrl({
  title,
  details,
  location,
  start,
  end,
}: {
  title: string;
  details?: string;
  location?: string;
  start: Date;
  end: Date;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: details || "",
    location: location || "",
    dates: `${toUtcStringNoPunct(start)}/${toUtcStringNoPunct(end)}`,
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
}

export function createICSText({
  id,
  title,
  description,
  location,
  start,
  end,
}: {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
}) {
  const escape = (s = "") => s.replace(/(\r\n|\n|\r)/g, "\\n").replace(/,/g, "\\,");
  const uid = `tasknity-reminder-${id}@tasknity`;
  const dtstamp = toUtcStringNoPunct(new Date());
  const dtstart = toUtcStringNoPunct(start);
  const dtend = toUtcStringNoPunct(end);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TaskNity//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escape(title)}`,
    `DESCRIPTION:${escape(description || "")}`,
    `LOCATION:${escape(location || "")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
