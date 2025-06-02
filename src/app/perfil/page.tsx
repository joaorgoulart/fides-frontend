"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { 
    PageContainer, 
    PageHeader, 
    PageContent, 
    PageTitle 
} from "@/components/common/PageComponents";
import { Button } from "@/components/ui/button";
import UserProfile from "@/components/common/UserProfile";
import { ArrowLeft } from "lucide-react";

export default function PerfilPage() {
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirecionar se não estiver autenticado
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    const handleBack = () => {
        router.push("/dashboard");
    };

    if (!user) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                            Carregando perfil...
                        </p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Meu Perfil"
                subtitle="Visualize suas informações pessoais"
                showBackButton
                onBack={handleBack}
            />

            <PageContent maxWidth="md">
                <PageTitle 
                    title="Informações do Usuário"
                    subtitle="Dados cadastrais e estatísticas da conta"
                />
                
                <UserProfile user={user} />
                
                <div className="mt-6 flex justify-center">
                    <Button onClick={handleBack} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar ao Dashboard
                    </Button>
                </div>
            </PageContent>
        </PageContainer>
    );
} 