// /src/lib/email/types.ts

export interface ResetEmailParams {
  name: string;
  link: string;
}

export interface SuspensionEmailParams {
  name: string;
  reason: string;
}

export interface UnsuspendEmailParams {
  name: string;
}

export interface NoticeEmailParams {
  title: string;
  message: string;
  name: string;
}

export interface MeetingEmailParams {
  name: string;
  clientName: string;
  title: string;
  date: string;
  time: string;
  description?: string;
}
