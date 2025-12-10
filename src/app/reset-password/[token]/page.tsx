"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({ params }: any) {
  const router = useRouter();
  const token = params.token;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit() {
    if (password !== confirm) return setMsg("Passwords do not match");

    const res = await fetch("/api/auth/reset-password/confirm", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (data.success) router.push("/login");
    else setMsg(data.message);
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold">Set New Password</h2>

      {msg && <p className="text-red-500">{msg}</p>}

      <input
        type="password"
        placeholder="New password"
        className="border p-2 w-full"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm password"
        className="border p-2 w-full"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
        Reset Password
      </button>
    </div>
  );
}
