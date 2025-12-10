import { ResetForm } from "../ResetForm";

export function ResetGlass({ token }: { token: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url(https://images.unsplash.com/photo-1531297484001-80022131f5a1)" }}>
      <div className="backdrop-blur-md bg-white/20 p-6 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-center text-white text-xl mb-2">Reset Password</h2>
        <ResetForm token={token} />
      </div>
    </div>
  );
}
