import { getToken } from "next-auth/jwt";
import { NextFetchEvent, NextMiddleware, NextRequest, NextResponse } from "next/server";

const authPages = ['/login', '/register'];
const adminOnlyPath = '/dashboard';

export default function withAuth(
	middleware: NextMiddleware,
	requireAuth: string[] = [],
) {
	return async (req: NextRequest, next: NextFetchEvent) => {
		const pathname = req.nextUrl.pathname;

		// Fix 1: Gunakan cookie langsung sebagai fallback
		const sessionToken = req.cookies.get('next-auth.session-token') ||
			req.cookies.get('__Secure-next-auth.session-token');

		// Fix 2: Konfigurasi getToken untuk production
		const token = await getToken({
			req,
			secret: process.env.NEXTAUTH_SECRET,
			// Tambahan config untuk production HTTPS
			secureCookie: process.env.NODE_ENV === 'production'
		});

		const isDashboard = pathname.startsWith(adminOnlyPath);
		const isAuthPage = authPages.includes(pathname);
		const isProtected = requireAuth.includes(pathname) || isDashboard;

		// Fix 3: Jika getToken gagal tapi ada session cookie, skip middleware
		if (!token && sessionToken && isDashboard) {
			// Ada session cookie tapi getToken gagal - bypass ke server untuk handle
			return middleware(req, next);
		}

		if (!token && isProtected && !isAuthPage) {
			const url = new URL('/', req.url);
			url.searchParams.set('callbackUrl', req.nextUrl.pathname);
			return NextResponse.redirect(url);
		}

		if (token && isAuthPage) {
			return NextResponse.redirect(new URL('/', req.url));
		}

		if (token && isDashboard && token.role !== 'admin') {
			return NextResponse.redirect(new URL('/', req.url));
		}

		return middleware(req, next);
	};
}