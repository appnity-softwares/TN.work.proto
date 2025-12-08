'use server';

import { db as prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateUserDetails(
  userId: string,
  details: {
    mobileNumber: string;
    address: string;
    emergencyContact: string;
  }
) {
  try {
    await (prisma.user.update as any)({
      where: { id: userId },
      data: {
        meta: {
          detailsSubmitted: true,
          mobileNumber: details.mobileNumber,
          address: details.address,
          emergencyContact: details.emergencyContact,
          detailsApproved: false, // Admin approval pending
        },
      },
    });

    revalidatePath('/dashboard/details');
  } catch (error) {
    console.error('Failed to update user details:', error);
    throw new Error('Failed to update user details.');
  }
}
