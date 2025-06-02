"use client";

import { User, accessLevelLabels } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Calendar, FileText } from "lucide-react";

interface UserProfileProps {
    user: User;
    className?: string;
}

export default function UserProfile({ user, className = "" }: UserProfileProps) {
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center space-x-3">
                    <UserIcon className="h-8 w-8 text-blue-600" />
                    <div>
                        <CardTitle className="text-lg">{user.login}</CardTitle>
                        <CardDescription>
                            <Badge variant="outline">
                                {accessLevelLabels[user.accessLevel]}
                            </Badge>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* CNPJ */}
                {user.cnpj && (
                    <div>
                        <Label className="text-sm font-medium text-gray-600">CNPJ</Label>
                        <p className="text-sm font-mono">{applyCnpjMask(user.cnpj)}</p>
                    </div>
                )}

                {/* Nível de Acesso */}
                <div>
                    <Label className="text-sm font-medium text-gray-600">Nível de Acesso</Label>
                    <p className="text-sm">{accessLevelLabels[user.accessLevel]}</p>
                </div>

                {/* Data de Criação */}
                <div>
                    <Label className="text-sm font-medium text-gray-600">Membro desde</Label>
                    <div className="flex items-center text-sm text-gray-700">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(user.createdAt)}
                    </div>
                </div>

                {/* Última Atualização */}
                <div>
                    <Label className="text-sm font-medium text-gray-600">Última Atualização</Label>
                    <p className="text-xs text-gray-500">{formatDate(user.updatedAt)}</p>
                </div>
            </CardContent>
        </Card>
    );
} 