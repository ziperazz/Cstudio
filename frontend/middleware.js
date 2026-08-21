import { NextResponse } from 'next/server';

export function middleware(request) {
    const path = request.nextUrl.pathname;

    if (path.startsWith('/admin')) {
        const adminToken = request.cookies.get('adminToken');

        if (!adminToken || !adminToken.value) {
            const loginUrl = new URL('/auth', request.url);
            loginUrl.searchParams.set('redirect', path);
            return NextResponse.redirect(loginUrl);
        }
    }

    if (path.startsWith('/client')) {
        const clientToken = request.cookies.get('clientToken');

        if (!clientToken || !clientToken.value) {
            const loginUrl = new URL('/auth', request.url);
            loginUrl.searchParams.set('redirect', path);
            loginUrl.searchParams.set('type', 'client');
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/client/:path*']
};
