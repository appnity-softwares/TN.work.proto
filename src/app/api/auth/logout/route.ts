export async function POST() {
  return Response.json({ success: true, message: "Logged out. Clear token client-side." });
}
