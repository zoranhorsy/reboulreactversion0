import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-black text-white py-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Reboul Store</h3>
                        <p>Votre destination pour les vêtements premium à Marseille</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Liens rapides</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:underline hover:text-gray-300">Accueil</Link></li>
                            <li><Link href="/catalogue" className="hover:underline hover:text-gray-300">Catalogue</Link></li>
                            <li><Link href="/about" className="hover:underline hover:text-gray-300">À propos</Link></li>
                            <li><Link href="/contact" className="hover:underline hover:text-gray-300">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact</h3>
                        <p>123 Rue de la Mode</p>
                        <p>13001 Marseille, France</p>
                        <p>Tél : 04 91 00 00 00</p>
                        <p>Email : info@reboulstore.com</p>
                    </div>
                </div>
                <div className="mt-8 text-center">
                    <p>&copy; 2023 Reboul Store. Tous droits réservés.</p>
                </div>
            </div>
        </footer>
    )
}

