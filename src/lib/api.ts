import {
    AuthResponse,
    MeetingMinute,
    MeetingMinutesResponse,
    MeetingMinuteFilters,
    User,
} from "@/types";

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiService {
    private getAuthHeader(): HeadersInit {
        const token = localStorage.getItem("auth_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const config: RequestInit = {
            headers: {
                "Content-Type": "application/json",
                ...this.getAuthHeader(),
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            const data: ApiResponse<T> = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || `HTTP error! status: ${response.status}`
                );
            }

            if (!data.success) {
                throw new Error(data.error || "Request failed");
            }

            return data.data as T;
        } catch (error) {
            console.error("API request failed:", error);
            throw error;
        }
    }

    // Authentication
    async login(login: string, password: string): Promise<AuthResponse> {
        const response = await this.request<any>("/login", {
            method: "POST",
            body: JSON.stringify({ login, password }),
        });

        if (response.token) {
            localStorage.setItem("auth_token", response.token);
            localStorage.setItem("access_level", response.accessLevel);
        }

        // Adaptar resposta para o formato esperado pelo frontend
        return {
            token: response.token,
            accessLevel: response.accessLevel,
            user: response.user,
        };
    }

    async register(cnpj: string, password: string): Promise<{
        user: {
            id: string;
            login: string;
            cnpj: string;
            accessLevel: string;
        };
        message: string;
    }> {
        const response = await this.request<any>("/register", {
            method: "POST",
            body: JSON.stringify({ cnpj, password }),
        });

        return {
            user: response.user,
            message: response.message || "Cadastro realizado com sucesso",
        };
    }

    logout(): void {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("access_level");
    }

    // Meeting Minutes
    async getMeetingMinutes(
        filters?: MeetingMinuteFilters
    ): Promise<MeetingMinutesResponse> {
        const queryParams = new URLSearchParams();

        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== "") {
                    queryParams.append(key, value.toString());
                }
            });
        }

        const query = queryParams.toString();
        const response = await this.request<any>(
            `/meeting-minutes${query ? `?${query}` : ""}`
        );

        // Adaptar resposta para o formato esperado pelo frontend
        return {
            meetingMinutes: response.meetingMinutes,
            total: response.total,
            page: response.page,
            limit: response.limit,
            totalPages: response.totalPages,
        };
    }

    async getMeetingMinute(id: string): Promise<MeetingMinute> {
        return this.request<MeetingMinute>(`/meeting-minutes/${id}`);
    }

    async updateMeetingMinute(
        id: string,
        updates: Partial<MeetingMinute>
    ): Promise<{ success: boolean; message: string }> {
        const response = await this.request<any>(`/meeting-minutes/${id}`, {
            method: "PUT",
            body: JSON.stringify(updates),
        });

        return {
            success: true,
            message:
                response.message || "Meeting Minute atualizada com sucesso",
        };
    }

    async authenticateMeetingMinute(
        id: string
    ): Promise<{ success: boolean; blockchainTxId: string }> {
        const response = await this.request<any>(
            `/meeting-minutes/${id}/authenticate`,
            {
                method: "POST",
            }
        );

        return {
            success: true,
            blockchainTxId: response.blockchainTxId,
        };
    }

    async addComment(
        id: string,
        comment: string
    ): Promise<{ comments: string[]; commentsCount: number }> {
        return this.request<{ comments: string[]; commentsCount: number }>(
            `/meeting-minutes/${id}/comments`,
            {
                method: "POST",
                body: JSON.stringify({ comment }),
            }
        );
    }

    async updateLLMData(
        id: string,
        llmData: {
            summary?: string;
            subjects?: string[];
            agenda?: string;
            deliberations?: string[];
            participants?: Array<{
                name: string;
                rg: string;
                cpf: string;
                role: string;
            }>;
            signatures?: string[];
            keywords?: string[];
        }
    ): Promise<{
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
    }> {
        const response = await this.request<any>(`/meeting-minutes/${id}/llm-data`, {
            method: "PUT",
            body: JSON.stringify({ llmData }),
        });

        return response;
    }

    // User management
    async getCurrentUser(): Promise<User> {
        const response = await this.request<any>("/user");

        // Adaptar resposta para o formato esperado pelo frontend (sem name/email)
        return {
            id: response.id,
            login: response.login,
            cnpj: response.cnpj,
            accessLevel: response.accessLevel,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
            stats: response.stats,
        };
    }

    async updateUser(currentPassword: string, newPassword: string): Promise<{ message: string }> {
        const response = await this.request<any>("/user", {
            method: "PUT",
            body: JSON.stringify({ currentPassword, newPassword }),
        });

        return {
            message: response.message || "Senha atualizada com sucesso",
        };
    }

    async getMeetingMinutesByClient(cnpj: string): Promise<{
        moms: Array<{
            id: string;
            submissionDate: string;
            status: string;
            summary: string;
            pdfUrl?: string;
        }>;
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        return this.request<any>(`/meeting-minutes/client/${cnpj}`);
    }

    // File upload utility
    async uploadFile(file: File, endpoint: string): Promise<{ url: string }> {
        const formData = new FormData();
        formData.append("file", file);

        return this.request(endpoint, {
            method: "POST",
            headers: {
                ...this.getAuthHeader(),
                // Don't set Content-Type for FormData, let browser set it
            },
            body: formData,
        });
    }

    async createMeetingMinute(cnpj: string, pdfFile: File): Promise<{
        id: string;
        cnpj: string;
        submissionDate: string;
        status: string;
        summary: string;
        pdfUrl?: string;
        success: boolean;
    }> {
        const formData = new FormData();
        formData.append("cnpj", cnpj);
        formData.append("pdf", pdfFile);

        return this.request("/meeting-minutes", {
            method: "POST",
            headers: {
                ...this.getAuthHeader(),
            },
            body: formData,
        });
    }

    // Admin User Management
    async getAllUsers(): Promise<User[]> {
        return this.request<User[]>("/admin/users");
    }

    async createUser(userData: {
        login: string;
        cnpj?: string;
        password: string;
        accessLevel: "CLIENT" | "NOTARY";
    }): Promise<{
        user: User;
        message: string;
    }> {
        return this.request<{
            user: User;
            message: string;
        }>("/admin/users", {
            method: "POST",
            body: JSON.stringify(userData),
        });
    }

    async updateUserByAdmin(userId: string, updateData: {
        login?: string;
        cnpj?: string;
        password?: string;
        accessLevel?: "CLIENT" | "NOTARY";
    }): Promise<{
        user: User;
        message: string;
    }> {
        return this.request<{
            user: User;
            message: string;
        }>(`/admin/users/${userId}`, {
            method: "PUT",
            body: JSON.stringify(updateData),
        });
    }

    async deleteUser(userId: string): Promise<{ message: string }> {
        return this.request<{ message: string }>(`/admin/users/${userId}`, {
            method: "DELETE",
        });
    }
}

export const apiService = new ApiService();
