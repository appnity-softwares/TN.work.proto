import { ResetForm } from "../ResetForm";

export function ResetAdmin({ token }: { token: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-xl rounded-lg max-w-md w-full border">
        <h2 className="text-xl font-semibold text-center mb-2">Admin Password Reset</h2>
        <p className="text-center text-gray-500 text-sm">Enter the new password below</p>
        <ResetForm token={token} />
      </div>
    </div>
  );
}
