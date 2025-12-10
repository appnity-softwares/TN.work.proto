import { ResetForm } from "../ResetForm";

export function ResetGmail({ token }: { token: string }) {
  return (
    <div style={{ fontFamily: "Arial", background: "#f6f8fa", padding: "40px" }}>
      <div style={{ maxWidth: "500px", margin: "auto", background: "white", padding: "25px", borderRadius: "10px", border: "1px solid #e6e6e6" }}>
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Change Password</h2>
        <p style={{ textAlign: "center", color: "#555" }}>Enter new password below</p>
        <ResetForm token={token} />
      </div>
    </div>
  );
}
