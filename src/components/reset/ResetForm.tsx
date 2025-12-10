"use client";

import { useState } from "react";

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const submitHandler = async (e: any) => {
    e.preventDefault();
    if (password !== cpassword) {
      setMsg("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const result = await res.json();
    setLoading(false);

    if (result.success) {
      setMsg("Success! Redirecting...");
      setTimeout(() => (window.location.href = "/"), 1200);
    } else {
      setMsg(result.error || "Failed.");
    }
  };

  return (
    <form onSubmit={submitHandler} className="space-y-4 mt-4">
      <input
        type="password"
        placeholder="New Password"
        className="w-full px-3 py-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full px-3 py-2 border rounded"
        value={cpassword}
        onChange={(e) => setCPassword(e.target.value)}
      />

      <button
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Updating..." : "Reset Password"}
      </button>

      {msg && <p className="text-center text-sm mt-2">{msg}</p>}
    </form>
  );
}
