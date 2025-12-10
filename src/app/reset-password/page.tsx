import { validateResetToken } from "@/lib/auth/validateResetToken";
import { ResetGmail } from "@/components/reset/themes/ResetGmail";
import { ResetGlass } from "@/components/reset/themes/ResetGlass";
import { ResetAdmin } from "@/components/reset/themes/ResetAdmin";
import { ResetMinimal } from "@/components/reset/themes/ResetMinimal";

export default async function ResetPasswordPage({ searchParams }: any) {
  const token = searchParams?.token;
  const ui = searchParams?.ui || "gmail";

  if (!token) return <div className="p-10 text-center">Invalid password reset link</div>;

  const { valid, userId } = await validateResetToken(token);

  if (!valid) return <div className="p-10 text-center">Token expired or invalid.</div>;

  switch (ui) {
    case "glass": return <ResetGlass token={token} />;
    case "admin": return <ResetAdmin token={token} />;
    case "minimal": return <ResetMinimal token={token} />;
    default: return <ResetGmail token={token} />;
  }
}
