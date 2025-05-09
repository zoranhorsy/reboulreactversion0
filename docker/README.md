# Configuration Docker

Ce dossier contient les fichiers de configuration Docker pour l'application Reboul.

## Fichiers de configuration

- `Dockerfile` : Configuration principale du conteneur
- `docker-compose.yml` : Configuration des services
- `.dockerignore` : Fichiers à ignorer dans le build

## Structure des services

### Frontend (Next.js)
- Build optimisé pour la production
- Configuration Nginx
- Gestion des assets statiques

### Backend (Node.js)
- API REST
- Base de données PostgreSQL
- Cache Redis

## Utilisation

### Développement
```bash
# Démarrer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down
```

### Production
```bash
# Build des images
docker-compose -f docker-compose.prod.yml build

# Déployer
docker-compose -f docker-compose.prod.yml up -d
```

## Bonnes pratiques

- Maintenir les images à jour
- Optimiser la taille des images
- Utiliser le multi-stage build
- Sécuriser les configurations
- Documenter les changements importants

## Variables d'environnement

Les variables d'environnement sont gérées via :
- `.env` pour le développement
- `.env.production` pour la production
- Variables d'environnement Docker pour le déploiement 