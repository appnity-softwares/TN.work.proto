export function formatISTTime(date: string | Date, withSeconds = false) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: true,
  });
}

export function formatISTDateTime(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
