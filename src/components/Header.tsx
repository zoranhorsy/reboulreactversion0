'use client'

import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ShoppingCart, User, LogIn, LogOut } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext'

export default function Header() {
    const { user, logout } = useAuth()

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-gray-800">
                    Reboul Store
                </Link>
                <div className="flex-1 max-w-xl mx-4">
                    <Input type="search" placeholder="Rechercher des produits..." className="w-full" />
                </div>
                <nav className="flex items-center space-x-4">
                    <Link href="/cart">
                    </Link>
                    {user ? (
                        <>
                            <Link href="/profile" className="text-gray-600 hover:text-gray-800">
                                <User size={24} />
                            </Link>
                            <Button variant="ghost" onClick={logout}>
                                <LogOut size={24} />
                            </Button>
                        </>
                    ) : (
                        <Link href="/login" className="text-gray-600 hover:text-gray-800">
                            <LogIn size={24} />
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}

