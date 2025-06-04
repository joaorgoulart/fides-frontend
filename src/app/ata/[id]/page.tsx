"use client";

import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Shield,
} from "lucide-react";
import {
    PageContainer,
    PageHeader,
    PageContent,
    PageCard,
    PageTwoColumns,
    PageSection,
} from "@/components/common/PageComponents";
import { MeetingMinute, statusLabels, statusColors } from "@/types";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PdfViewer from "@/components/common/PdfViewer";
import LLMDataEditor from "@/components/common/LLMDataEditor";
import Image from "next/image";

export default function MoMDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const [mom, setMom] = useState<MeetingMinute | null>(null);
    const [loading, setLoading] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [newComment, setNewComment] = useState("");

    const momId = params.id as string;

    // Redirecionar se não estiver autenticado
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (isAuthenticated && momId) {
            loadMoM(momId);
        }
    }, [momId, isAuthenticated]);

    const loadMoM = async (id: string) => {
        setLoading(true);
        try {
            const momData = await apiService.getMeetingMinute(id);
            setMom(momData);
        } catch (error) {
            console.error("Erro ao carregar Ata:", error);
            // Redirecionar para dashboard se MoM não for encontrada
            router.push("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: MeetingMinute["status"]) => {
        if (!mom) return;

        setLoading(true);
        try {
            await apiService.updateMeetingMinute(mom.id, {
                status: newStatus,
            });
            setMom((prev) => (prev ? { ...prev, status: newStatus } : null));
            console.log(`Status alterado para: ${newStatus}`);
        } catch (error) {
            console.error("Erro ao alterar status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAuthenticateMoM = async () => {
        if (!mom) return;

        setLoading(true);
        try {
            const response = await apiService.authenticateMeetingMinute(mom.id);
            setMom((prev) =>
                prev
                    ? {
                          ...prev,
                          status: "authenticated",
                          blockchainTxId: response.blockchainTxId,
                      }
                    : null
            );
        } catch (error) {
            console.error("Erro na autenticação:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditField = (field: string, value: string) => {
        setEditingField(field);
        setEditValue(value);
    };

    const handleSaveEdit = () => {
        // Aqui você salvaria a edição via API
        console.log(`Editando ${editingField}:`, editValue);
        setEditingField(null);
        setEditValue("");
    };

    const handleAddComment = async () => {
        if (!mom || !newComment.trim()) return;

        try {
            setLoading(true);
            const response = await apiService.addComment(
                mom.id,
                newComment.trim()
            );
            setMom((prev) =>
                prev
                    ? {
                          ...prev,
                          comments: response.comments,
                          commentsCount: response.commentsCount,
                      }
                    : null
            );
            setNewComment("");
        } catch (error) {
            console.error("Erro ao adicionar comentário:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLLMDataUpdate = (updatedLLMData: any) => {
        setMom((prev) =>
            prev
                ? {
                      ...prev,
                      llmData: updatedLLMData,
                  }
                : null
        );
    };

    const getStatusBadge = (status: MeetingMinute["status"]) => {
        const label = statusLabels[status];

        const variants = {
            pending: "secondary" as const,
            under_review: "default" as const,
            authenticated: "default" as const,
            rejected: "destructive" as const,
        };

        return (
            <Badge variant={variants[status]} className={statusColors[status]}>
                {label}
            </Badge>
        );
    };

    // Loading state
    if (loading || !mom) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">
                            Carregando ata...
                        </p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // PDF Viewer Component
    const pdfViewer = (
        <PageCard
            title="Documento PDF"
            description="Visualização do documento original submetido"
        >
            <PdfViewer fileUrl={mom.pdfUrl} height="600px" />
        </PageCard>
    );

    // Right Panel Components
    const rightPanel = (
        <>
            {/* Basic Info */}
            <PageCard title="Informações Básicas">
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm font-medium">CNPJ</Label>
                        <p className="text-sm mt-1">{mom.cnpj}</p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">
                            Data de Submissão
                        </Label>
                        <p className="text-sm mt-1">
                            {new Date(mom.submissionDate).toLocaleDateString(
                                "pt-BR"
                            )}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <div className="mt-1">{getStatusBadge(mom.status)}</div>
                    </div>
                    {mom.blockchainHash && (
                        <div>
                            <Label className="text-sm font-medium">
                                Hash Blockchain
                            </Label>
                            <p className="text-xs text-muted-foreground font-mono break-all mt-1">
                                {mom.blockchainHash}
                            </p>
                        </div>
                    )}
                </div>
            </PageCard>

            {/* Validation Report */}
            <PageCard
                title="Relatório de Validação"
                headerActions={<Shield className="w-5 h-5 text-gray-500" />}
            >
                <div className="space-y-4">
                    <div className="flex items-center">
                        {mom.validationReport?.signaturesValid ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <span className="text-sm text-gray-900">
                            Assinaturas{" "}
                            {mom.validationReport?.signaturesValid
                                ? "Válidas"
                                : "Inválidas"}
                        </span>
                    </div>

                    <div className="flex items-center">
                        {mom.validationReport?.participantsValid ? (
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                            <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <span className="text-sm text-gray-900">
                            Participantes{" "}
                            {mom.validationReport?.participantsValid
                                ? "Válidos"
                                : "Inválidos"}
                        </span>
                    </div>

                    {mom.validationReport?.inconsistencies &&
                        mom.validationReport.inconsistencies.length > 0 && (
                            <div className="mt-4">
                                <div className="flex items-center text-yellow-600 mb-2">
                                    <AlertTriangle className="w-4 h-4 mr-1" />
                                    <span className="text-sm font-medium">
                                        Inconsistências
                                    </span>
                                </div>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {mom.validationReport.inconsistencies.map(
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

            {/* Actions */}
            <PageCard title="Ações">
                <div className="space-y-3">
                    {mom.status === "pending" && (
                        <Button
                            onClick={() => handleStatusChange("under_review")}
                            disabled={loading}
                            className="w-full"
                        >
                            Iniciar Análise
                        </Button>
                    )}

                    {mom.status === "under_review" && (
                        <>
                            <Button
                                onClick={handleAuthenticateMoM}
                                disabled={loading}
                                className="w-full"
                                variant="default"
                            >
                                Autenticar Ata
                            </Button>
                            <Button
                                onClick={() => handleStatusChange("rejected")}
                                disabled={loading}
                                className="w-full"
                                variant="destructive"
                            >
                                Rejeitar Ata
                            </Button>
                        </>
                    )}

                    {mom.status === "authenticated" && (
                        <div className="text-center py-4">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                                Ata Autenticada
                            </p>
                            {mom.blockchainTxId && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    TX: {mom.blockchainTxId}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </PageCard>

            {/* Comments */}
            <PageCard title="Comentários">
                {mom.comments && mom.comments.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {mom.comments.map((comment, index) => (
                            <div
                                key={index}
                                className="bg-muted rounded-md p-3 break-words"
                            >
                                <p className="text-sm">{comment}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex space-x-2">
                    <Input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Adicionar comentário..."
                        className="flex-1"
                    />
                    <Button onClick={handleAddComment}>Adicionar</Button>
                </div>
            </PageCard>
        </>
    );

    return (
        <PageContainer className="bg-gradient-to-b from-blue-50 to-indigo-100">
            <PageHeader
                title={`Ata #${mom.id}`}
                showBackButton
                onBack={() => router.back()}
                actions={getStatusBadge(mom.status)}
                icon={<Image
                    src="/logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="sm:w-[40px] sm:h-[40px] flex-shrink-0"
                />}
            />

            <PageContent>
                <PageTwoColumns left={pdfViewer} right={rightPanel} />

                {/* LLM Data Section */}
                <PageSection className="mt-8">
                    {mom.llmData && (
                        <LLMDataEditor
                            momId={mom.id}
                            llmData={mom.llmData}
                            onUpdate={handleLLMDataUpdate}
                            disabled={user?.accessLevel !== "notary"}
                        />
                    )}
                </PageSection>
            </PageContent>
        </PageContainer>
    );
}
