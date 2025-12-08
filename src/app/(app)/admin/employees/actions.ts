'use server';

import { db as prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deactivateUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'INACTIVE' },
    });
    revalidatePath('/admin/employees');
    return { success: true, message: 'User has been deactivated.' };
  } catch (error) {
    console.error('Failed to deactivate user:', error);
    return { success: false, message: 'Failed to deactivate user.' };
  }
}

export async function suspendUser(userId: string, reason: string) {
    try {
        const user = await (prisma.user.findUnique as any)({
            where: { id: userId },
            select: { meta: true },
        });

        if (!user) {
            return { success: false, message: 'User not found.' };
        }

        const updatedMeta = {
            ...(user.meta as object),
            suspensionReason: reason,
        };

        await (prisma.user.update as any)({
            where: { id: userId },
            data: {
                status: 'SUSPENDED',
                meta: updatedMeta,
            },
        });
        revalidatePath('/admin/employees');
        return { success: true, message: 'User has been suspended.' };
    } catch (error) {
        console.error('Failed to suspend user:', error);
        return { success: false, message: 'Failed to suspend user.' };
    }
}
