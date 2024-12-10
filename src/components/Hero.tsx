'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"

export function Hero() {
    return (
        <section className="text-center py-20 bg-white">
            <div className="container mx-auto px-4">
                <h1 className="animate-on-scroll text-4xl sm:text-5xl font-bold mb-4 sm:mb-6 text-black">Bienvenue chez Reboul Store</h1>
                <p className="animate-on-scroll text-lg sm:text-xl mb-6 sm:mb-8 text-gray-700 max-w-3xl mx-auto">
                    Votre destination pour les vêtements premium à Marseille. Découvrez notre collection exclusive de marques de luxe.
                </p>
                <Link href="/catalogue">
                    <Button className="animate-on-scroll bg-black text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-md hover:bg-gray-800 transition-colors">
                        Découvrir notre collection
                    </Button>
                </Link>
            </div>
        </section>
    )
}

