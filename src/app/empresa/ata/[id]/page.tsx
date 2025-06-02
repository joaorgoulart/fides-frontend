"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, Eye, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { apiService } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

interface MeetingMinute {
    id: string;
    cnpj: string;
    submissionDate: string;
    status: string;
    summary: string;
    pdfUrl?: string;
    llmData?: {
        summary: string;
        subjects: string[];
        agenda: string;
        deliberations: string[];
        participants: Array<{
            name: string;
            rg: string;
            cpf: string;
            role: string;
        }>;
        signatures: string[];
        keywords: string[];
    };
    validationReport?: {
        signaturesValid: boolean;
        participantsValid: boolean;
        inconsistencies: string[];
    };
    comments?: string[];
}

export default function AtaDetalhePage() {
    const [meetingMinute, setMeetingMinute] = useState<MeetingMinute | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const { user, logout } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    useEffect(() => {
        if (id) {
            loadMeetingMinute();
        }
    }, [id]);

    const loadMeetingMinute = async () => {
        try {
            setIsLoading(true);
            const data = await apiService.getMeetingMinute(id);
            setMeetingMinute(data);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar ata");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
            case 'under_review':
                return <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
            case 'authenticated':
                return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />;
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
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                    <div className="flex justify-between items-center h-14 sm:h-16">
                        <div className="flex items-center min-w-0 flex-1">
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={100}
                                height={32}
                                className="sm:w-[120px] sm:h-[40px] flex-shrink-0"
                            />
                            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                                <h1 className="text-base sm:text-xl font-semibold text-green-700 truncate">
                                    Interface Empresarial
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">
                                    CNPJ: {user?.cnpj}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={logout} size="sm" className="flex-shrink-0 ml-2">
                            <span className="hidden sm:inline">Sair</span>
                            <span className="sm:hidden">Sair</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
                {/* Back Button */}
                <div className="mb-4 sm:mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/empresa')}
                        className="text-green-600 hover:text-green-700 p-2 sm:px-4"
                        size="sm"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="text-sm sm:text-base">Voltar para lista de atas</span>
                    </Button>
                </div>

                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-4 sm:mb-6">
                        <AlertDescription className="text-sm">{error}</AlertDescription>
                    </Alert>
                )}

                {/* Loading */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-8 sm:py-12">
                        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600"></div>
                        <span className="ml-2 text-sm sm:text-base text-gray-600">Carregando detalhes da ata...</span>
                    </div>
                ) : meetingMinute ? (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Header da Ata */}
                        <Card className="bg-white">
                            <CardHeader className="p-4 sm:p-6">
                                <div className="space-y-4 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-xl sm:text-2xl text-gray-900 mb-2 sm:mb-3">
                                            Ata de Reunião
                                        </CardTitle>
                                        <div className="space-y-2 sm:space-y-3 mb-3">
                                            <span className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(meetingMinute.status)} w-fit`}>
                                                {getStatusIcon(meetingMinute.status)}
                                                {getStatusText(meetingMinute.status)}
                                            </span>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                                <span className="text-xs sm:text-sm text-gray-500 break-all">
                                                    ID: {meetingMinute.id}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600">
                                            Submetida em: {formatDate(meetingMinute.submissionDate)}
                                        </p>
                                    </div>
                                    {meetingMinute.pdfUrl && (
                                        <div className="w-full sm:w-auto sm:ml-4">
                                            <Button
                                                onClick={() => window.open(meetingMinute.pdfUrl, '_blank')}
                                                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                                                size="sm"
                                            >
                                                <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                <span className="text-sm">Ver PDF Completo</span>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Resumo */}
                        {meetingMinute.llmData?.summary && (
                            <Card className="bg-white">
                                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                                    <CardTitle className="text-base sm:text-lg">Resumo da Reunião</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{meetingMinute.llmData.summary}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Assuntos Tratados */}
                        {meetingMinute.llmData?.subjects && meetingMinute.llmData.subjects.length > 0 && (
                            <Card className="bg-white">
                                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                                    <CardTitle className="text-base sm:text-lg">Assuntos Tratados</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                                        {meetingMinute.llmData.subjects.map((subject, index) => (
                                            <li key={index} className="text-sm sm:text-base text-gray-700 leading-relaxed">{subject}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Deliberações */}
                        {meetingMinute.llmData?.deliberations && meetingMinute.llmData.deliberations.length > 0 && (
                            <Card className="bg-white">
                                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                                    <CardTitle className="text-base sm:text-lg">Deliberações</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                                        {meetingMinute.llmData.deliberations.map((deliberation, index) => (
                                            <li key={index} className="text-sm sm:text-base text-gray-700 leading-relaxed">{deliberation}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Participantes */}
                        {meetingMinute.llmData?.participants && meetingMinute.llmData.participants.length > 0 && (
                            <Card className="bg-white">
                                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                                    <CardTitle className="text-base sm:text-lg">Participantes</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <div className="space-y-2 sm:space-y-3">
                                        {meetingMinute.llmData.participants.map((participant, index) => (
                                            <div key={index} className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                                <p className="font-medium text-gray-900 text-sm sm:text-base mb-1">{participant.name}</p>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        {participant.role}
                                                    </p>
                                                    <span className="hidden sm:inline text-gray-400">•</span>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        RG: {participant.rg}
                                                    </p>
                                                    <span className="hidden sm:inline text-gray-400">•</span>
                                                    <p className="text-xs sm:text-sm text-gray-600">
                                                        CPF: {participant.cpf}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comentários */}
                        {meetingMinute.comments && meetingMinute.comments.length > 0 && (
                            <Card className="bg-white">
                                <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-3">
                                    <CardTitle className="text-base sm:text-lg">Comentários do Cartório</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 sm:p-6 pt-0">
                                    <div className="space-y-2 sm:space-y-3">
                                        {meetingMinute.comments.map((comment, index) => (
                                            <div key={index} className="p-3 sm:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <Card className="bg-white">
                        <CardContent className="p-8 sm:p-12 text-center">
                            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                                Ata não encontrada
                            </h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                                A ata solicitada não foi encontrada ou você não tem permissão para visualizá-la.
                            </p>
                            <Button onClick={() => router.push('/empresa')} size="sm">
                                Voltar para lista de atas
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 