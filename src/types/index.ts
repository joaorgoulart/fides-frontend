export interface MeetingMinute {
    id: string;
    cnpj: string;
    submissionDate: string;
    status: "pending" | "under_review" | "authenticated" | "rejected";
    summary: string;
    pdfUrl?: string;
    photoUrl?: string;
    signatureUrl?: string;
    llmData?: LLMData;
    validationReport?: ValidationReport;
    comments?: string[];
    blockchainHash?: string;
    blockchainTxId?: string;
}

export interface LLMData {
    summary: string;
    subjects: string[];
    agenda: string;
    deliberations: string[];
    participants: Participant[];
    signatures: string[];
    keywords: string[];
}

export interface Participant {
    name: string;
    rg: string;
    cpf: string;
    role: string;
}

export interface ValidationReport {
    signaturesValid: boolean;
    participantsValid: boolean;
    inconsistencies: string[];
}

export interface User {
    id: string;
    login: string;
    accessLevel: "client" | "notary" | "admin";
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    accessLevel: "client" | "notary" | "admin";
}

export interface MeetingMinutesResponse {
    meetingMinutes: MeetingMinute[];
    total: number;
}

export interface MeetingMinuteFilters {
    cnpj?: string;
    dateFrom?: string;
    dateTo?: string;
    status?: string;
    keywords?: string;
    page?: number;
    limit?: number;
}

export const statusLabels = {
    pending: "Pendente",
    under_review: "Em Análise",
    authenticated: "Autenticado",
    rejected: "Rejeitado",
} as const;

export const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    under_review: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    authenticated: "bg-green-100 text-green-800 hover:bg-green-200",
    rejected: "bg-red-100 text-red-800 hover:bg-red-200",
} as const;
