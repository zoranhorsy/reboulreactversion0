'use client'

import { AdminNav } from './AdminNav'
import { UserNav } from './UserNav'

interface AdminLayoutProps {
    children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <aside className="hidden lg:flex h-screen w-64 flex-col fixed inset-y-0">
                <div className="flex flex-col flex-grow gap-y-6 overflow-y-auto border-r px-6 py-8">
                    <div className="flex h-12 items-center">
                        <h2 className="text-lg font-semibold">Administration</h2>
                    </div>
                    <AdminNav />
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 lg:pl-64">
                <div className="flex h-16 items-center gap-x-4 border-b px-4 lg:px-8">
                    <div className="flex flex-1 items-center justify-end gap-x-4">
                        <UserNav />
                    </div>
                </div>

                <div className="px-4 py-8 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    )
} 