import Image from 'next/image'
import styles from './Footer.module.css'

export default function Footer() {
    return (
        <footer className="bg-background border-t border-border">
            <div className="container mx-auto px-4 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-16 lg:gap-32">
                    {/* Logo Column */}
                    <div className="flex flex-col justify-between h-full">
                        <Image
                            src="/logo_w.png"
                            alt="Reboul"
                            width={300}
                            height={300}
                            className="w-48 h-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
                            priority
                        />
                        <p className="text-xs tracking-wider mt-auto text-muted-foreground/60">&copy; 2025 Reboul. Tous droits réservés</p>
                    </div>

                    {/* Concept Store Column */}
                    <div>
                        <h2 className={`text-xl tracking-[0.3em] mb-16 font-light text-primary/90 ${styles.title}`}>
                            CONCEPT STORE
                        </h2>
                        <div className="space-y-12 text-sm leading-loose max-w-2xl text-muted-foreground/80">
                            <p className="tracking-wide">
                                REBOUL REDÉFINIT LE SHOPPING EN OFFRANT UNE EXPÉRIENCE UNIQUE ET UNE SÉLECTION
                                DIVERSIFIÉE DE PRODUITS, MÊLANT LES PRINCIPAUX STYLES DE LA MODE
                                CONTEMPORAINE.
                            </p>
                            <p className="tracking-wide">
                                UN HÔTEL DANS LE THÈME DE NOS MARQUES, UN CAFÉ, UNE
                                TERRASSE INTÉRIEURE ET UN SERVICE DE RETOUCHE
                                SUR MESURE POUR UN ACCOMPAGNEMENT EXCLUSIF.
                            </p>
                        </div>
                    </div>

                    {/* Addresses Column */}
                    <div>
                        <h2 className={`text-xl tracking-[0.3em] mb-16 font-light text-primary/90 ${styles.title}`}>
                            ADRESSES
                        </h2>
                        <div className="space-y-12 text-sm tracking-wide text-muted-foreground/80">
                            <div>
                                <p className="font-medium mb-2 text-foreground/90">REBOUL</p>
                                <p>MARSEILLE - 523 RUE PARADIS</p>
                            </div>
                            <div>
                                <p className="font-medium mb-2 text-foreground/90">REBOUL STORE</p>
                                <p>CASSIS - 7 AVENUE VICTOR HUGO</p>
                            </div>
                            <div>
                                <p className="font-medium mb-2 text-foreground/90">REBOUL UTILITY</p>
                                <p>SANARY - 16 RUE GAILLARD</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
