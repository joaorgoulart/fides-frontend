"use client";

import { ReactNode } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

interface PageHeaderProps {
    title: string;
    subtitle?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    actions?: ReactNode;
    icon?: ReactNode;
    className?: string;
}

interface PageContentProps {
    children: ReactNode;
    className?: string;
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | "7xl";
}

interface PageTitleProps {
    title: string;
    subtitle?: string;
    className?: string;
}

interface PageSectionProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

interface PageCardProps {
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    headerActions?: ReactNode;
}

// Container principal da página
export function PageContainer({ children, className = "" }: PageContainerProps) {
    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            {children}
        </div>
    );
}

// Header da página com título, botão voltar, ações
export function PageHeader({
    title,
    subtitle,
    showBackButton = false,
    onBack,
    actions,
    icon,
    className = "",
}: PageHeaderProps) {
    return (
        <header className={`bg-white shadow-sm border-b ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        {showBackButton && onBack && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onBack}
                                className="mr-4 p-2"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}
                        
                        {icon || <FileText className="h-8 w-8 text-blue-600" />}
                        
                        <div className="ml-3">
                            <h1 className="text-xl font-semibold text-gray-900">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="text-sm text-gray-600">{subtitle}</p>
                            )}
                        </div>
                    </div>

                    {actions && (
                        <div className="flex items-center space-x-4">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

// Conteúdo principal da página
export function PageContent({
    children,
    className = "",
    maxWidth = "7xl",
}: PageContentProps) {
    const maxWidthClasses = {
        sm: "max-w-sm",
        md: "max-w-md",
        lg: "max-w-lg",
        xl: "max-w-xl",
        "2xl": "max-w-2xl",
        full: "max-w-full",
        "7xl": "max-w-7xl",
    };

    return (
        <main className={`${maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
            {children}
        </main>
    );
}

// Título da página (para uso dentro do conteúdo)
export function PageTitle({ title, subtitle, className = "" }: PageTitleProps) {
    return (
        <div className={`mb-8 ${className}`}>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            {subtitle && (
                <p className="mt-2 text-gray-600">{subtitle}</p>
            )}
        </div>
    );
}

// Seção da página (wrapper genérico)
export function PageSection({
    title,
    description,
    children,
    className = "",
}: PageSectionProps) {
    return (
        <section className={`mb-8 ${className}`}>
            {(title || description) && (
                <div className="mb-6">
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-gray-600">{description}</p>
                    )}
                </div>
            )}
            {children}
        </section>
    );
}

// Card da página (wrapper para Card do shadcn)
export function PageCard({
    title,
    description,
    children,
    className = "",
    headerActions,
}: PageCardProps) {
    return (
        <Card className={className}>
            {(title || description || headerActions) && (
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            {title && <CardTitle>{title}</CardTitle>}
                            {description && <CardDescription>{description}</CardDescription>}
                        </div>
                        {headerActions && (
                            <div className="flex items-center space-x-2">
                                {headerActions}
                            </div>
                        )}
                    </div>
                </CardHeader>
            )}
            <CardContent>{children}</CardContent>
        </Card>
    );
}

// Layout de duas colunas
export function PageTwoColumns({
    left,
    right,
    className = "",
    leftClassName = "",
    rightClassName = "",
}: {
    left: ReactNode;
    right: ReactNode;
    className?: string;
    leftClassName?: string;
    rightClassName?: string;
}) {
    return (
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${className}`}>
            <div className={`lg:col-span-2 ${leftClassName}`}>{left}</div>
            <div className={`space-y-6 ${rightClassName}`}>{right}</div>
        </div>
    );
}

// Layout de grid responsivo
export function PageGrid({
    children,
    cols = { sm: 1, md: 2, lg: 3, xl: 4 },
    gap = 6,
    className = "",
}: {
    children: ReactNode;
    cols?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: number;
    className?: string;
}) {
    const gridClasses = [
        `grid`,
        `grid-cols-${cols.sm || 1}`,
        cols.md && `md:grid-cols-${cols.md}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        cols.xl && `xl:grid-cols-${cols.xl}`,
        `gap-${gap}`,
    ]
        .filter(Boolean)
        .join(" ");

    return <div className={`${gridClasses} ${className}`}>{children}</div>;
}

// Wrapper para formulários
export function PageForm({
    children,
    title,
    description,
    onSubmit,
    className = "",
}: {
    children: ReactNode;
    title?: string;
    description?: string;
    onSubmit?: (e: React.FormEvent) => void;
    className?: string;
}) {
    return (
        <PageCard title={title} description={description} className={className}>
            <form onSubmit={onSubmit} className="space-y-6">
                {children}
            </form>
        </PageCard>
    );
}

// Wrapper para loading states
export function PageLoading({ message = "Carregando..." }: { message?: string }) {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
}

// Wrapper para estados vazios
export function PageEmpty({
    title = "Nenhum item encontrado",
    description,
    action,
    icon,
}: {
    title?: string;
    description?: string;
    action?: ReactNode;
    icon?: ReactNode;
}) {
    return (
        <div className="text-center py-12">
            {icon && <div className="mb-4">{icon}</div>}
            <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
            {description && <p className="text-gray-600 mb-6">{description}</p>}
            {action}
        </div>
    );
} 