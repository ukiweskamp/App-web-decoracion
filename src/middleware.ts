import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const sessionValid = await verifySession(session);

  const { pathname } = request.nextUrl;

  // Si el usuario está autenticado y trata de ir a /login, redirigir al dashboard
  if (sessionValid && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si el usuario no está autenticado y trata de acceder a una ruta protegida, redirigir a /login
  if (!sessionValid && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Para las rutas de API, podríamos añadir una capa de seguridad similar si fuera necesario.
  // Por ahora, solo protegemos las páginas.

  return NextResponse.next();
}

// Rutas que serán interceptadas por el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/hooks (webhooks públicos con su propia seguridad)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/hooks).*)',
  ],
};
