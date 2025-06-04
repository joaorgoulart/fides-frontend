"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { User as UserIcon, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    PageContainer,
    PageHeader,
    PageContent,
    PageCard,
    PageTwoColumns,
    PageTitle,
} from "@/components/common/PageComponents";

export default function PerfilPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const { user, logout } = useAuth();
    const router = useRouter();

    // Configurações dinâmicas baseadas no tipo de usuário
    const isClient = user?.accessLevel === "client";
    const theme = {
        colors: isClient ? "green" : "blue",
        icon: isClient ? "text-green-600" : "text-blue-600",
        iconBg: isClient ? "bg-green-100" : "bg-blue-100",
        button: isClient
            ? "bg-green-600 hover:bg-green-700"
            : "bg-blue-600 hover:bg-blue-700",
    };

    const validateForm = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Todos os campos são obrigatórios");
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError("A nova senha e a confirmação devem ser iguais");
            return false;
        }
        if (newPassword.length < 6) {
            setError("A nova senha deve ter pelo menos 6 caracteres");
            return false;
        }
        if (currentPassword === newPassword) {
            setError("A nova senha deve ser diferente da senha atual");
            return false;
        }
        return true;
    };

    const clearForm = () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await apiService.updateUser(
                currentPassword,
                newPassword
            );
            setSuccess(response.message);
            clearForm();
        } catch (err: any) {
            setError(err.message || "Erro ao atualizar senha");
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleGoBack = () => {
        router.push(isClient ? "/empresa" : "/dashboard");
    };

    const getPageTitle = () => {
        return isClient ? "Interface Empresarial" : "Dashboard do Cartorário";
    };

    const headerActions = (
        <Button variant="outline" onClick={logout} size="sm">
            Sair
        </Button>
    );

    const InfoField = ({
        label,
        value,
        highlight = false,
    }: {
        label: string;
        value?: string;
        highlight?: boolean;
    }) => (
        <div>
            <Label className="text-sm font-medium text-gray-600">{label}</Label>
            <p
                className={`text-sm sm:text-base text-gray-900 ${
                    highlight ? "font-medium" : ""
                }`}
            >
                {value}
            </p>
        </div>
    );

    const PasswordField = ({
        id,
        label,
        value,
        onChange,
        show,
        onToggle,
        placeholder,
        helper,
    }: {
        id: string;
        label: string;
        value: string;
        onChange: (value: string) => void;
        show: boolean;
        onToggle: () => void;
        placeholder: string;
        helper?: string;
    }) => (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="pr-10"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={onToggle}
                >
                    {show ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </Button>
            </div>
            {helper && <p className="text-xs text-gray-500">{helper}</p>}
        </div>
    );

    const ProfileInfo = () => (
        <PageCard
            title="Informações do Perfil"
            headerActions={
                <div className={`p-2 ${theme.iconBg} rounded-lg`}>
                    <UserIcon className={`h-6 w-6 ${theme.icon}`} />
                </div>
            }
        >
            <div className="space-y-4">
                <InfoField label="Login" value={user?.login} />
                {user?.cnpj && <InfoField label="CNPJ" value={user.cnpj} />}
                <InfoField
                    label="Nível de Acesso"
                    value={isClient ? "Cliente" : "Cartorário"}
                />
                <InfoField
                    label="Membro desde"
                    value={user?.createdAt ? formatDate(user.createdAt) : ""}
                />
            </div>
        </PageCard>
    );

    const PasswordForm = () => (
        <PageCard
            title="Alterar Senha"
            headerActions={
                <div className={`p-2 ${theme.iconBg} rounded-lg`}>
                    <Lock className={`h-6 w-6 ${theme.icon}`} />
                </div>
            }
        >
            <form onSubmit={handleUpdatePassword} className="space-y-6">
                {/* Alerts */}
                {error && (
                    <Alert variant="destructive">
                        <AlertDescription className="text-sm">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert
                        className={`border-${theme.colors}-200 bg-${theme.colors}-50`}
                    >
                        <CheckCircle className={`h-4 w-4 ${theme.icon}`} />
                        <AlertDescription
                            className={`text-sm text-${theme.colors}-700`}
                        >
                            {success}
                        </AlertDescription>
                    </Alert>
                )}

                <PasswordField
                    id="currentPassword"
                    label="Senha Atual"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrentPassword}
                    onToggle={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                    }
                    placeholder="Digite sua senha atual"
                />

                <PasswordField
                    id="newPassword"
                    label="Nova Senha"
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNewPassword}
                    onToggle={() => setShowNewPassword(!showNewPassword)}
                    placeholder="Digite sua nova senha"
                    helper="A senha deve ter pelo menos 6 caracteres"
                />

                <PasswordField
                    id="confirmPassword"
                    label="Confirmar Nova Senha"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirmPassword}
                    onToggle={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                    }
                    placeholder="Confirme sua nova senha"
                />

                <Button
                    type="submit"
                    className={`w-full ${theme.button}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Atualizando...
                        </>
                    ) : (
                        "Atualizar Senha"
                    )}
                </Button>
            </form>
        </PageCard>
    );

    return (
        <PageContainer
            className={`bg-gradient-to-br ${
                isClient
                    ? "from-green-50 to-emerald-100"
                    : "from-blue-50 to-indigo-100"
            }`}
        >
            <PageHeader
                title={getPageTitle()}
                subtitle={user?.cnpj ? `CNPJ: ${user.cnpj}` : undefined}
                icon={
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="sm:w-[40px] sm:h-[40px] flex-shrink-0"
                    />
                }
                showBackButton
                onBack={handleGoBack}
                actions={headerActions}
            />

            <PageContent>
                <PageTitle
                    title="Meu Perfil"
                    subtitle="Visualize suas informações e altere sua senha"
                    className="mb-6"
                />

                <PageTwoColumns
                    left={<ProfileInfo />}
                    right={<PasswordForm />}
                />
            </PageContent>
        </PageContainer>
    );
}
