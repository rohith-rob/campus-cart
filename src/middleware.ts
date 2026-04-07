/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'nextjs_dev_session_secret_1234');
if (!secretKey) {
    throw new Error('SESSION_SECRET environment variable is required.');
}

const key = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const sessionToken = req.cookies.get('session')?.value;

        if (!sessionToken) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        try {
            const { payload } = await jwtVerify(sessionToken, key, {
                algorithms: ['HS256'],
            });

            if (payload.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/login', req.url));
            }

            return NextResponse.next();
        } catch (error) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};

