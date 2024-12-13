'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CartSheet } from '@/components/cart/CartSheet'

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const router = useRouter()

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/recherche?q=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                        <Image src="/images/logo_black.png" alt="Reboul Logo" width={40} height={40} />
                        <span className="text-xl font-bold">Reboul</span>
                    </Link>
                    <div className="hidden md:flex items-center space-x-4">
                        <nav>
                            <ul className="flex space-x-4">
                                <li><Link href="/catalogue" className="hover:text-gray-600">Catalogue</Link></li>
                                <li><Link href="/about" className="hover:text-gray-600">À propos</Link></li>
                            </ul>
                        </nav>
                        <form onSubmit={handleSearch} className="relative">
                            <Input
                                type="search"
                                placeholder="Rechercher..."
                                className="pl-8 pr-4"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="h-5 w-5 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </form>
                        <CartSheet />
                        <Link href="/profil">
                            <Button variant="ghost" size="icon">
                                <User className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                    <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <div className="md:hidden">
                    <nav className="px-4 pt-2 pb-4 space-y-2">
                        <Link href="/catalogue" className="block hover:text-gray-600">Catalogue</Link>
                        <Link href="/about" className="block hover:text-gray-600">À propos</Link>
                        <Link href="/profil" className="block hover:text-gray-600">Profil</Link>
                    </nav>
                    <form onSubmit={handleSearch} className="px-4 pb-4">
                        <Input
                            type="search"
                            placeholder="Rechercher..."
                            className="w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>
            )}
        </header>
    )
}

