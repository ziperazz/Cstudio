import { NextResponse } from 'next/server';

// صفحات محافظت‌شده هیچ‌وقت نباید کش شوند؛ سافاری در غیر این صورت
// نسخه‌ی کش‌شده‌ی پنل را بدون اجرای دوباره‌ی میدل‌ور نشان می‌دهد
const noStoreHeaders = (response) => {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
};

export function middleware(request) {
    const path = request.nextUrl.pathname;

    if (path === '/admin' || path.startsWith('/admin/')) {
        const adminToken = request.cookies.get('adminToken');

        if (!adminToken || !adminToken.value) {
            const loginUrl = new URL('/auth', request.url);
            loginUrl.searchParams.set('redirect', path);
            return noStoreHeaders(NextResponse.redirect(loginUrl));
        }

        return noStoreHeaders(NextResponse.next());
    }

    if (path === '/client' || path.startsWith('/client/')) {
        const clientToken = request.cookies.get('clientToken');

        if (!clientToken || !clientToken.value) {
            const loginUrl = new URL('/auth', request.url);
            loginUrl.searchParams.set('redirect', path);
            loginUrl.searchParams.set('type', 'client');
            return noStoreHeaders(NextResponse.redirect(loginUrl));
        }

        return noStoreHeaders(NextResponse.next());
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin', '/admin/:path*', '/client', '/client/:path*']
};
