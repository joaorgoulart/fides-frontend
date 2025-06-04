"use client";

import { User, accessLevelLabels } from "@/types";
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
    Users,
    Edit,
    Trash2,
    Plus,
    Search,
    LogOut,
    User as UserIcon,
    Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

interface CreateUserData {
    login: string;
    password: string;
    accessLevel: "NOTARY";
}

interface EditUserData {
    login?: string;
    password?: string;
    accessLevel?: "CLIENT" | "NOTARY";
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [createUserData, setCreateUserData] = useState<CreateUserData>({
        login: "",
        password: "",
        accessLevel: "NOTARY",
    });
    const [editUserData, setEditUserData] = useState<EditUserData>({});

    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();

    // Aplicar máscara de CNPJ
    const applyCnpjMask = (value: string) => {
        if (!value) return "";
        const cleanValue = value.replace(/\D/g, "");

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

    // Remover máscara do CNPJ
    const removeCnpjMask = (value: string) => {
        return value.replace(/\D/g, "");
    };

    // Verificar autenticação e autorização
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        if (user?.accessLevel !== "notary") {
            router.push("/dashboard");
            return;
        }

        loadUsers();
    }, [isAuthenticated, user, router]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const usersData = await apiService.getAllUsers();
            setUsers(usersData);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            toast.error("Erro ao carregar usuários. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await apiService.createUser(createUserData);
            setShowCreateForm(false);
            setCreateUserData({
                login: "",
                password: "",
                accessLevel: "NOTARY",
            });
            loadUsers();
            toast.success("Cartorário criado com sucesso!");
        } catch (error: any) {
            console.error("Erro ao criar cartorário:", error);
            toast.error(
                error.message || "Erro ao criar cartorário. Tente novamente."
            );
        }
    };

    const handleEditUser = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingUser) return;

        try {
            const updateData = { ...editUserData };

            // Remove campos vazios
            Object.keys(updateData).forEach((key) => {
                if (
                    updateData[key as keyof EditUserData] === "" ||
                    updateData[key as keyof EditUserData] === undefined
                ) {
                    delete updateData[key as keyof EditUserData];
                }
            });

            if (Object.keys(updateData).length === 0) {
                toast.info("Nenhuma alteração foi feita.");
                return;
            }

            await apiService.updateUserByAdmin(editingUser.id, updateData);
            setEditingUser(null);
            setEditUserData({});
            loadUsers();
            toast.success("Usuário atualizado com sucesso!");
        } catch (error: any) {
            console.error("Erro ao editar usuário:", error);
            toast.error(
                error.message || "Erro ao editar usuário. Tente novamente."
            );
        }
    };

    const handleDeleteUser = async (userId: string, userLogin: string) => {
        if (
            !confirm(
                `⚠️ Tem certeza que deseja deletar o usuário "${userLogin}"?\n\nEsta ação não pode ser desfeita.`
            )
        ) {
            return;
        }

        try {
            await apiService.deleteUser(userId);
            loadUsers();
            toast.success("Usuário deletado com sucesso!");
        } catch (error: any) {
            console.error("Erro ao deletar usuário:", error);
            toast.error(
                error.message || "Erro ao deletar usuário. Tente novamente."
            );
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getAccessLevelBadge = (accessLevel: User["accessLevel"]) => {
        const variants = {
            client: "secondary" as const,
            notary: "default" as const,
        };

        const colors = {
            client: "bg-blue-100 text-blue-800 hover:bg-blue-200",
            notary: "bg-purple-100 text-purple-800 hover:bg-purple-200",
        };

        return (
            <Badge
                variant={variants[accessLevel]}
                className={colors[accessLevel]}
            >
                {accessLevel === "notary" && (
                    <Shield className="w-3 h-3 mr-1" />
                )}
                {accessLevelLabels[accessLevel]}
            </Badge>
        );
    };

    // Filtrar usuários baseado no termo de busca
    const filteredUsers = users.filter(
        (user) =>
            user.login.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.cnpj && user.cnpj.includes(searchTerm.replace(/\D/g, "")))
    );

    // Ações do header
    const headerActions = (
        <>
            <span className="text-sm text-muted-foreground mr-2">
                {user?.login} (
                {accessLevelLabels[user?.accessLevel || "client"]})
            </span>
            <Link href="/perfil">
                <Button variant="ghost" size="sm">
                    <UserIcon className="h-5 w-5" />
                </Button>
            </Link>
            <Link href="/dashboard">
                <Button variant="outline" size="sm">
                    Voltar ao Dashboard
                </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-5 w-5" />
            </Button>
        </>
    );

    return (
        <PageContainer>
            <PageHeader
                title="Gerenciamento de Cartorários"
                subtitle="Crie e gerencie usuários cartorários do sistema"
                icon={<Users className="h-8 w-8 text-blue-600" />}
                actions={headerActions}
            />

            <PageContent>
                {/* Controles da página */}
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div className="flex items-center space-x-2 flex-1 max-w-md">
                        <Search className="h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Buscar por login ou CNPJ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1"
                        />
                    </div>
                    <Button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Cartorário
                    </Button>
                </div>

                {/* Formulário de criação */}
                {showCreateForm && (
                    <PageCard
                        title="Criar Novo Cartorário"
                        description="Preencha os dados do novo usuário cartorário"
                        className="mb-6"
                    >
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="login">Login *</Label>
                                    <Input
                                        id="login"
                                        value={createUserData.login}
                                        onChange={(e) =>
                                            setCreateUserData({
                                                ...createUserData,
                                                login: e.target.value,
                                            })
                                        }
                                        placeholder="Digite o login"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password">Senha *</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={createUserData.password}
                                        onChange={(e) =>
                                            setCreateUserData({
                                                ...createUserData,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Digite a senha"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateForm(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Criar Cartorário
                                </Button>
                            </div>
                        </form>
                    </PageCard>
                )}

                {/* Formulário de edição */}
                {editingUser && (
                    <PageCard
                        title={`Editar Usuário: ${editingUser.login}`}
                        description="Modifique os dados do usuário (deixe em branco os campos que não deseja alterar)"
                        className="mb-6"
                    >
                        <form onSubmit={handleEditUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="edit-login">Login</Label>
                                    <Input
                                        id="edit-login"
                                        value={editUserData.login || ""}
                                        onChange={(e) =>
                                            setEditUserData({
                                                ...editUserData,
                                                login: e.target.value,
                                            })
                                        }
                                        placeholder={editingUser.login}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-password">
                                        Nova Senha
                                    </Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        value={editUserData.password || ""}
                                        onChange={(e) =>
                                            setEditUserData({
                                                ...editUserData,
                                                password: e.target.value,
                                            })
                                        }
                                        placeholder="Digite uma nova senha"
                                        minLength={6}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-accessLevel">
                                        Nível de Acesso
                                    </Label>
                                    <Select
                                        value={
                                            editUserData.accessLevel ||
                                            editingUser.accessLevel.toUpperCase()
                                        }
                                        onValueChange={(
                                            value: "CLIENT" | "NOTARY"
                                        ) =>
                                            setEditUserData({
                                                ...editUserData,
                                                accessLevel: value,
                                            })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CLIENT">
                                                Cliente
                                            </SelectItem>
                                            <SelectItem value="NOTARY">
                                                Cartorário
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingUser(null);
                                        setEditUserData({});
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </PageCard>
                )}

                {/* Lista de usuários */}
                <PageCard
                    title="Usuários do Sistema"
                    description={`Total: ${filteredUsers.length} usuários`}
                >
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">
                                Carregando usuários...
                            </p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Nenhum usuário encontrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Login</TableHead>
                                        <TableHead>CNPJ</TableHead>
                                        <TableHead>Nível de Acesso</TableHead>
                                        <TableHead>Atas Criadas</TableHead>
                                        <TableHead>Criado em</TableHead>
                                        <TableHead className="text-right">
                                            Ações
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((userItem) => (
                                        <TableRow key={userItem.id}>
                                            <TableCell className="font-medium">
                                                {userItem.login}
                                            </TableCell>
                                            <TableCell>
                                                {userItem.cnpj
                                                    ? applyCnpjMask(
                                                          userItem.cnpj
                                                      )
                                                    : "-"}
                                            </TableCell>
                                            <TableCell>
                                                {getAccessLevelBadge(
                                                    userItem.accessLevel
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {userItem.stats
                                                        ?.createdMoMs || 0}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-600">
                                                {formatDate(userItem.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end space-x-2">
                                                    {userItem.accessLevel ===
                                                        "notary" && (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setEditingUser(
                                                                        userItem
                                                                    );
                                                                    setEditUserData(
                                                                        {}
                                                                    );
                                                                }}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            {userItem.id !==
                                                                user?.id && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        handleDeleteUser(
                                                                            userItem.id,
                                                                            userItem.login
                                                                        )
                                                                    }
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                    {userItem.accessLevel ===
                                                        "client" && (
                                                        <span className="text-sm text-gray-400 px-3 py-1">
                                                            Apenas visualização
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </PageCard>
            </PageContent>
        </PageContainer>
    );
}
