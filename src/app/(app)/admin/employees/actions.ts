'use server';

import { db as prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

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

export async function resetPassword(userId: string) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password', salt);

        await prisma.user.update({
            where: { id: userId },
            data: { hashedPasscode: hashedPassword },
        });

        return { success: true, message: "User's password has been reset to 'password'." };
    } catch (error) {
        console.error('Failed to reset password:', error);
        return { success: false, message: 'Failed to reset password.' };
    }
}

export async function updateUser(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const employeeCode = formData.get('employeeCode') as string;
    const role = formData.get('role') as string;

    try {
        await prisma.user.update({
            where: { id },
            data: {
                name,
                employeeCode,
                role: role as any,
            },
        });

        revalidatePath('/admin/employees');
        return { success: true, message: 'Employee updated successfully.' };
    } catch (error) {
        console.error('Failed to update employee:', error);
        return { success: false, message: 'Failed to update employee.' };
    }
}
