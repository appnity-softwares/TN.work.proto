import prisma from "./db";
import type { User, Notice, WorkLog, ErrorLog, DiscussionPost } from "./types";
import { formatISTDateTime } from "./time";

export async function getUsers(): Promise<User[]> {
    return prisma.user.findMany({
        orderBy: {
            joinDate: 'desc'
        }
    });
}

export async function getUser(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmployeeCode(code: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { employeeCode: code } });
}

export async function getAttendance(): Promise<any[]> {
    const attendanceRecords = await prisma.attendance.findMany({
        include: { user: true },
        orderBy: { checkIn: 'desc' }
    });

    return attendanceRecords.map(r => ({
        id: r.id,
        employeeName: r.user.name,
        clockIn: formatISTDateTime(r.checkIn),
        clockOut: r.checkOut ? formatISTDateTime(r.checkOut) : "—",
    }));
}

export async function getWorkLogsForUser(userId: string): Promise<WorkLog[]> {
    return prisma.workLog.findMany({ 
        where: { userId },
        orderBy: { date: 'desc' }
    });
}

export async function getNotices(): Promise<Notice[]> {
    return prisma.notice.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function getErrorLogs(): Promise<ErrorLog[]> {
    return prisma.errorLog.findMany({
        orderBy: { timestamp: 'desc' }
    });
}

export async function getDiscussionPosts(): Promise<DiscussionPost[]> {
    return prisma.discussionPost.findMany({
        include: {
            user: true,
            replies: {
                include: {
                    user: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
}

export async function getDiscussionPost(id: string): Promise<DiscussionPost | null> {
    return prisma.discussionPost.findUnique({
        where: { id },
        include: {
            user: true,
            replies: {
                include: {
                    user: true
                },
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });
}
