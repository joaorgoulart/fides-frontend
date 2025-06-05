"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
    const [credentials, setCredentials] = useState({
        login: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    const router = useRouter();
    const { login, isLoading, isAuthenticated } = useAuth();

    // Garantir que o componente seja montado no cliente
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Redirecionar se já estiver autenticado
    useEffect(() => {
        if (isMounted && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router, isMounted]);

    // Não renderizar até que o componente esteja montado no cliente
    if (!isMounted) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            await login(credentials.login, credentials.password);
            // O redirecionamento será feito pelo middleware baseado no accessLevel
            // Não precisamos mais fazer manualmente aqui
        } catch (err: any) {
            setError(err.message || "Credenciais inválidas. Tente novamente.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center items-center mb-4">
                            <Image
                                src="/logo2.png"
                                alt="Logo"
                                width={200}
                                height={200}
                            />
                        </div>
                        <CardTitle className="text-2xl font-bold">
                            Sistema Fides
                        </CardTitle>
                        <CardDescription>
                            Acesse sua conta para continuar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="login"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Usuário
                                </Label>
                                <Input
                                    id="login"
                                    type="text"
                                    value={credentials.login}
                                    onChange={(e) =>
                                        setCredentials({
                                            ...credentials,
                                            login: e.target.value,
                                        })
                                    }
                                    required
                                    placeholder="Digite seu usuário"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={credentials.password}
                                        onChange={(e) =>
                                            setCredentials({
                                                ...credentials,
                                                password: e.target.value,
                                            })
                                        }
                                        required
                                        placeholder="Digite sua senha"
                                        className="pr-10"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute inset-y-0 right-0 px-3 py-2 hover:bg-transparent"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Entrando...
                                    </div>
                                ) : (
                                    "Entrar"
                                )}
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 text-center">
                            <div className="text-sm text-gray-600 mb-2">
                                Empresa ainda não cadastrada?{" "}
                                <Link
                                    href="/cadastro"
                                    className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                                >
                                    Criar conta
                                </Link>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Sistema Fides v1.0
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
