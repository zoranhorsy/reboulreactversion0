import Image from 'next/image'
import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className="bg-[#01020a] text-white py-16">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-16 lg:gap-24">
                    {/* Logo Column */}
                    <div className="flex flex-col justify-between h-full">
                        <Image
                            src="/logo_w.png"
                            alt="Reboul"
                            width={300}
                            height={300}
                            className="w-48 h-auto"
                            priority
                        />
                        <p className="text-sm mt-auto">&copy; 2025 Reboul. Tous droits réservés</p>
                    </div>

                    {/* Concept Store Column */}
                    <div>
                        <h2 className={`text-2xl tracking-[0.2em] mb-12 font-light ${styles.title}`}>
                            CONCEPT STORE
                        </h2>
                        <div className="space-y-8 text-sm leading-relaxed max-w-2xl">
                            <p className="tracking-wide">
                                REBOUL REDÉFINIT LE SHOPPING EN OFFRANT UNE EXPÉRIENCE UNIQUE ET UNE SÉLECTION
                                DIVERSIFIÉE DE PRODUITS, MÊLANT LES PRINCIPAUX STYLES DE LA MODE
                                CONTEMPORAINE, DE L&apos;ÉLÉGANT À L&apos;URBAIN EN PASSANT PAR LES VÊTEMENTS TECHNIQUES.
                            </p>
                            <p className="tracking-wide">
                                DÉCOUVREZ ÉGALEMENT UN HÔTEL DANS LE THÈME DE NOS MARQUES, UN CAFÉ OU UNE
                                TERRASSE INTÉRIEURE POUR UN MOMENT DE DÉTENTE, AINSI QU&apos;UN SERVICE DE RETOUCHE
                                SUR MESURE POUR UN ACCOMPAGNEMENT EXCLUSIF.
                            </p>
                        </div>
                    </div>

                    {/* Addresses Column */}
                    <div>
                        <h2 className={`text-2xl tracking-[0.2em] mb-12 font-light ${styles.title}`}>
                            ADRESSES
                        </h2>
                        <div className="space-y-8 text-sm tracking-wide">
                            <div>
                                <p className="font-medium mb-1">REBOUL</p>
                                <p>MARSEILLE - 523 RUE PARADIS</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">REBOUL STORE</p>
                                <p>CASSIS - 7 AVENUE VICTOR HUGO</p>
                            </div>
                            <div>
                                <p className="font-medium mb-1">REBOUL UTILITY</p>
                                <p>SANARY - 16 RUE GAILLARD</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
