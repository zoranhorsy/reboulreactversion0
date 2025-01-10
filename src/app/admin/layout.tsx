import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Administration - Reboul Store',
    description: 'Panneau d\'administration Reboul Store',
}

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode
}) {
    return (
        <div className="admin-layout">
            <header className="admin-header">
                <h1>Panneau administration Reboul Store</h1>
            </header>
            <main className="admin-main">
                {children}
            </main>
            <footer className="admin-footer">
                <p>&copy; 2023 Reboul Store. Tous droits réservés.</p>
            </footer>
        </div>
    )
}

