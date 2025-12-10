export function suspendEmailTemplate(name: string, reason: string) {
  return `
  <div style="font-family:Arial;padding:20px;">
    <h2 style="color:#b30000">Account Suspended</h2>
    <p>Dear <b>${name}</b>,</p>
    <p>Your TaskNity account has been <b>suspended</b> due to the following:</p>
    <blockquote style="background:#f9d6d6;padding:15px;border-left:4px solid #b30000;">
      ${reason}
    </blockquote>
    <p>You will not be able to access the system until further notice.</p>
    <br/>
    Regards,<br/>
    <b>Team TaskNity</b>
  </div>
  `;
}
