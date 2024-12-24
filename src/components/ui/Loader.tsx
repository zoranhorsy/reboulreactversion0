'use client'

import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

export function Loader() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const timer = setTimeout(() => {
            if (containerRef.current) {
                containerRef.current.style.opacity = '0'
                containerRef.current.style.pointerEvents = 'none'
            }
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    const floatAnimation = {
        y: [0, -10, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }

    return (
        <motion.div
            ref={containerRef}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="relative w-64 h-64"
                animate={floatAnimation}
            >
                <Image
                    src="/images/logo_black.png"
                    alt="Reboul Logo"
                    layout="fill"
                    objectFit="contain"
                />
            </motion.div>
            <motion.div
                className="text-xl font-bold text-black mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: "easeOut" }}
            >
                Chargement...
            </motion.div>
        </motion.div>
    )
}

