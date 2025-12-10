export async function resetPasswordCustom(userId: string, email: string, name: string) {
  "use server";

  const base = process.env.NEXT_PUBLIC_SITE_URL;

  const res = await fetch(`${base}/api/auth/reset-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email, name })
  });

  return await res.json();
}
