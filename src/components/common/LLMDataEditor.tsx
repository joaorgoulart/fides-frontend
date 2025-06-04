"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PageCard } from "@/components/common/PageComponents";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { LLMData, Participant } from "@/types";

interface LLMDataEditorProps {
    momId: string;
    llmData: LLMData;
    onUpdate: (updatedData: LLMData) => void;
    disabled?: boolean;
}

export default function LLMDataEditor({
    momId,
    llmData,
    onUpdate,
    disabled = false,
}: LLMDataEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editData, setEditData] = useState<LLMData>(llmData);

    const handleEdit = () => {
        setEditData(llmData);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditData(llmData);
        setIsEditing(false);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updatedData = await apiService.updateLLMData(momId, {
                summary: editData.summary,
                subjects: editData.subjects,
                agenda: editData.agenda,
                deliberations: editData.deliberations,
                participants: editData.participants,
                signatures: editData.signatures,
                keywords: editData.keywords,
            });

            onUpdate(updatedData);
            setIsEditing(false);
        } catch (error) {
            console.error("Erro ao salvar dados LLM:", error);
            alert("Erro ao salvar alterações. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const addSubject = () => {
        setEditData(prev => ({
            ...prev,
            subjects: [...prev.subjects, ""]
        }));
    };

    const removeSubject = (index: number) => {
        setEditData(prev => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index)
        }));
    };

    const updateSubject = (index: number, value: string) => {
        setEditData(prev => ({
            ...prev,
            subjects: prev.subjects.map((subject, i) => i === index ? value : subject)
        }));
    };

    const addDeliberation = () => {
        setEditData(prev => ({
            ...prev,
            deliberations: [...prev.deliberations, ""]
        }));
    };

    const removeDeliberation = (index: number) => {
        setEditData(prev => ({
            ...prev,
            deliberations: prev.deliberations.filter((_, i) => i !== index)
        }));
    };

    const updateDeliberation = (index: number, value: string) => {
        setEditData(prev => ({
            ...prev,
            deliberations: prev.deliberations.map((deliberation, i) => i === index ? value : deliberation)
        }));
    };

    const addParticipant = () => {
        setEditData(prev => ({
            ...prev,
            participants: [...prev.participants, { name: "", rg: "", cpf: "", role: "" }]
        }));
    };

    const removeParticipant = (index: number) => {
        setEditData(prev => ({
            ...prev,
            participants: prev.participants.filter((_, i) => i !== index)
        }));
    };

    const updateParticipant = (index: number, field: keyof Participant, value: string) => {
        setEditData(prev => ({
            ...prev,
            participants: prev.participants.map((participant, i) => 
                i === index ? { ...participant, [field]: value } : participant
            )
        }));
    };

    const addKeyword = () => {
        setEditData(prev => ({
            ...prev,
            keywords: [...prev.keywords, ""]
        }));
    };

    const removeKeyword = (index: number) => {
        setEditData(prev => ({
            ...prev,
            keywords: prev.keywords.filter((_, i) => i !== index)
        }));
    };

    const updateKeyword = (index: number, value: string) => {
        setEditData(prev => ({
            ...prev,
            keywords: prev.keywords.map((keyword, i) => i === index ? value : keyword)
        }));
    };

    if (isEditing) {
        return (
            <div className="space-y-6">
                {/* Header com botões */}
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Editando Análise IA</h3>
                    <div className="flex space-x-2">
                        <Button
                            onClick={handleCancel}
                            variant="outline"
                            size="sm"
                            disabled={loading}
                        >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            size="sm"
                            disabled={loading}
                        >
                            <Save className="w-4 h-4 mr-1" />
                            {loading ? "Salvando..." : "Salvar"}
                        </Button>
                    </div>
                </div>

                {/* Resumo */}
                <PageCard title="Resumo">
                    <div>
                        <Label htmlFor="summary">Resumo da Reunião</Label>
                        <Textarea
                            id="summary"
                            value={editData.summary}
                            onChange={(e) => setEditData(prev => ({ ...prev, summary: e.target.value }))}
                            rows={4}
                            className="mt-1"
                        />
                    </div>
                </PageCard>

                {/* Agenda */}
                <PageCard title="Agenda">
                    <div>
                        <Label htmlFor="agenda">Agenda da Reunião</Label>
                        <Textarea
                            id="agenda"
                            value={editData.agenda}
                            onChange={(e) => setEditData(prev => ({ ...prev, agenda: e.target.value }))}
                            rows={3}
                            className="mt-1"
                        />
                    </div>
                </PageCard>

                {/* Assuntos */}
                <PageCard title="Assuntos Abordados">
                    <div className="space-y-2">
                        {editData.subjects.map((subject, index) => (
                            <div key={index} className="flex space-x-2">
                                <Input
                                    value={subject}
                                    onChange={(e) => updateSubject(index, e.target.value)}
                                    placeholder="Assunto"
                                />
                                <Button
                                    onClick={() => removeSubject(index)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addSubject} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar Assunto
                        </Button>
                    </div>
                </PageCard>

                {/* Deliberações */}
                <PageCard title="Deliberações">
                    <div className="space-y-2">
                        {editData.deliberations.map((deliberation, index) => (
                            <div key={index} className="flex space-x-2">
                                <Textarea
                                    value={deliberation}
                                    onChange={(e) => updateDeliberation(index, e.target.value)}
                                    placeholder="Deliberação"
                                    rows={2}
                                />
                                <Button
                                    onClick={() => removeDeliberation(index)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addDeliberation} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar Deliberação
                        </Button>
                    </div>
                </PageCard>

                {/* Participantes */}
                <PageCard title="Participantes">
                    <div className="space-y-4">
                        {editData.participants.map((participant, index) => (
                            <div key={index} className="p-4 border rounded-lg space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Participante {index + 1}</h4>
                                    <Button
                                        onClick={() => removeParticipant(index)}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label>Nome</Label>
                                        <Input
                                            value={participant.name}
                                            onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                                            placeholder="Nome completo"
                                        />
                                    </div>
                                    <div>
                                        <Label>Função</Label>
                                        <Input
                                            value={participant.role}
                                            onChange={(e) => updateParticipant(index, 'role', e.target.value)}
                                            placeholder="Função/Cargo"
                                        />
                                    </div>
                                    <div>
                                        <Label>RG</Label>
                                        <Input
                                            value={participant.rg}
                                            onChange={(e) => updateParticipant(index, 'rg', e.target.value)}
                                            placeholder="00.000.000-0"
                                        />
                                    </div>
                                    <div>
                                        <Label>CPF</Label>
                                        <Input
                                            value={participant.cpf}
                                            onChange={(e) => updateParticipant(index, 'cpf', e.target.value)}
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button onClick={addParticipant} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar Participante
                        </Button>
                    </div>
                </PageCard>

                {/* Palavras-chave */}
                <PageCard title="Palavras-chave">
                    <div className="space-y-2">
                        {editData.keywords.map((keyword, index) => (
                            <div key={index} className="flex space-x-2">
                                <Input
                                    value={keyword}
                                    onChange={(e) => updateKeyword(index, e.target.value)}
                                    placeholder="Palavra-chave"
                                />
                                <Button
                                    onClick={() => removeKeyword(index)}
                                    variant="outline"
                                    size="sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addKeyword} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-1" />
                            Adicionar Palavra-chave
                        </Button>
                    </div>
                </PageCard>
            </div>
        );
    }

    // Modo de visualização
    return (
        <div className="space-y-6">
            {/* Header com botão de editar */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Análise IA</h3>
                {!disabled && (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                    </Button>
                )}
            </div>

            {/* Resumo */}
            {llmData.summary && (
                <PageCard title="Resumo da Reunião" className="bg-white">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {llmData.summary}
                    </p>
                </PageCard>
            )}

            {/* Agenda */}
            {llmData.agenda && (
                <PageCard title="Agenda" className="bg-white">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                        {llmData.agenda}
                    </p>
                </PageCard>
            )}

            {/* Assuntos Tratados */}
            {llmData.subjects && llmData.subjects.length > 0 && (
                <PageCard title="Assuntos Tratados" className="bg-white">
                    <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                        {llmData.subjects.map((subject, index) => (
                            <li
                                key={index}
                                className="text-sm sm:text-base text-gray-700 leading-relaxed"
                            >
                                {subject}
                            </li>
                        ))}
                    </ul>
                </PageCard>
            )}

            {/* Deliberações */}
            {llmData.deliberations && llmData.deliberations.length > 0 && (
                <PageCard title="Deliberações" className="bg-white">
                    <ul className="list-disc list-inside space-y-1 sm:space-y-2">
                        {llmData.deliberations.map((deliberation, index) => (
                            <li
                                key={index}
                                className="text-sm sm:text-base text-gray-700 leading-relaxed"
                            >
                                {deliberation}
                            </li>
                        ))}
                    </ul>
                </PageCard>
            )}

            {/* Participantes */}
            {llmData.participants && llmData.participants.length > 0 && (
                <PageCard title="Participantes" className="bg-white">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>RG</TableHead>
                                    <TableHead>CPF</TableHead>
                                    <TableHead>Função</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {llmData.participants.map((participant, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="text-sm text-gray-900">
                                            {participant.name}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {participant.rg}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-500">
                                            {participant.cpf}
                                        </TableCell>
                                        <TableCell className="text-sm text-gray-700">
                                            {participant.role}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </PageCard>
            )}

            {/* Palavras-chave */}
            {llmData.keywords && llmData.keywords.length > 0 && (
                <PageCard title="Palavras-chave" className="bg-white">
                    <div className="flex flex-wrap gap-2">
                        {llmData.keywords.map((keyword, index) => (
                            <Badge key={index} variant="secondary">
                                {keyword}
                            </Badge>
                        ))}
                    </div>
                </PageCard>
            )}
        </div>
    );
} 