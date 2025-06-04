"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import {
    Building2,
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Shield,
    ShieldCheck,
    Filter,
    X,
    User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
    PageContainer,
    PageHeader,
    PageContent,
    PageCard,
    PageLoading,
    PageEmpty,
    PageGrid,
} from "@/components/common/PageComponents";

interface MeetingMinute {
    id: string;
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
}

interface FilterState {
    dateFrom: string;
    dateTo: string;
    status: string;
    keywords: string;
}

export default function EmpresaPage() {
    const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
    const [filteredMinutes, setFilteredMinutes] = useState<MeetingMinute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        dateFrom: "",
        dateTo: "",
        status: "",
        keywords: "",
    });

    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user?.cnpj) {
            loadMeetingMinutes();
        }
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [meetingMinutes, filters]);

    const loadMeetingMinutes = async () => {
        if (!user?.cnpj) return;

        try {
            setIsLoading(true);
            const response = await apiService.getMeetingMinutesByClient(
                user.cnpj
            );
            setMeetingMinutes(response.moms);
        } catch (err: any) {
            setError(err.message || "Erro ao carregar atas");
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...meetingMinutes];

        // Filtro por data
        if (filters.dateFrom) {
            filtered = filtered.filter(
                (minute) =>
                    new Date(minute.submissionDate) >=
                    new Date(filters.dateFrom)
            );
        }
        if (filters.dateTo) {
            filtered = filtered.filter(
                (minute) =>
                    new Date(minute.submissionDate) <= new Date(filters.dateTo)
            );
        }

        // Filtro por status
        if (filters.status) {
            filtered = filtered.filter(
                (minute) =>
                    minute.status.toLowerCase() === filters.status.toLowerCase()
            );
        }

        // Filtro por palavras-chave
        if (filters.keywords) {
            const keywords = filters.keywords.toLowerCase();
            filtered = filtered.filter(
                (minute) =>
                    minute.summary.toLowerCase().includes(keywords) ||
                    minute.id.toLowerCase().includes(keywords) ||
                    minute.llmData?.keywords?.some((keyword) =>
                        keyword.toLowerCase().includes(keywords)
                    ) ||
                    minute.llmData?.participants?.some((participant) =>
                        participant.name.toLowerCase().includes(keywords)
                    )
            );
        }

        setFilteredMinutes(filtered);
    };

    const clearFilters = () => {
        setFilters({
            dateFrom: "",
            dateTo: "",
            status: "",
            keywords: "",
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "pending":
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case "under_review":
                return <Eye className="h-4 w-4 text-blue-500" />;
            case "authenticated":
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case "rejected":
                return <XCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
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
            {/* Header */}
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
                    <>
                        <Button
                            variant="outline"
                            onClick={() => router.push("/perfil")}
                            size="sm"
                            className="flex-shrink-0"
                        >
                            <User className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Perfil</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={logout}
                            size="sm"
                            className="flex-shrink-0"
                        >
                            <span className="hidden sm:inline">Sair</span>
                            <span className="sm:hidden">Sair</span>
                        </Button>
                    </>
                }
            />

            {/* Main Content */}
            <PageContent>
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                                Minhas Atas de Reunião
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Acompanhe o status de todas as atas submetidas
                                para autenticação
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="w-fit"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filtros
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <PageCard
                        title="Filtros"
                        className="mb-6"
                        headerActions={
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        }
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Data Inicial</Label>
                                <Input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            dateFrom: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Data Final</Label>
                                <Input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            dateTo: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            status: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">
                                            Pendente
                                        </SelectItem>
                                        <SelectItem value="under_review">
                                            Em Análise
                                        </SelectItem>
                                        <SelectItem value="authenticated">
                                            Autenticada
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            Rejeitada
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Palavras-chave</Label>
                                <Input
                                    placeholder="Buscar por palavras-chave..."
                                    value={filters.keywords}
                                    onChange={(e) =>
                                        setFilters((prev) => ({
                                            ...prev,
                                            keywords: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button variant="outline" onClick={clearFilters}>
                                Limpar Filtros
                            </Button>
                        </div>
                    </PageCard>
                )}

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
                    <PageLoading message="Carregando atas..." />
                ) : (
                    <>
                        {/* Statistics Cards */}
                        <PageGrid
                            cols={{ sm: 2, lg: 4 }}
                            gap={6}
                            className="mb-6 sm:mb-8"
                        >
                            <Card className="bg-white">
                                <CardContent className="p-3 sm:p-6">
                                    <div className="flex items-center">
                                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                                        <div className="ml-2 sm:ml-4 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                                                Total de Atas
                                            </p>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                                {filteredMinutes.length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-3 sm:p-6">
                                    <div className="flex items-center">
                                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 flex-shrink-0" />
                                        <div className="ml-2 sm:ml-4 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                                                Pendentes
                                            </p>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                                {
                                                    filteredMinutes.filter(
                                                        (m) =>
                                                            m.status.toLowerCase() ===
                                                            "pending"
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-3 sm:p-6">
                                    <div className="flex items-center">
                                        <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
                                        <div className="ml-2 sm:ml-4 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                                                Em Análise
                                            </p>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                                {
                                                    filteredMinutes.filter(
                                                        (m) =>
                                                            m.status.toLowerCase() ===
                                                            "under_review"
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white">
                                <CardContent className="p-3 sm:p-6">
                                    <div className="flex items-center">
                                        <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0" />
                                        <div className="ml-2 sm:ml-4 min-w-0">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                                                Autenticadas
                                            </p>
                                            <p className="text-lg sm:text-2xl font-bold text-gray-900">
                                                {
                                                    filteredMinutes.filter(
                                                        (m) =>
                                                            m.status.toLowerCase() ===
                                                            "authenticated"
                                                    ).length
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </PageGrid>

                        {/* Meeting Minutes List */}
                        {filteredMinutes.length === 0 ? (
                            <Card className="bg-white">
                                <CardContent className="p-8 sm:p-12 text-center">
                                    <Building2 className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                                        Nenhuma ata encontrada
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                                        {meetingMinutes.length === 0
                                            ? "Você ainda não possui atas submetidas para autenticação."
                                            : "Nenhuma ata corresponde aos filtros aplicados."}
                                    </p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        As atas são submetidas através do
                                        terminal no cartório.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {filteredMinutes.map((minute) => (
                                    <Card
                                        key={minute.id}
                                        className="bg-white hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() =>
                                            (window.location.href = `/empresa/ata/${minute.id}`)
                                        }
                                    >
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-start sm:justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                                                minute.status
                                                            )} w-fit`}
                                                        >
                                                            {getStatusIcon(
                                                                minute.status
                                                            )}
                                                            {getStatusText(
                                                                minute.status
                                                            )}
                                                        </span>
                                                        {getBlockchainBadge(
                                                            minute
                                                        )}
                                                        <span className="text-xs sm:text-sm text-gray-500 truncate">
                                                            ID:{" "}
                                                            {minute.id.slice(
                                                                0,
                                                                8
                                                            )}
                                                            ...
                                                        </span>
                                                    </div>

                                                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                                                        Ata de Reunião
                                                    </h3>

                                                    <p className="text-sm sm:text-base text-gray-600 mb-3 line-clamp-2">
                                                        {minute.summary ||
                                                            "Resumo não disponível"}
                                                    </p>

                                                    <p className="text-xs sm:text-sm text-gray-500">
                                                        Submetida em:{" "}
                                                        {formatDate(
                                                            minute.submissionDate
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="flex flex-row sm:flex-col gap-2 sm:ml-4">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="flex-1 sm:flex-none text-xs sm:text-sm min-h-[36px] sm:min-h-[32px]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.location.href = `/empresa/ata/${minute.id}`;
                                                        }}
                                                    >
                                                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                        <span className="hidden sm:inline">
                                                            Ver Detalhes
                                                        </span>
                                                        <span className="sm:hidden">
                                                            Detalhes
                                                        </span>
                                                    </Button>
                                                    {minute.pdfUrl && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 sm:flex-none text-xs sm:text-sm min-h-[36px] sm:min-h-[32px]"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(
                                                                    minute.pdfUrl,
                                                                    "_blank"
                                                                );
                                                            }}
                                                        >
                                                            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                                                            <span className="hidden sm:inline">
                                                                Ver PDF
                                                            </span>
                                                            <span className="sm:hidden">
                                                                PDF
                                                            </span>
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
            </PageContent>
        </PageContainer>
    );
}
