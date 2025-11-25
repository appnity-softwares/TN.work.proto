export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin; // client
  }

  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // server
}
