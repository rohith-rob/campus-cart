import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.SESSION_SECRET || "default_super_secret_key_12345";
const key = new TextEncoder().encode(secretKey);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // Protect all /admin/* routes EXCEPT the /admin/login page
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        const sessionToken = req.cookies.get('session')?.value;

        if (!sessionToken) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        try {
            // Decrypt the session token
            const { payload } = await jwtVerify(sessionToken, key, {
                algorithms: ["HS256"],
            });

            // Verify they hold the ADMIN role
            if (payload.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/login', req.url)); // Send regular users back to standard login or home
            }

            // Allow access 
            return NextResponse.next();
        } catch (error) {
            // Token is invalid or expired
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    // Allow all other routes to proceed normally (like /login or /api or /)
    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/admin/:path*'],
};
