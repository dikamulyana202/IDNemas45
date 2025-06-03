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
		const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

		const isDashboard = pathname.startsWith(adminOnlyPath);
		const isAuthPage = authPages.includes(pathname);
		const isProtected = requireAuth.includes(pathname) || isDashboard;

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
