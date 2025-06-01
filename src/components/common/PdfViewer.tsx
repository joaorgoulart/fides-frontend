"use client";

import { useState } from "react";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfViewerProps {
    fileUrl?: string;
    height?: string;
}

export default function PdfViewer({ fileUrl, height = "400px" }: PdfViewerProps) {
    const [iframeError, setIframeError] = useState(false);

    if (!fileUrl) {
        return (
            <div 
                className="w-full bg-muted rounded-lg flex items-center justify-center"
                style={{ height }}
            >
                <div className="text-center">
                    <div className="text-muted-foreground">
                        <FileText className="w-16 h-16 mx-auto mb-4" />
                    </div>
                    <p className="text-muted-foreground">Nenhum PDF disponível</p>
                </div>
            </div>
        );
    }

    // Se iframe falhou ou não é suportado, mostrar alternativas
    if (iframeError) {
        return (
            <div 
                className="w-full bg-muted rounded-lg flex items-center justify-center p-8"
                style={{ height }}
            >
                <div className="text-center space-y-4">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground" />
                    <div>
                        <h3 className="text-lg font-medium text-foreground mb-2">
                            Visualização não disponível
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            O PDF não pode ser exibido diretamente no navegador.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button asChild variant="default">
                            <a 
                                href={fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Abrir em nova aba
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a 
                                href={fileUrl} 
                                download
                                className="inline-flex items-center"
                            >
                                <FileText className="w-4 h-4 mr-2" />
                                Download PDF
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Versão com iframe e tratamento de erro
    return (
        <div className="w-full border rounded-lg overflow-hidden" style={{ height }}>
            <iframe
                src={fileUrl}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Visualizador de PDF"
                onError={() => setIframeError(true)}
                onLoad={(e) => {
                    // Verificar se iframe carregou corretamente
                    const iframe = e.target as HTMLIFrameElement;
                    try {
                        // Se não conseguir acessar contentDocument, pode ser erro de CORS
                        if (!iframe.contentDocument && !iframe.contentWindow) {
                            setIframeError(true);
                        }
                    } catch (error) {
                        // Erro de CORS ou CSP
                        console.log("PDF iframe blocked by CORS/CSP, using fallback");
                        setIframeError(true);
                    }
                }}
            >
                <p>
                    Seu navegador não suporta a visualização de PDFs. 
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                        Clique aqui para abrir o arquivo.
                    </a>
                </p>
            </iframe>
        </div>
    );
} 