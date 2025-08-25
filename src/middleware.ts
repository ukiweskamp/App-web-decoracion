import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const sessionValid = await verifySession(session);

  const { pathname } = request.nextUrl;

  // ✅ Si está logueado e intenta ir a /login → redirige al home
  if (sessionValid && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // ✅ Si NO está logueado y no está en /login → redirige a /login
  if (!sessionValid && !pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// ✅ Configuración: excluir rutas que NO deben pasar por el middleware
export const config = {
  matcher: [
    /**
     * Intercepta todo MENOS:
     * - _next/static (archivos estáticos)
     * - _next/image (optimizador de imágenes)
     * - favicon.ico
     * - api/* (APIs internas, incluidas las que usan Google Sheets)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
