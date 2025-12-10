export function emailBaseLayout(content: string) {
  return `
  <div style="font-family:Arial;max-width:550px;margin:auto;border:1px solid #e6e6e6;border-radius:10px;padding:25px;">
      <div style="text-align:center;margin-bottom:15px;">
          <h2 style="margin:0;">TaskNity</h2>
          <p style="margin:0;color:#555;font-size:13px;">Productivity & Client Work Management</p>
      </div>

      ${content}

      <br />
      <p style="font-size:12px;color:#777;text-align:center;">
        Regards, Team TaskNity<br/>
      </p>

      <hr style="margin-top:20px;border:none;border-top:1px solid #eee" />
      <p style="font-size:11px;color:#aaa;text-align:center">
        This is an automated email. Please do not reply.
      </p>
  </div>
  `;
}
