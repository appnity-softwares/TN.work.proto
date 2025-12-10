// /src/lib/getBaseUrl.ts

export function getBaseUrl() {
  // Client — use browser origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // Server — use ENV variable or safe fallback
  return (
    process.env.NEXT_PUBLIC_BASE_URL || 
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://tn-work-proto.vercel.app" // ⬅ replace with your vercel URL
  );
}
