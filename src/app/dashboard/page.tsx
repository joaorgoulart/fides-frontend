"use client";

import {
    MeetingMinute,
    MeetingMinuteFilters,
    statusLabels,
    statusColors,
} from "@/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    PageContainer,
    PageHeader,
    PageContent,
    PageTitle,
    PageCard,
} from "@/components/common/PageComponents";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Search,
    FileText,
    Eye,
    ChevronLeft,
    ChevronRight,
    Settings,
    LogOut,
    User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function DashboardPage() {
    const [meetingMinutes, setMeetingMinutes] = useState<MeetingMinute[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<MeetingMinuteFilters>({
        page: 1,
        limit: 10,
    });
    const [totalMeetingMinutes, setTotalMeetingMinutes] = useState(0);

    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();

    // Função para aplicar máscara de CNPJ
    const applyCnpjMask = (value: string) => {
        if (!value) return "";
        
        // Remove todos os caracteres não numéricos
        const cleanValue = value.replace(/\D/g, "");
        
        // Aplica a máscara: XX.XXX.XXX/XXXX-XX
        if (cleanValue.length <= 2) {
            return cleanValue;
        } else if (cleanValue.length <= 5) {
            return cleanValue.replace(/(\d{2})(\d+)/, "$1.$2");
        } else if (cleanValue.length <= 8) {
            return cleanValue.replace(/(\d{2})(\d{3})(\d+)/, "$1.$2.$3");
        } else if (cleanValue.length <= 12) {
            return cleanValue.replace(
                /(\d{2})(\d{3})(\d{3})(\d+)/,
                "$1.$2.$3/$4"
            );
        } else {
            return cleanValue.replace(
                /(\d{2})(\d{3})(\d{3})(\d{4})(\d+)/,
                "$1.$2.$3/$4-$5"
            );
        }
    };

    // Função para remover máscara do CNPJ
    const removeCnpjMask = (value: string) => {
        return value.replace(/\D/g, "");
    };

    // Redirecionar se não estiver autenticado
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    // Carregar MoMs da API
    useEffect(() => {
        if (isAuthenticated) {
            loadMeetingMinutes();
        }
    }, [filters, isAuthenticated]);

    const loadMeetingMinutes = async () => {
        setLoading(true);
        try {
            const response = await apiService.getMeetingMinutes(filters);
            setMeetingMinutes(response.meetingMinutes);
            setTotalMeetingMinutes(response.total);
        } catch (error) {
            console.error("Erro ao carregar Atas de Reunião:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (
        field: keyof MeetingMinuteFilters,
        value: string | number
    ) => {
        setFilters((prev) => ({
            ...prev,
            [field]:
                field === "cnpj" && typeof value === "string"
                    ? removeCnpjMask(value)
                    : value,
            page: field !== "page" ? 1 : typeof value === "number" ? value : 1, // Reset page when other filters change
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR");
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

    const totalPages = Math.ceil(totalMeetingMinutes / (filters.limit || 10));

    // Ações do header
    const headerActions = (
        <>
            <span className="text-sm text-muted-foreground mr-2">
                {user?.name} ({user?.accessLevel})
            </span>
            <Button variant="ghost" size="sm">
                <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
                <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-5 w-5" />
            </Button>
        </>
    );

    return (
        <PageContainer>
            <PageHeader
                title="Fides - Dashboard do Cartorário"
                actions={headerActions}
                icon={<FileText className="h-8 w-8 text-blue-600" />}
            />

            <PageContent>
                <PageTitle
                    title="Dashboard"
                    subtitle="Gerencie e revise as atas de reunião submetidas."
                />

                {/* Filtros */}
                <PageCard
                    title="Filtros"
                    description="Use os filtros abaixo para refinar sua busca por atas"
                    className="mb-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* CNPJ Filter */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                CNPJ
                            </Label>
                            <Input
                                type="text"
                                placeholder="00.000.000/0000-00"
                                value={
                                    filters.cnpj
                                        ? applyCnpjMask(filters.cnpj)
                                        : ""
                                }
                                onChange={(e) =>
                                    handleFilterChange("cnpj", e.target.value)
                                }
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Status
                            </Label>
                            <Select
                                value={filters.status || ""}
                                onValueChange={(value) =>
                                    handleFilterChange("status", value)
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
                                        Autenticado
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejeitado
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date From */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Data Inicial
                            </Label>
                            <Input
                                type="date"
                                value={filters.dateFrom || ""}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "dateFrom",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Date To */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Data Final
                            </Label>
                            <Input
                                type="date"
                                value={filters.dateTo || ""}
                                onChange={(e) =>
                                    handleFilterChange("dateTo", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    {/* Keywords Search */}
                    <div className="mt-4 space-y-2">
                        <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Palavras-chave
                        </Label>
                        <div className="relative">
                            <Input
                                type="text"
                                placeholder="Buscar por palavras-chave..."
                                value={filters.keywords || ""}
                                onChange={(e) =>
                                    handleFilterChange(
                                        "keywords",
                                        e.target.value
                                    )
                                }
                                className="pl-10"
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                    </div>
                </PageCard>

                {/* MoMs Table */}
                <PageCard title={`Atas de Reunião (${totalMeetingMinutes})`}>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>CNPJ / ID</TableHead>
                                    <TableHead>Data de Submissão</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Resumo</TableHead>
                                    <TableHead>Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-8"
                                        >
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                                                Carregando...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : meetingMinutes.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="text-center py-8 text-muted-foreground"
                                        >
                                            Nenhuma ata encontrada
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    meetingMinutes.map((meetingMinute) => (
                                        <TableRow key={meetingMinute.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {applyCnpjMask(meetingMinute.cnpj)}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        #{meetingMinute.id}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    meetingMinute.submissionDate
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(
                                                    meetingMinute.status
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs truncate">
                                                    {meetingMinute.summary}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Link
                                                    href={`/ata/${meetingMinute.id}`}
                                                >
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Visualizar
                                                    </Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between pt-4">
                        <div className="text-sm text-muted-foreground">
                            Mostrando{" "}
                            {((filters.page || 1) - 1) * (filters.limit || 10) +
                                1}{" "}
                            a{" "}
                            {Math.min(
                                (filters.page || 1) * (filters.limit || 10),
                                totalMeetingMinutes
                            )}{" "}
                            de {totalMeetingMinutes} resultados
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleFilterChange(
                                        "page",
                                        (filters.page || 1) - 1
                                    )
                                }
                                disabled={filters.page === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <span className="px-3 py-1 text-sm">
                                Página {filters.page || 1} de {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    handleFilterChange(
                                        "page",
                                        (filters.page || 1) + 1
                                    )
                                }
                                disabled={filters.page === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </PageCard>
            </PageContent>
        </PageContainer>
    );
}
