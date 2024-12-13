import ClientOnly from '@/components/ClientOnly'
import { AdminContent } from '@/components/admin/AdminContent'

export default function AdminPage() {
    return (
        <ClientOnly>
            <AdminContent />
        </ClientOnly>
    )
}

