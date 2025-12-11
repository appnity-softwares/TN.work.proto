// src/app/api/actions.ts
'use server';

import { db as prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
export async function updateUserDetails(
  userId: string,
  details: {
    email: string;
    mobileNumber: string;
    address: string;
    emergencyContact: string;
    profileUrl: string;
  }
) {
  try {
    await (prisma.user.update as any)({
      where: { id: userId },
      data: {
        email: details.email,
        avatar: details.profileUrl,  // <-- save avatar here

        meta: {
          detailsSubmitted: true,
          email: details.email,
          profileUrl: details.profileUrl,
          mobileNumber: details.mobileNumber,
          address: details.address,
          emergencyContact: details.emergencyContact,
          detailsApproved: false,
        },
      },
    });

    revalidatePath('/dashboard/details');
  } catch (error) {
    console.error('Failed to update user details:', error);
    throw new Error('Failed to update user details.');
  }
}
