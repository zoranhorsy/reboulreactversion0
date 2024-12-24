'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {Home, ShoppingBag, User, X, Info, ShoppingCart, LogIn, Folders} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { CartSheet } from '@/components/cart/CartSheet'
import { useCart } from '@/app/contexts/CartContext'

export function Dock() {
    const [isOpen, setIsOpen] = useState(false)
    const [isInverted, setIsInverted] = useState(false)
    const [showBadge, setShowBadge] = useState(false)
    const { items } = useCart()

    const itemCount = items.reduce((total, item) => total + item.quantity, 0)

    useEffect(() => {
        if (itemCount > 0) {
            setShowBadge(true)
        }
    }, [itemCount])

    const toggleMenu = () => {
        setIsOpen(!isOpen)
        setIsInverted(!isInverted)
    }

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (isOpen && !(event.target as Element).closest('#ios-menu')) {
                setIsOpen(false)
                setIsInverted(false)
            }
        }

        document.addEventListener('click', handleOutsideClick)

        return () => {
            document.removeEventListener('click', handleOutsideClick)
        }
    }, [isOpen])

    const menuItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/catalogue", icon: ShoppingBag, label: "Nos Produits" },
        { href: "/adulte", icon: Folders, label: "Adulte" },
        { href: "/minots", icon: Folders, label: "Minots" },
        { href: "/sneakers", icon: Folders, label: "Sneakers" },
        { href: "/about", icon: Info, label: "À propos" },
        { href: "/profil", icon: User, label: "Profil" },
        { href: "/connexion", icon: LogIn, label: "Connexion" },
        { href: "/admin", icon: LogIn, label: "Administration" },
    ]

    return (
        <>
            <motion.div
                className="fixed left-4 top-4 z-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >

                <motion.button
                    onClick={toggleMenu}
                    className="rounded-full transition-all duration-300"
                    aria-label="Ouvrir le menu"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Image
                        src={isInverted ? "/images/logo_white.png" : "/images/logo_black.png"}
                        alt="Reboul Logo"
                        width={48}
                        height={48}
                        className="transition-transform duration-300"
                    />
                    <AnimatePresence>
                        {showBadge && itemCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                            >
                                {itemCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </motion.button>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        id="ios-menu"
                        className={`fixed left-2 top-3 w-64 rounded-2xl h-fit ${
                            isInverted ? 'bg-neutral-900 text-white' : 'bg-white text-gray-800'
                        } z-40`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="container mx-auto px-4 py-8">
                            <motion.button
                                onClick={() => {
                                    setIsOpen(false)
                                    setIsInverted(false)
                                }}
                                className={`absolute top-4 right-4 p-2 rounded-lg ${
                                    isInverted ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                                } transition-colors duration-300`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Fermer le menu"
                            >
                                <X className={`h-6 w-6 ${isInverted ? 'text-white' : 'text-gray-800'}`} />
                            </motion.button>
                            <nav className="mt-16">
                                <ul className="space-y-4">
                                    {menuItems.map((item) => (
                                        <motion.li
                                            key={item.label}
                                            whileHover={{ x: 10 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Link href={item.href} className={`flex items-center space-x-4 text-lg ${
                                                isInverted ? 'text-white hover:text-gray-300' : 'text-gray-800 hover:text-primary'
                                            } transition-all duration-300 group`}>
                                                <motion.div
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`p-2 rounded-lg transition-colors duration-300 ${
                                                        isInverted
                                                            ? 'bg-neutral-50 group-hover:bg-neutral-300 text-black'
                                                            : 'bg-gray-100 group-hover:bg-gray-200 text-gray-800'
                                                    }`}
                                                >
                                                    <item.icon className="h-5 w-5" />
                                                </motion.div>
                                                <span className="font-normal">{item.label}</span>
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>

                                <div className="mt-6 pt-6 border-t border-gray-700">
                                    <CartSheet>
                                        <button
                                            className="w-full flex items-center justify-center space-x-2 text-lg bg-white text-black p-2 rounded-lg hover:bg-gray-100 transition-all duration-300 relative"
                                        >
                                            <ShoppingCart className="h-6 w-6" />
                                            <span className="font-light">Mon Panier</span>
                                            <AnimatePresence>
                                                {showBadge && itemCount > 0 && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                                    >
                                                        {itemCount}
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    </CartSheet>
                                </div>
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

