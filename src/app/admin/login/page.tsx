import { LoginForm } from '@/components/admin/LoginForm'

export default function AdminLoginPage() {
    return (
        <div className="container mx-auto px-4 py-14">
            <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
            <LoginForm/>
        </div>
    )
}