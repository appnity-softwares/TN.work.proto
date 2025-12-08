import { db as prisma } from "./db";
import type { User, Notice, WorkLog, ErrorLog, DiscussionPost } from "./types";

// -------------------- USERS --------------------
export async function getUsers(): Promise<User[]> {
  return prisma.user.findMany({
    orderBy: { joinDate: "desc" },
  });
}

export async function getUser(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmployeeCode(
  code: string
): Promise<User | null> {
  return prisma.user.findUnique({ where: { employeeCode: code } });
}

// -------------------- ATTENDANCE --------------------
export async function getAttendance(): Promise<any[]> {
  const records = await prisma.attendance.findMany({
    include: { user: true },
    orderBy: { checkIn: "desc" },
  });

  return records.map((r) => ({
    id: r.id,
    employeeName: r.user.name,
    clockIn: r.checkIn,
    clockOut: r.checkOut,
  }));
}

// -------------------- WORK LOGS --------------------
export async function getWorkLogsForUser(userId: string): Promise<WorkLog[]> {
  return prisma.workLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });
}

// -------------------- NOTICES --------------------
export async function getNotices(): Promise<Notice[]> {
  return prisma.notice.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// -------------------- ERRORS --------------------
export async function getErrorLogs(): Promise<ErrorLog[]> {
  return prisma.errorLog.findMany({
    orderBy: { timestamp: "desc" },
  });
}

// -------------------- DISCUSSIONS --------------------
export async function getDiscussionPosts(): Promise<DiscussionPost[]> {
  return prisma.discussionPost.findMany({
    include: {
      user: true,
      replies: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  }) as any;
}

export async function getDiscussionPost(id: string) {
  return prisma.discussionPost.findUnique({
    where: { id },
    include: {
      user: true,
      replies: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  }) as any;
}

// ----------------------------------------------------
// PROJECTS
// ----------------------------------------------------
export async function getProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      users: true,
      clientLinks: {
        include: {
          client: true,
        },
      },
      clientLogFiles: true
    },
  });
}


// ----------------------------------------------------
// CLIENTS
// ----------------------------------------------------
export async function getClientsForAdmin() {
  return prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      employees: {
        include: { user: true },
      },
      projects: {
        include: { project: true },
      },
      logs: true,
    },
  });
}

export async function getClientsForUser(userId: string) {
  return prisma.client.findMany({
    where: {
      employees: {
        some: { userId },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      employees: {
        include: { user: true },
      },
      projects: {
        include: { project: true },
      },
      logs: true,
    },
  });
}

export async function getClientProfile(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: {
      employees: {
        include: {
          user: true,
        },
      },
      projects: {
        include: {
          project: true,
        },
      },
      logs: {
        include: {
          createdBy: true,
          files: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getClientLogs(clientId: string) {
  return prisma.clientLog.findMany({
    where: { clientId },
    include: {
      createdBy: true,
      files: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
