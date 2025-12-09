'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';

const schema = z.object({
    id: z.string(),
    name: z.string(),
    employeeCode: z.string(),
    role: z.nativeEnum(Role),
});

export async function updateUser(prevState: any, formData: FormData) {
    const validatedFields = schema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Invalid form data' };
    }

    try {
        await db.user.update({
            where: { id: validatedFields.data.id },
            data: validatedFields.data,
        });

        revalidatePath('/admin/employees');
        return { success: true, message: 'Employee updated successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to update employee' };
    }
}