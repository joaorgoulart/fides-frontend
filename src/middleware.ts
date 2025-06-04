import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Função simples para decodificar JWT
function decodeJWT(token: string) {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload + '='.repeat((4 - payload.length % 4) % 4)));
        return decoded;
    } catch {
        return null;
    }
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    
    // Ignorar arquivos estáticos
    if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('auth_token')?.value;
    
    // Rotas públicas
    if (['/login', '/cadastro'].includes(pathname)) {
        if (token) {
            const decoded = decodeJWT(token);
            if (decoded?.accessLevel === 'CLIENT' || decoded?.accessLevel === 'client') {
                return NextResponse.redirect(new URL('/empresa', request.url));
            }
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    }

    // Página inicial - redirecionar baseado no tipo de usuário
    if (pathname === '/') {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        const decoded = decodeJWT(token);
        if (decoded?.accessLevel === 'CLIENT' || decoded?.accessLevel === 'client') {
            return NextResponse.redirect(new URL('/empresa', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Verificar autenticação para rotas protegidas
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = decodeJWT(token);
    if (!decoded) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth_token');
        return response;
    }

    // Controle de acesso por tipo de usuário
    if (pathname.startsWith('/empresa')) {
        if (decoded.accessLevel !== 'CLIENT' && decoded.accessLevel !== 'client') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    } else if (pathname.startsWith('/dashboard') || pathname.startsWith('/ata')) {
        if (decoded.accessLevel !== 'NOTARY' && decoded.accessLevel !== 'notary' && 
            decoded.accessLevel !== 'ADMIN' && decoded.accessLevel !== 'admin') {
            return NextResponse.redirect(new URL('/empresa', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 