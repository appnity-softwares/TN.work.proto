'use server';

import { db as prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function approveUserDetails(userId: string) {
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
      detailsApproved: true,
    };

    await (prisma.user.update as any)({
      where: { id: userId },
      data: {
        meta: updatedMeta,
      },
    });

    revalidatePath('/admin/employee-details');
    return { success: true, message: 'Details approved successfully.' };
  } catch (error) {
    console.error('Failed to approve user details:', error);
    return { success: false, message: 'Failed to approve user details.' };
  }
}

export async function createUser(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const employeeCode = formData.get('employeeCode') as string;
    const passcode = formData.get('passcode') as string;
    const role = formData.get('role') as Role;

    try {
        const existingUser = await prisma.user.findFirst({
            where: { employeeCode },
        });

        if (existingUser) {
            return { success: false, message: 'Employee code already exists.' };
        }

        const hashedPasscode = await bcrypt.hash(passcode, 10);

        await prisma.user.create({
            data: {
                name,
                employeeCode,
                hashedPasscode,
                role,
            },
        });

        revalidatePath('/admin/employees');
        return { success: true, message: 'Employee created successfully.' };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { success: false, message: 'Failed to create employee.' };
    }
}

export async function deleteUser(userId: string) {
    try {
        await prisma.user.delete({ where: { id: userId } });
        revalidatePath('/admin/employees');
        return { success: true, message: 'Employee has been deleted.' };
    } catch (error) {
        console.error('Failed to delete user:', error);
        return { success: false, message: 'Failed to delete employee.' };
    }
}

export async function resetPassword(userId: string) {
    try {
        const hashedPasscode = await bcrypt.hash('password', 10);
        await prisma.user.update({
            where: { id: userId },
            data: { hashedPasscode },
        });
        revalidatePath('/admin/employees');
        return { success: true, message: "Password has been reset to 'password'." };
    } catch (error) {
        console.error('Failed to reset password:', error);
        return { success: false, message: 'Failed to reset password.' };
    }
}
