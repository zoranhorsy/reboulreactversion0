'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, Menu, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Cart from './Cart'
import gsap from 'gsap'

export default function Header() {
    const headerRef = useRef<HTMLElement>(null)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        // Initial animation
        const ctx = gsap.context(() => {
            // Logo animation
            gsap.from('.header-logo', {
                opacity: 0,
                x: -20,
                duration: 1,
                ease: 'power3.out'
            })

            // Navigation items animation
            gsap.from('.nav-item', {
                opacity: 0,
                y: -20,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power3.out'
            })

            // Actions animation
            gsap.from('.header-actions', {
                opacity: 0,
                x: 20,
                duration: 1,
                ease: 'power3.out'
            })
        }, headerRef)

        // Scroll handler
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            ctx.revert()
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Animation for menu opening/closing
    useEffect(() => {
        if (isMenuOpen) {
            gsap.to('.mobile-menu', {
                opacity: 1,
                x: 0,
                duration: 0.3,
                ease: 'power2.out'
            })
        } else {
            gsap.to('.mobile-menu', {
                opacity: 0,
                x: '100%',
                duration: 0.3,
                ease: 'power2.in'
            })
        }
    }, [isMenuOpen])

    return (
        <header
            ref={headerRef}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white'
            }`}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center justify-between h-16 sm:h-20 gap-4">
                    {/* Logo */}
                    <Link href="/" className="header-logo flex items-center space-x-2 sm:space-x-3">
                        <Image
                            src="/images/logo_black.png"
                            alt="Reboul Store"
                            width={48}
                            height={48}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                        <Image
                            src="/images/reboul_text.png"
                            alt="Reboul"
                            width={92}
                            height={6}
                            className="h-3 sm:h-4 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex items-center space-x-6 xl:space-x-8">
                        <li className="nav-item">
                            <Link href="/" className="text-black hover:text-gray-600 font-medium">
                                Accueil
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/catalogue" className="text-black hover:text-gray-600 font-medium">
                                Catalogue
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/about" className="text-black hover:text-gray-600 font-medium">
                                À propos
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/contact" className="text-black hover:text-gray-600 font-medium">
                                Contact
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link href="/admin" className="text-black hover:text-gray-600 font-medium">
                                Admin
                            </Link>
                        </li>
                    </ul>

                    {/* Actions */}
                    <div className="header-actions flex items-center space-x-2 sm:space-x-4">
                        <Link href="/connexion">
                            <Button variant="outline" size="icon" className="border-black text-black hover:bg-gray-100 w-9 h-9 sm:w-10 sm:h-10">
                                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                        </Link>
                        <Cart />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden w-9 h-9 sm:w-10 sm:h-10"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
                        </Button>
                    </div>

                    {/* Mobile Navigation */}
                    <div className={`mobile-menu fixed inset-y-0 right-0 w-64 sm:w-80 bg-white shadow-xl transform translate-x-full 
            ${isMenuOpen ? 'block' : 'hidden'} lg:hidden`}>
                        <div className="p-6 space-y-4 sm:space-y-6">
                            <Link
                                href="/"
                                className="block text-lg font-medium text-black hover:text-gray-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Accueil
                            </Link>
                            <Link
                                href="/catalogue"
                                className="block text-lg font-medium text-black hover:text-gray-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Catalogue
                            </Link>
                            <Link
                                href="/about"
                                className="block text-lg font-medium text-black hover:text-gray-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                À propos
                            </Link>
                            <Link
                                href="/contact"
                                className="block text-lg font-medium text-black hover:text-gray-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Contact
                            </Link>
                        </div>
                    </div>
                </nav>
            </div>
        </header>
    )
}

