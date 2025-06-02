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
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'under_review':
                return <Eye className="h-5 w-5 text-blue-500" />;
            case 'authenticated':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
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
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/empresa')}
                        className="text-green-600 hover:text-green-700"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar para lista de atas
                    </Button>
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
                        <span className="ml-2 text-gray-600">Carregando detalhes da ata...</span>
                    </div>
                ) : meetingMinute ? (
                    <div className="space-y-6">
                        {/* Header da Ata */}
                        <Card className="bg-white">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl text-gray-900 mb-2">
                                            Ata de Reunião
                                        </CardTitle>
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(meetingMinute.status)}`}>
                                                {getStatusIcon(meetingMinute.status)}
                                                {getStatusText(meetingMinute.status)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                ID: {meetingMinute.id}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Submetida em: {formatDate(meetingMinute.submissionDate)}
                                        </p>
                                    </div>
                                    {meetingMinute.pdfUrl && (
                                        <Button
                                            onClick={() => window.open(meetingMinute.pdfUrl, '_blank')}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <FileText className="h-4 w-4 mr-2" />
                                            Ver PDF Completo
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Resumo */}
                        {meetingMinute.llmData?.summary && (
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Resumo da Reunião</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{meetingMinute.llmData.summary}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Assuntos Tratados */}
                        {meetingMinute.llmData?.subjects && meetingMinute.llmData.subjects.length > 0 && (
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Assuntos Tratados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside space-y-2">
                                        {meetingMinute.llmData.subjects.map((subject, index) => (
                                            <li key={index} className="text-gray-700">{subject}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Deliberações */}
                        {meetingMinute.llmData?.deliberations && meetingMinute.llmData.deliberations.length > 0 && (
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Deliberações</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc list-inside space-y-2">
                                        {meetingMinute.llmData.deliberations.map((deliberation, index) => (
                                            <li key={index} className="text-gray-700">{deliberation}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        {/* Participantes */}
                        {meetingMinute.llmData?.participants && meetingMinute.llmData.participants.length > 0 && (
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Participantes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {meetingMinute.llmData.participants.map((participant, index) => (
                                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                                <p className="font-medium text-gray-900">{participant.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {participant.role} - RG: {participant.rg} - CPF: {participant.cpf}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Comentários */}
                        {meetingMinute.comments && meetingMinute.comments.length > 0 && (
                            <Card className="bg-white">
                                <CardHeader>
                                    <CardTitle className="text-lg">Comentários do Cartório</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {meetingMinute.comments.map((comment, index) => (
                                            <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                                                <p className="text-gray-700">{comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                ) : (
                    <Card className="bg-white">
                        <CardContent className="p-12 text-center">
                            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Ata não encontrada
                            </h3>
                            <p className="text-gray-600 mb-6">
                                A ata solicitada não foi encontrada ou você não tem permissão para visualizá-la.
                            </p>
                            <Button onClick={() => router.push('/empresa')}>
                                Voltar para lista de atas
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
} 