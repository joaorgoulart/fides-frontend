// Rotas simplificadas do sistema

export const EMPRESA_ROUTES = [
    '/empresa',
    '/empresa/ata'
];

export const CARTORIO_ROUTES = [
    '/dashboard',
    '/ata',
    '/perfil'
];

// Configuração de rotas para diferentes tipos de usuário

export const ROUTES = {
    // Rotas públicas (acessíveis sem autenticação)
    PUBLIC: [
        '/',
        '/login',
        '/cadastro'
    ],

    // Rotas específicas do cartório (NOTARY/ADMIN)
    NOTARY: [
        '/dashboard',
        '/ata',
        '/perfil'
    ],

    // Rotas específicas da empresa (CLIENT)
    CLIENT: [
        '/empresa',
        '/minhas-atas',
        '/perfil-empresa'
    ],

    // Rotas de redirecionamento padrão
    DEFAULT_REDIRECTS: {
        CLIENT: '/empresa',
        NOTARY: '/dashboard',
        ADMIN: '/dashboard'
    }
} as const;

export type UserAccessLevel = 'CLIENT' | 'NOTARY' | 'ADMIN' | 'client' | 'notary' | 'admin';

export function getDefaultRedirect(accessLevel: UserAccessLevel): string {
    const normalizedLevel = accessLevel.toUpperCase() as keyof typeof ROUTES.DEFAULT_REDIRECTS;
    return ROUTES.DEFAULT_REDIRECTS[normalizedLevel] || '/login';
}

export function canAccessRoute(pathname: string, accessLevel: UserAccessLevel): boolean {
    // Rotas públicas são sempre acessíveis
    if (ROUTES.PUBLIC.includes(pathname as any)) {
        return true;
    }

    const normalizedLevel = accessLevel.toUpperCase();

    // Verificar rotas do cartório
    if (ROUTES.NOTARY.some(route => pathname.startsWith(route))) {
        return normalizedLevel === 'NOTARY' || normalizedLevel === 'ADMIN';
    }

    // Verificar rotas da empresa
    if (ROUTES.CLIENT.some(route => pathname.startsWith(route))) {
        return normalizedLevel === 'CLIENT';
    }

    // Se não corresponde a nenhuma rota específica, negar acesso
    return false;
} 