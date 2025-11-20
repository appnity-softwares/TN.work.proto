// src/lib/types.ts
import {
  Role as PrismaRole,
  UserStatus,
  NoticeType,
  User as PrismaUser,
  Notice as PrismaNotice,
  WorkLog as PrismaWorkLog,
  ErrorLog as PrismaErrorLog,
  DiscussionPost as PrismaDiscussionPost,
  DiscussionReply as PrismaDiscussionReply
} from "@prisma/client";

export const Role = PrismaRole; // runtime export
export { UserStatus, NoticeType };

// App-level types
export type User = PrismaUser;
export type Notice = PrismaNotice;
export type WorkLog = PrismaWorkLog;
export type ErrorLog = PrismaErrorLog;

export type DiscussionPost = PrismaDiscussionPost & {
  user: PrismaUser;
  replies: (PrismaDiscussionReply & { user: PrismaUser })[]; // fixed to use the imported PrismaDiscussionReply
};

export type SessionUser = Omit<PrismaUser, "hashedPasscode">;
