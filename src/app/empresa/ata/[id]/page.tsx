"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import {
    ArrowLeft,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Building2,
    Shield,
    ShieldCheck,
    Download,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import jsPDF from "jspdf";
import {
    PageContainer,
    PageHeader,
    PageContent,
    PageCard,
    PageLoading,
    PageEmpty,
    PageSection,
} from "@/components/common/PageComponents";

interface MeetingMinute {
    id: string;
    cnpj: string;
    submissionDate: string;
    status: string;
    summary: string;
    pdfUrl?: string;
    blockchainHash?: string;
    blockchainTxId?: string;
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
    const [meetingMinute, setMeetingMinute] = useState<MeetingMinute | null>(
        null
    );
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

    const generatePDF = () => {
        if (!meetingMinute?.llmData) {
            alert("Dados da LLM não disponíveis para esta ata");
            return;
        }

        const doc = new jsPDF();

        // Configurar fonte
        doc.setFont("helvetica", "normal");

        // Título
        doc.setFontSize(20);
        doc.text("Resumo da Ata de Reunião", 20, 30);

        // Informações básicas
        doc.setFontSize(12);
        doc.text(`ID: ${meetingMinute.id}`, 20, 50);
        doc.text(
            `Data de Submissão: ${formatDate(meetingMinute.submissionDate)}`,
            20,
            60
        );
        doc.text(`Status: ${getStatusText(meetingMinute.status)}`, 20, 70);

        // Status Blockchain
        const blockchainStatus = meetingMinute.blockchainHash
            ? "Registrado na Blockchain"
            : "Não registrado na Blockchain";
        doc.text(`Blockchain: ${blockchainStatus}`, 20, 80);

        if (meetingMinute.blockchainHash) {
            doc.text(`Hash: ${meetingMinute.blockchainHash}`, 20, 90);
        }

        let yPosition = meetingMinute.blockchainHash ? 110 : 100;

        // Resumo
        doc.setFontSize(14);
        doc.text("Resumo:", 20, yPosition);
        yPosition += 10;

        doc.setFontSize(12);
        const summaryLines = doc.splitTextToSize(
            meetingMinute.llmData.summary,
            170
        );
        doc.text(summaryLines, 20, yPosition);
        yPosition += summaryLines.length * 7 + 15;

        // Agenda
        if (meetingMinute.llmData.agenda) {
            doc.setFontSize(14);
            doc.text("Agenda:", 20, yPosition);
            yPosition += 10;

            doc.setFontSize(12);
            const agendaLines = doc.splitTextToSize(
                meetingMinute.llmData.agenda,
                170
            );
            doc.text(agendaLines, 20, yPosition);
            yPosition += agendaLines.length * 7 + 15;
        }

        // Deliberações
        if (
            meetingMinute.llmData.deliberations &&
            meetingMinute.llmData.deliberations.length > 0
        ) {
            doc.setFontSize(14);
            doc.text("Deliberações:", 20, yPosition);
            yPosition += 10;

            doc.setFontSize(12);
            meetingMinute.llmData.deliberations.forEach(
                (deliberation, index) => {
                    if (yPosition > 270) {
                        doc.addPage();
                        yPosition = 20;
                    }

                    doc.text(`${index + 1}. ${deliberation}`, 20, yPosition);
                    yPosition += 10;
                }
            );
            yPosition += 10;
        }

        // Participantes
        if (
            meetingMinute.llmData.participants &&
            meetingMinute.llmData.participants.length > 0
        ) {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.text("Participantes:", 20, yPosition);
            yPosition += 10;

            doc.setFontSize(12);
            meetingMinute.llmData.participants.forEach((participant, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.text(
                    `${index + 1}. ${participant.name} - ${participant.role}`,
                    20,
                    yPosition
                );
                if (participant.cpf) {
                    yPosition += 7;
                    doc.text(`   CPF: ${participant.cpf}`, 20, yPosition);
                }
                if (participant.rg) {
                    yPosition += 7;
                    doc.text(`   RG: ${participant.rg}`, 20, yPosition);
                }
                yPosition += 10;
            });
            yPosition += 10;
        }

        // Palavras-chave
        if (
            meetingMinute.llmData.keywords &&
            meetingMinute.llmData.keywords.length > 0
        ) {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.text("Palavras-chave:", 20, yPosition);
            yPosition += 10;

            doc.setFontSize(12);
            const keywordsText = meetingMinute.llmData.keywords.join(", ");
            const keywordsLines = doc.splitTextToSize(keywordsText, 170);
            doc.text(keywordsLines, 20, yPosition);
        }

        // Rodapé
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.text(`Página ${i} de ${pageCount}`, 20, 290);
            doc.text("Gerado pelo Sistema Fides", 140, 290);
        }

        // Salvar o PDF
        doc.save(`ata-resumo-${meetingMinute.id.slice(0, 8)}.pdf`);
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return (
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                );
            case "under_review":
                return <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />;
            case "authenticated":
                return (
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                );
            case "rejected":
                return (
                    <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />
                );
            default:
                return (
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                );
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "Pendente";
            case "under_review":
                return "Em Análise";
            case "authenticated":
                return "Autenticada";
            case "rejected":
                return "Rejeitada";
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return "bg-yellow-50 text-yellow-700 border-yellow-200";
            case "under_review":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "authenticated":
                return "bg-green-50 text-green-700 border-green-200";
            case "rejected":
                return "bg-red-50 text-red-700 border-red-200";
            default:
                return "bg-gray-50 text-gray-700 border-gray-200";
        }
    };

    const getBlockchainBadge = (minute: MeetingMinute) => {
        if (minute.blockchainHash) {
            return (
                <Badge
                    variant="default"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                >
                    <ShieldCheck className="w-3 h-3 mr-1" />
                    Na Blockchain
                </Badge>
            );
        }
        return (
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <Shield className="w-3 h-3 mr-1" />
                Não Registrado
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <PageContainer className="bg-gradient-to-br from-green-50 to-emerald-100">
            <PageHeader
                title="Interface Empresarial"
                subtitle={`CNPJ: ${user?.cnpj}`}
                icon={
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="sm:w-[40px] sm:h-[40px] flex-shrink-0"
                    />
                }
                actions={
                    <Button
                        variant="outline"
                        onClick={logout}
                        size="sm"
                        className="flex-shrink-0"
                    >
                        <span className="hidden sm:inline">Sair</span>
                        <span className="sm:hidden">Sair</span>
                    </Button>
                }
                showBackButton
                onBack={() => router.push("/empresa")}
            />

            <PageContent>
                {/* Error Alert */}
                {error && (
                    <Alert variant="destructive" className="mb-4 sm:mb-6">
                        <AlertDescription className="text-sm">
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Loading */}
                {isLoading ? (
                    <PageLoading message="Carregando detalhes da ata..." />
                ) : meetingMinute ? (
                    <div className="space-y-4 sm:space-y-6">
                        {/* Header da Ata */}
                        <PageCard
                            className="bg-white"
                            title="Ata de Reunião"
                            headerActions={
                                <div className="w-full sm:w-auto sm:ml-4 space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
                                    {meetingMinute.llmData && (
                                        <Button
                                            onClick={generatePDF}
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                            size="sm"
                                        >
                                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="text-sm">
                                                Baixar resumo
                                            </span>
                                        </Button>
                                    )}
                                    {meetingMinute.pdfUrl && (
                                        <Button
                                            onClick={() =>
                                                window.open(
                                                    meetingMinute.pdfUrl,
                                                    "_blank"
                                                )
                                            }
                                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                                            size="sm"
                                        >
                                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                            <span className="text-sm">
                                                Ver PDF Completo
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            }
                        >
                            <div className="space-y-2 sm:space-y-3 mb-3">
                                <div className="flex flex-wrap gap-2">
                                    <span
                                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                                            meetingMinute.status
                                        )} w-fit`}
                                    >
                                        {getStatusIcon(meetingMinute.status)}
                                        {getStatusText(meetingMinute.status)}
                                    </span>
                                    {getBlockchainBadge(meetingMinute)}
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                    <span className="text-xs sm:text-sm text-gray-500 break-all">
                                        ID: {meetingMinute.id}
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600">
                                Submetida em:{" "}
                                {formatDate(meetingMinute.submissionDate)}
                            </p>
                        </PageCard>

                        {/* Resumo */}
                        {meetingMinute.llmData?.summary && (
                            <PageCard
                                title="Resumo da Reunião"
                                className="bg-white"
                            >
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                    {meetingMinute.llmData.summary}
                                </p>
                            </PageCard>
                        )}

                        {/* Assuntos Tratados */}
                        {meetingMinute.llmData?.subjects &&
                            meetingMinute.llmData.subjects.length > 0 && (
                                <PageCard
                                    title="Assuntos Tratados"
                                    className="bg-white"
                                >
                                    <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                                        {meetingMinute.llmData.subjects.map(
                                            (subject, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm sm:text-base text-gray-700 leading-relaxed"
                                                >
                                                    {subject}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </PageCard>
                            )}

                        {/* Deliberações */}
                        {meetingMinute.llmData?.deliberations &&
                            meetingMinute.llmData.deliberations.length > 0 && (
                                <PageCard
                                    title="Deliberações"
                                    className="bg-white"
                                >
                                    <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                                        {meetingMinute.llmData.deliberations.map(
                                            (deliberation, index) => (
                                                <li
                                                    key={index}
                                                    className="text-sm sm:text-base text-gray-700 leading-relaxed"
                                                >
                                                    {deliberation}
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </PageCard>
                            )}

                        {/* Participantes */}
                        {meetingMinute.llmData?.participants &&
                            meetingMinute.llmData.participants.length > 0 && (
                                <PageCard
                                    title="Participantes"
                                    className="bg-white"
                                >
                                    <div className="space-y-2 sm:space-y-3">
                                        {meetingMinute.llmData.participants.map(
                                            (participant, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 sm:p-4 bg-gray-50 rounded-lg"
                                                >
                                                    <p className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                                                        {participant.name}
                                                    </p>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                        <p className="text-xs sm:text-sm text-gray-600">
                                                            {participant.role}
                                                        </p>
                                                        <span className="hidden sm:inline text-gray-400">
                                                            •
                                                        </span>
                                                        <p className="text-xs sm:text-sm text-gray-600">
                                                            RG: {participant.rg}
                                                        </p>
                                                        <span className="hidden sm:inline text-gray-400">
                                                            •
                                                        </span>
                                                        <p className="text-xs sm:text-sm text-gray-600">
                                                            CPF:{" "}
                                                            {participant.cpf}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </PageCard>
                            )}

                        {/* Comentários */}
                        {meetingMinute.comments &&
                            meetingMinute.comments.length > 0 && (
                                <PageCard
                                    title="Comentários do Cartório"
                                    className="bg-white"
                                >
                                    <div className="space-y-2 sm:space-y-3">
                                        {meetingMinute.comments.map(
                                            (comment, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3 sm:p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                                                >
                                                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                                        {comment}
                                                    </p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </PageCard>
                            )}
                    </div>
                ) : (
                    <PageEmpty
                        title="Ata não encontrada"
                        description="A ata solicitada não foi encontrada ou você não tem permissão para visualizá-la."
                        icon={
                            <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto" />
                        }
                        action={
                            <Button
                                onClick={() => router.push("/empresa")}
                                size="sm"
                            >
                                Voltar para lista de atas
                            </Button>
                        }
                    />
                )}
            </PageContent>
        </PageContainer>
    );
}
