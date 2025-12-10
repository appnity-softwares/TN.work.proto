'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { SessionUser } from '@/lib/types';

const SESSION_COOKIE_NAME = "tn_proto_session"; // 🔥 match session.ts

export async function getAuth() {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
        return null;
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
        return null;
    }

    return { user: decoded as SessionUser };
}
