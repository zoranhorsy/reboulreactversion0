import { LoginForm } from '@/components/admin/LoginForm'
import { Logo } from '@/components/Logo'

export default function AdminLoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="flex justify-center">
                    <Logo className="w-48" />
                </div>
                <LoginForm />
            </div>
        </div>
    )
}

