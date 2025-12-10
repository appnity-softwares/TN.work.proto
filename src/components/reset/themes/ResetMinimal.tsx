import { ResetForm } from "../ResetForm";

export function ResetMinimal({ token }: { token: string }) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="max-w-sm w-full">
        <h2 className="text-center text-lg mb-4 font-medium">Password Reset</h2>
        <ResetForm token={token} />
      </div>
    </div>
  );
}
