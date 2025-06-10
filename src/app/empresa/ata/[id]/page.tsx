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
    AlertTriangle,
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
} from "@/components/common/PageComponents";
import {
    Table,
    TableCell,
    TableBody,
    TableHead,
    TableRow,
    TableHeader,
} from "@/components/ui/table";

interface MeetingMinute {
    id: string;
    cnpj: string;
    submissionDate: string;
    signaturesValid?: boolean;
    inconsistencies?: string[];
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

        // Configurações de margem e largura
        const leftMargin = 20;
        const rightMargin = 20;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const maxWidth = pageWidth - leftMargin - rightMargin;
        const maxHeight = 270; // Altura máxima antes de quebrar página
        const lineHeight = 7;

        // Cores
        const primaryColor: [number, number, number] = [0, 0, 0]; // Preto
        const secondaryColor: [number, number, number] = [240, 240, 240]; // Cinza claro
        const textColor: [number, number, number] = [60, 60, 60]; // Cinza escuro

        // Função para verificar e quebrar página se necessário
        const checkPageBreak = (
            currentY: number,
            requiredSpace: number = 15
        ) => {
            if (currentY + requiredSpace > maxHeight) {
                doc.addPage();
                addHeader(); // Adicionar cabeçalho na nova página
                return 60; // Reset para posição após cabeçalho
            }
            return currentY;
        };

        // Função para adicionar linha separadora
        const addSeparator = (y: number, color = secondaryColor) => {
            doc.setDrawColor(...color);
            doc.setLineWidth(0.5);
            doc.line(leftMargin, y, pageWidth - rightMargin, y);
        };

        // Função para criar caixa de título
        const addTitleBox = (title: string, y: number) => {
            doc.setFillColor(...primaryColor);
            doc.rect(leftMargin, y - 8, maxWidth, 15, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(title, leftMargin + 5, y);
            doc.setTextColor(...textColor);
            return y + 12;
        };

        // Função para adicionar bullet point melhorado
        const addBulletPoint = (text: string, yPos: number) => {
            const textLines = doc.splitTextToSize(text, maxWidth - 20);

            // Desenhar bullet point simples
            doc.setFillColor(...primaryColor);
            doc.circle(leftMargin + 8, yPos + 3, 2, "F");

            // Texto do item
            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            doc.text(textLines, leftMargin + 18, yPos);

            return yPos + textLines.length * lineHeight + 5;
        };

        // Função para adicionar cabeçalho
        const addHeader = () => {
            // Fundo do cabeçalho
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, pageWidth, 50, "F");

            // Logo do Fides (retângulo branco com texto)
            doc.setFillColor(255, 255, 255);
            doc.rect(20, 15, 35, 20, "F");
            doc.setTextColor(...primaryColor);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text("FIDES", 37.5 - doc.getTextWidth("FIDES") / 2, 28);

            // Título do documento
            doc.setTextColor(255, 255, 255);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.text("RESUMO DA ATA DE REUNIÃO", 75, 20);

            // Subtítulo
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Sistema de Autenticação Empresarial", 75, 35);

            // Reset cor do texto
            doc.setTextColor(...textColor);
        };

        // Adicionar cabeçalho inicial
        addHeader();

        let yPosition = 70;

        // Caixa de informações básicas
        doc.setFillColor(...secondaryColor);
        doc.rect(leftMargin, yPosition - 5, maxWidth, 45, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("INFORMAÇÕES GERAIS", leftMargin + 5, yPosition + 5);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(
            `ID da Ata: ${meetingMinute.id}`,
            leftMargin + 5,
            yPosition + 15
        );
        doc.text(
            `Data de Submissão: ${formatDate(meetingMinute.submissionDate)}`,
            leftMargin + 5,
            yPosition + 23
        );
        doc.text(
            `Status: ${getStatusText(meetingMinute.status)}`,
            leftMargin + 5,
            yPosition + 31
        );

        // Status Blockchain
        const blockchainStatus = meetingMinute.blockchainHash
            ? "REGISTRADO NA BLOCKCHAIN"
            : "NÃO REGISTRADO NA BLOCKCHAIN";
        doc.setTextColor(
            meetingMinute.blockchainHash ? 0 : 200,
            meetingMinute.blockchainHash ? 150 : 0,
            0
        );
        doc.text(blockchainStatus, leftMargin + 5, yPosition + 39);
        doc.setTextColor(...textColor);

        yPosition += 55;

        // Hash da Blockchain (se existir)
        if (meetingMinute.blockchainHash) {
            yPosition = checkPageBreak(yPosition, 20);
            doc.setFillColor(245, 245, 255);
            doc.rect(leftMargin, yPosition, maxWidth, 15, "F");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            const hashText = `Hash Blockchain: ${meetingMinute.blockchainHash}`;
            const hashLines = doc.splitTextToSize(hashText, maxWidth - 10);
            doc.text(hashLines, leftMargin + 5, yPosition + 8);
            yPosition += 20;
        }

        // Resumo
        yPosition = checkPageBreak(yPosition, 30);
        yPosition = addTitleBox("RESUMO DA REUNIÃO", yPosition);
        yPosition += 5;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const summaryLines = doc.splitTextToSize(
            meetingMinute.llmData.summary,
            maxWidth - 10
        );
        yPosition = checkPageBreak(yPosition, summaryLines.length * lineHeight);
        doc.text(summaryLines, leftMargin + 5, yPosition);
        yPosition += summaryLines.length * lineHeight + 15;

        // Agenda
        if (meetingMinute.llmData.agenda) {
            yPosition = checkPageBreak(yPosition, 30);
            yPosition = addTitleBox("AGENDA", yPosition);
            yPosition += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            const agendaLines = doc.splitTextToSize(
                meetingMinute.llmData.agenda,
                maxWidth - 10
            );
            yPosition = checkPageBreak(
                yPosition,
                agendaLines.length * lineHeight
            );
            doc.text(agendaLines, leftMargin + 5, yPosition);
            yPosition += agendaLines.length * lineHeight + 15;
        }

        // Assuntos Tratados
        if (
            meetingMinute.llmData.subjects &&
            meetingMinute.llmData.subjects.length > 0
        ) {
            yPosition = checkPageBreak(yPosition, 30);
            yPosition = addTitleBox("ASSUNTOS TRATADOS", yPosition);
            yPosition += 5;

            meetingMinute.llmData.subjects.forEach((subject, index) => {
                yPosition = checkPageBreak(yPosition, 25);
                yPosition = addBulletPoint(subject, yPosition);
            });
            yPosition += 10;
        }

        // Deliberações
        if (
            meetingMinute.llmData.deliberations &&
            meetingMinute.llmData.deliberations.length > 0
        ) {
            yPosition = checkPageBreak(yPosition, 30);
            yPosition = addTitleBox("DELIBERAÇÕES", yPosition);
            yPosition += 5;

            meetingMinute.llmData.deliberations.forEach(
                (deliberation, index) => {
                    yPosition = checkPageBreak(yPosition, 25);
                    yPosition = addBulletPoint(deliberation, yPosition);
                }
            );
            yPosition += 10;
        }

        // Participantes
        if (
            meetingMinute.llmData.participants &&
            meetingMinute.llmData.participants.length > 0
        ) {
            yPosition = checkPageBreak(yPosition, 30);
            yPosition = addTitleBox("PARTICIPANTES", yPosition);
            yPosition += 5;

            // Cabeçalho da tabela
            doc.setFillColor(...secondaryColor);
            doc.rect(leftMargin, yPosition, maxWidth, 12, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("Nome", leftMargin + 5, yPosition + 7);
            doc.text("Função", leftMargin + 80, yPosition + 7);
            doc.text("Documentos", leftMargin + 130, yPosition + 7);

            yPosition += 15;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            meetingMinute.llmData.participants.forEach((participant, index) => {
                yPosition = checkPageBreak(yPosition, 20);

                // Linha alternada
                if (index % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(leftMargin, yPosition - 3, maxWidth, 15, "F");
                }

                const nameLines = doc.splitTextToSize(participant.name, 70);
                const roleLines = doc.splitTextToSize(participant.role, 45);
                const docs = [];
                if (participant.cpf) docs.push(`CPF: ${participant.cpf}`);
                if (participant.rg) docs.push(`RG: ${participant.rg}`);
                const docLines = doc.splitTextToSize(docs.join(", "), 60);

                doc.text(nameLines, leftMargin + 5, yPosition + 3);
                doc.text(roleLines, leftMargin + 80, yPosition + 3);
                doc.text(docLines, leftMargin + 130, yPosition + 3);

                yPosition +=
                    Math.max(
                        nameLines.length,
                        roleLines.length,
                        docLines.length
                    ) *
                        6 +
                    8;
            });
            yPosition += 10;
        }

        // Comentários do Cartório
        if (meetingMinute.comments && meetingMinute.comments.length > 0) {
            yPosition = checkPageBreak(yPosition, 30);
            yPosition = addTitleBox("COMENTÁRIOS DO CARTÓRIO", yPosition);
            yPosition += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            meetingMinute.comments.forEach((comment, index) => {
                yPosition = checkPageBreak(yPosition, 20);

                // Caixa de comentário
                doc.setFillColor(255, 250, 235);
                const commentLines = doc.splitTextToSize(
                    `${index + 1}. ${comment}`,
                    maxWidth - 15
                );
                const boxHeight = commentLines.length * lineHeight + 8;
                doc.rect(
                    leftMargin + 5,
                    yPosition - 3,
                    maxWidth - 10,
                    boxHeight,
                    "F"
                );

                // Borda esquerda colorida
                doc.setFillColor(255, 193, 7);
                doc.rect(leftMargin + 5, yPosition - 3, 3, boxHeight, "F");

                doc.text(commentLines, leftMargin + 15, yPosition + 3);
                yPosition += boxHeight + 5;
            });
            yPosition += 10;
        }

        // Palavras-chave
        if (
            meetingMinute.llmData.keywords &&
            meetingMinute.llmData.keywords.length > 0
        ) {
            yPosition = checkPageBreak(yPosition, 30);
            yPosition = addTitleBox("PALAVRAS-CHAVE", yPosition);
            yPosition += 8;

            // Tags de palavras-chave
            let xPosition = leftMargin + 5;
            const tagHeight = 12;

            meetingMinute.llmData.keywords.forEach((keyword, index) => {
                const keywordWidth = doc.getTextWidth(keyword) + 10;

                if (xPosition + keywordWidth > pageWidth - rightMargin) {
                    xPosition = leftMargin + 5;
                    yPosition += tagHeight + 5;
                    yPosition = checkPageBreak(yPosition, tagHeight + 5);
                }

                // Tag background
                doc.setFillColor(230, 255, 230);
                doc.rect(
                    xPosition,
                    yPosition - 8,
                    keywordWidth,
                    tagHeight,
                    "F"
                );

                // Tag border
                doc.setDrawColor(...primaryColor);
                doc.setLineWidth(0.5);
                doc.rect(xPosition, yPosition - 8, keywordWidth, tagHeight);

                // Tag text
                doc.setFont("helvetica", "normal");
                doc.setFontSize(9);
                doc.text(keyword, xPosition + 5, yPosition - 1);

                xPosition += keywordWidth + 8;
            });
        }

        // Rodapé aprimorado
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Linha do rodapé
            addSeparator(285, [200, 200, 200]);

            // Texto do rodapé
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(120, 120, 120);
            doc.text(`Página ${i} de ${pageCount}`, leftMargin, 292);
            doc.text("Gerado pelo Sistema Fides", pageWidth - 65, 292);
            doc.text(
                new Date().toLocaleDateString("pt-BR"),
                pageWidth / 2 - 20,
                292
            );
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

                        <PageCard
                            title="Relatório de Validação"
                            headerActions={
                                <Shield className="w-5 h-5 text-gray-500" />
                            }
                        >
                            <div className="space-y-4">
                                <div className="flex items-center">
                                    {meetingMinute.signaturesValid ? (
                                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-500 mr-2" />
                                    )}
                                    <span className="text-sm text-gray-900">
                                        Assinaturas{" "}
                                        {meetingMinute.signaturesValid
                                            ? "Válidas"
                                            : "Inválidas"}
                                    </span>
                                </div>

                                {meetingMinute.inconsistencies &&
                                    meetingMinute.inconsistencies.length >
                                        0 && (
                                        <div className="mt-4">
                                            <div className="flex items-center text-yellow-600 mb-2">
                                                <AlertTriangle className="w-4 h-4 mr-1" />
                                                <span className="text-sm font-medium">
                                                    Inconsistências
                                                </span>
                                            </div>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                {meetingMinute.inconsistencies.map(
                                                    (issue, index) => (
                                                        <li
                                                            key={index}
                                                            className="list-disc list-inside"
                                                        >
                                                            {issue}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        </div>
                                    )}
                            </div>
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
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Nome</TableHead>
                                                    <TableHead>RG</TableHead>
                                                    <TableHead>CPF</TableHead>
                                                    <TableHead>
                                                        Função
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {meetingMinute.llmData.participants.map(
                                                    (participant, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell className="text-sm text-gray-900">
                                                                {
                                                                    participant.name
                                                                }
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-500">
                                                                {participant.rg}
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-500">
                                                                {
                                                                    participant.cpf
                                                                }
                                                            </TableCell>
                                                            <TableCell className="text-sm text-gray-700">
                                                                {
                                                                    participant.role
                                                                }
                                                            </TableCell>
                                                        </TableRow>
                                                    )
                                                )}
                                            </TableBody>
                                        </Table>
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

                        {meetingMinute.llmData?.keywords &&
                            meetingMinute.llmData.keywords.length > 0 && (
                                <PageCard
                                    title="Palavras-chave"
                                    className="bg-white"
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {meetingMinute.llmData.keywords.map(
                                            (keyword, index) => (
                                                <Badge
                                                    key={index}
                                                    variant="secondary"
                                                >
                                                    {keyword}
                                                </Badge>
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
