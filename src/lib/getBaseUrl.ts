export function getBaseUrl() {
  if (typeof window !== "undefined") {
    return window.location.origin; // client
  }

  return process.env.NEXT_PUBLIC_BASE_URL // server
}
