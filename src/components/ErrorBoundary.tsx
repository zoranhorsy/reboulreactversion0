'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(_: Error): State {
        // Mettre à jour l'état pour que le prochain rendu affiche l'UI de repli
        return { hasError: true }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Vous pouvez également enregistrer l'erreur dans un service de rapport d'erreurs
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            // Vous pouvez rendre n'importe quelle UI de repli
            return this.props.fallback
        }

        return this.props.children
    }
}

