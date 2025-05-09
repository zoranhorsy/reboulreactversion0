# Stack Technique de Reboul E-commerce

## Frontend
- **Framework**: Next.js 14 avec App Router
- **Rendering**: Mélange de Server Components et Client Components
- **Language**: TypeScript
- **UI/Composants**: 
  - Composants personnalisés
  - Radix UI pour les composants accessibles
  - Shadcn/UI comme base de composants
- **Styling**: 
  - Tailwind CSS
  - CSS Modules pour les styles spécifiques
- **Animations**: 
  - Framer Motion
  - GSAP pour les animations complexes
- **Requêtes API**: 
  - React Query (TanStack Query)
  - SWR pour certains fetching de données
  - Axios pour les requêtes HTTP
- **Formulaires**: 
  - React Hook Form
  - Zod pour la validation
- **État Global**: 
  - React Context API
  - localStorage pour la persistance

## Backend
- **Framework**: Next.js API Routes
- **Base de données**: PostgreSQL hébergée sur Railway
- **Authentication**: JWT avec stockage sécurisé
- **Email**: Nodemailer
- **Paiement**: Stripe API
- **Upload d'images**: Cloudinary

## Infrastructure
- **Hébergement Frontend**: Vercel
- **CDN**: Vercel Edge Network
- **Hébergement Backend & Base de données**: Railway
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics et Railway Dashboard

## Dev Tools
- **Package Manager**: npm
- **Build Tool**: Next.js build system
- **Linting & Formatting**: 
  - ESLint avec règles personnalisées
  - Prettier
- **Testing**: 
  - Jest
  - React Testing Library
  - Cypress pour les tests E2E
- **Version Control**: Git avec GitHub
- **Environnement de développement**: 
  - VS Code
  - Cursor

## Performance
- **Image Optimization**: 
  - Next Image
  - Cloudinary pour les transformations
- **Code Splitting**: Automatique via Next.js
- **Lazy Loading**: React.lazy et Suspense
- **Compression**: Gzip/Brotli via Vercel

## Sécurité
- **Authentication**: JWT avec cryptage
- **HTTPS**: Obligatoire
- **CORS**: Configuration restrictive
- **XSS Protection**: Échappement automatique
- **Input Validation**: Zod
- **Dépendances**: Analyse automatique des vulnérabilités 