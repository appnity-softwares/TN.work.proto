'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { SessionUser } from '@/lib/types';

export async function getAuth() {
    const token = (await cookies()).get('auth_token')?.value;
    if (!token) {
        return null;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
        return null;
    }

    return decoded as SessionUser;
}
