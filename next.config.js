import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
        domains: ['placeholder.com'], // Ajoutez ici les domaines pour les images externes si nécessaire
    },
    // Vous pouvez ajouter d'autres configurations ici selon vos besoins
}

export default nextConfig

