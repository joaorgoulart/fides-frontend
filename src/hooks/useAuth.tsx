"use client";

import React, {
    useState,
    useEffect,
    createContext,
    useContext,
    ReactNode,
} from "react";
import { apiService } from "@/lib/api";
import { User } from "@/types";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Verificar se o usuário está autenticado ao carregar a página
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("auth_token");
            if (!token) {
                setIsLoading(false);
                return;
            }

            // Tentar buscar dados do usuário com o token existente
            const userData = await apiService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Erro ao verificar autenticação:", error);
            // Se falhar, limpar dados de autenticação
            localStorage.removeItem("auth_token");
            localStorage.removeItem("access_level");
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string) => {
        try {
            setIsLoading(true);
            const authResponse = await apiService.login(username, password);

            // Salvar token também em cookie para o middleware
            if (typeof document !== 'undefined') {
                document.cookie = `auth_token=${authResponse.token}; path=/; max-age=${24 * 60 * 60}; SameSite=Strict`;
            }

            // Buscar dados completos do usuário
            const userData = await apiService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error("Erro no login:", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        apiService.logout();
        
        // Remover cookie também
        if (typeof document !== 'undefined') {
            document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Strict';
        }
        
        setUser(null);
        // Redirecionar para login
        window.location.href = "/login";
    };

    const updateUser = (userData: Partial<User>) => {
        setUser((prev) => (prev ? { ...prev, ...userData } : null));
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth deve ser usado dentro de um AuthProvider");
    }
    return context;
}
