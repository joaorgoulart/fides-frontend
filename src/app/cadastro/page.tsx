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
import { Eye, EyeOff, Building2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

export default function CadastroPage() {
    const [formData, setFormData] = useState({
        cnpj: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const { isAuthenticated } = useAuth();

    // Redirecionar se já estiver autenticado
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    // Formatação do CNPJ
    const formatCNPJ = (value: string) => {
        // Remove tudo que não é dígito
        const numericValue = value.replace(/\D/g, "");
        
        // Aplica a máscara do CNPJ: XX.XXX.XXX/XXXX-XX
        if (numericValue.length <= 14) {
            return numericValue
                .replace(/^(\d{2})(\d)/, "$1.$2")
                .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                .replace(/\.(\d{3})(\d)/, ".$1/$2")
                .replace(/(\d{4})(\d)/, "$1-$2");
        }
        return value;
    };

    const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatCNPJ(e.target.value);
        setFormData({ ...formData, cnpj: formatted });
    };

    const validateForm = () => {
        // Validar CNPJ (14 dígitos)
        const cnpjNumeros = formData.cnpj.replace(/\D/g, "");
        if (cnpjNumeros.length !== 14) {
            setError("CNPJ deve conter exatamente 14 dígitos");
            return false;
        }

        // Validar senha
        if (formData.password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            return false;
        }

        // Validar confirmação de senha
        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            const cnpjNumeros = formData.cnpj.replace(/\D/g, "");
            
            const response = await apiService.register(cnpjNumeros, formData.password);
            
            setSuccess(`${response.message} Você pode fazer login agora.`);
            
            // Limpar formulário
            setFormData({
                cnpj: "",
                password: "",
                confirmPassword: "",
            });

            // Redirecionar para login após 3 segundos
            setTimeout(() => {
                router.push("/login");
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Erro ao realizar cadastro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-xl">
                    <CardHeader className="text-center">
                        <div className="flex justify-center items-center mb-4">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={200}
                                height={200}
                            />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-700">
                            Cadastro de Empresa
                        </CardTitle>
                        <CardDescription>
                            Sistema Fides - Crie sua conta para acompanhar suas atas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive" className="mb-6">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Success Alert */}
                        {success && (
                            <Alert className="mb-6 border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Registration Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="cnpj"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    CNPJ da Empresa
                                </Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="cnpj"
                                        type="text"
                                        value={formData.cnpj}
                                        onChange={handleCNPJChange}
                                        required
                                        placeholder="00.000.000/0000-00"
                                        className="pl-10"
                                        maxLength={18}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">
                                    Digite apenas os números do CNPJ
                                </p>
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
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                password: e.target.value,
                                            })
                                        }
                                        required
                                        placeholder="Digite sua senha"
                                        className="pr-10"
                                        minLength={6}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 px-3 py-2 hover:bg-transparent"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Mínimo de 6 caracteres
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Confirmar Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                confirmPassword: e.target.value,
                                            })
                                        }
                                        required
                                        placeholder="Confirme sua senha"
                                        className="pr-10"
                                        minLength={6}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 px-3 py-2 hover:bg-transparent"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading || !!success}
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {isLoading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Cadastrando...
                                    </div>
                                ) : success ? (
                                    <div className="flex items-center">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Cadastro Realizado!
                                    </div>
                                ) : (
                                    "Criar Conta"
                                )}
                            </Button>
                        </form>

                        {/* Footer */}
                        <div className="mt-8 text-center space-y-4">
                            <div className="text-sm text-gray-600">
                                Já possui uma conta?{" "}
                                <Link
                                    href="/login"
                                    className="font-medium text-green-600 hover:text-green-500 hover:underline"
                                >
                                    Fazer login
                                </Link>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Sistema Fides v1.0 - Interface Empresarial
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 