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
import { Building2, FileText, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";
import Image from "next/image";

interface MeetingMinute {
    id: string;
    submissionDate: string;
    status: string;
    summary: string;
    pdfUrl?: string;
}

export default function EmpresaPage() {
    const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const { user, logout } = useAuth();

    useEffect(() => {
        if (user?.cnpj) {
            loadMeetingMinutes();
        }
    }, [user]);

    const loadMeetingMinutes = async () => {
        if (!user?.cnpj) return;

        try {
            setIsLoading(true);
            const response = await apiService.getMeetingMinutesByClient(user.cnpj);
            setMeetingMinutes(response.moms);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar atas");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'under_review':
                return <Eye className="h-4 w-4 text-blue-500" />;
            case 'authenticated':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Pendente';
            case 'under_review':
                return 'Em Análise';
            case 'authenticated':
                return 'Autenticada';
            case 'rejected':
                return 'Rejeitada';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'under_review':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'authenticated':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={120}
                                height={40}
                            />
                            <div className="ml-4">
                                <h1 className="text-xl font-semibold text-green-700">
                                    Interface Empresarial
                                </h1>
                                <p className="text-sm text-gray-600">
                                    CNPJ: {user?.cnpj}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={logout}>
                            Sair
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Minhas Atas de Reunião
                    </h2>
                    <p className="text-gray-600">
                        Acompanhe o status de todas as atas submetidas para autenticação
                    </p>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Loading */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-gray-600">Carregando atas...</span>
                    </div>
                ) : (
                    <>
                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <FileText className="h-8 w-8 text-green-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Total de Atas</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {meetingMinutes.length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <Clock className="h-8 w-8 text-yellow-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Pendentes</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {meetingMinutes.filter(m => m.status.toLowerCase() === 'pending').length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <Eye className="h-8 w-8 text-blue-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Em Análise</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {meetingMinutes.filter(m => m.status.toLowerCase() === 'under_review').length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <CheckCircle className="h-8 w-8 text-green-600" />
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-gray-600">Autenticadas</p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                {meetingMinutes.filter(m => m.status.toLowerCase() === 'authenticated').length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Meeting Minutes List */}
                        {meetingMinutes.length === 0 ? (
                            <Card className="bg-white">
                                <CardContent className="p-12 text-center">
                                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Nenhuma ata encontrada
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Você ainda não possui atas submetidas para autenticação.
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        As atas são submetidas através do terminal no cartório.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {meetingMinutes.map((minute) => (
                                    <Card key={minute.id} className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                                          onClick={() => window.location.href = `/empresa/ata/${minute.id}`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(minute.status)}`}>
                                                            {getStatusIcon(minute.status)}
                                                            {getStatusText(minute.status)}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            ID: {minute.id.slice(0, 8)}...
                                                        </span>
                                                    </div>
                                                    
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        Ata de Reunião
                                                    </h3>
                                                    
                                                    <p className="text-gray-600 mb-3">
                                                        {minute.summary || "Resumo não disponível"}
                                                    </p>
                                                    
                                                    <p className="text-sm text-gray-500">
                                                        Submetida em: {formatDate(minute.submissionDate)}
                                                    </p>
                                                </div>
                                                
                                                <div className="ml-4 flex flex-col gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.location.href = `/empresa/ata/${minute.id}`;
                                                        }}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Ver Detalhes
                                                    </Button>
                                                    {minute.pdfUrl && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(minute.pdfUrl, '_blank');
                                                            }}
                                                        >
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Ver PDF
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
} 