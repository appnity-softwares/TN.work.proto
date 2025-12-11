'use server';

import { db } from '@/lib/db';

export async function updateUserProfile(data: { token: string; name: string; email: string }) {
  const { token, name, email } = data;

  const editToken = await db.editToken.findUnique({
    where: { token },
  });

  if (!editToken || editToken.expires < new Date()) {
    return { success: false, message: 'Invalid or expired token.' };
  }

  try {
    await db.user.update({
      where: { id: editToken.userId },
      data: { name, email },
    });

    // Optionally, delete the token after use
    await db.editToken.delete({ where: { id: editToken.id } });

    return { success: true, message: 'Your details have been updated successfully.' };
  } catch (error) {
    console.error('Error updating user details:', error);
    return { success: false, message: 'An error occurred while updating your details.' };
  }
}
