'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Home, ShoppingBag, Info, Mail, User } from 'lucide-react'

interface DockItemProps {
    icon: React.ReactNode
    label: string
    href: string
    mouseX: MotionValue
}

const DockItem = ({ icon, label, href, mouseX }: DockItemProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    const distance = useMotionValue(0)
    const widthSync = useTransform(distance, [-150, 0, 150], [40, 60, 40])
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 })

    useEffect(() => {
        const updateDistance = () => {
            const el = ref.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            const distanceFromCenter = mouseX.get() - (rect.left + rect.width / 2)
            distance.set(distanceFromCenter)
        }

        const unsubscribeX = mouseX.on("change", updateDistance)
        return () => {
            unsubscribeX()
        }
    }, [mouseX, distance])

    return (
        <motion.div ref={ref} style={{ width }} className="aspect-square">
            <Link href={href} className="relative group flex items-center justify-center h-full">
                <motion.div
                    className="relative flex items-center justify-center w-full h-full rounded-2xl bg-neutral-800 text-white"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                >
                    {icon}
                </motion.div>
                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: -40 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute left-1/2 -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap"
                        >
                            {label}
                        </motion.span>
                    )}
                </AnimatePresence>
            </Link>
        </motion.div>
    )
}

export function Dock() {
    const [mouseX, setMouseX] = useState(0)
    const ref = useRef<HTMLDivElement>(null)

    const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        const rect = ref.current?.getBoundingClientRect()
        if (rect) {
            setMouseX(event.clientX - rect.left)
        }
    }

    const handleMouseLeave = () => {
        setMouseX(0)
    }

    const items = [
        { icon: <Home className="w-6 h-6" />, label: 'Accueil', href: '/' },
        { icon: <ShoppingBag className="w-6 h-6" />, label: 'Catalogue', href: '/catalogue' },
        { icon: <Info className="w-6 h-6" />, label: 'À propos', href: '/about' },
        { icon: <Mail className="w-6 h-6" />, label: 'Contact', href: '/contact' },
        { icon: <User className="w-6 h-6" />, label: 'Compte', href: '/connexion' },
    ]

    const mouseXMotion = useMotionValue(0)

    useEffect(() => {
        mouseXMotion.set(mouseX)
    }, [mouseX, mouseXMotion])

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="fixed bottom-8 left-0 right-0 mx-auto w-fit flex items-center gap-1 p-2 bg-neutral-800 backdrop-blur-md rounded-full shadow-lg border border-gray-700"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
            {items.map((item, index) => (
                <DockItem key={index} {...item} mouseX={mouseXMotion} />
            ))}
        </motion.div>
    )
}

