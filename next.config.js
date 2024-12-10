/** @type {import('next').NextConfig} */
const nextConfig = {
    // Désactiver le linting lors du build
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Désactiver la vérification des types lors du build
    typescript: {
        ignoreBuildErrors: true,
    },
    reactStrictMode: true,
    images: {
        domains: ['placeholder.com'], // Add any domains you're loading images from
    },
    webpack(config) {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"]
        });
        return config;
    }
}


module.exports = nextConfig

