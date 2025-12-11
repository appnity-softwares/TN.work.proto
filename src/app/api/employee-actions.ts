'use server';

import { db } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { getSession } from '@/lib/session';
import { User } from '@/lib/types';
import { Role } from '@prisma/client';
import { randomBytes } from 'crypto';

const thirtyMinutes = 30 * 60 * 1000;

async function generateEditToken(userId: string) {
  const token = randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + thirtyMinutes);

  await db.editToken.create({
    data: {
      token,
      userId,
      expires,
    },
  });

  return token;
}

export async function requestEmployeeDetailsUpdate(userId: string) {
  const session = await getSession();
  if (!session || session.user.role !== Role.ADMIN) {
    return { success: false, message: 'Unauthorized' };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.email) {
    return { success: false, message: 'User not found or has no email.' };
  }

  const token = await generateEditToken(userId);
  const editLink = `${process.env.NEXT_PUBLIC_URL}/account/edit-details?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: 'Update Your Employee Details',
    html: `<p>Please click the link below to update your employee details. This link is valid for 30 minutes.</p><a href="${editLink}">Update Details</a>`,
  });

  return { success: true, message: 'Edit details email sent.' };
}
