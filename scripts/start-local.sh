#!/bin/bash

echo "🚀 Démarrage de l'environnement local Reboul..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Démarrer les services
echo "🐳 Démarrage des conteneurs Docker..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente que les services soient prêts..."
sleep 10

# Vérifier que la base de données est accessible
echo "🔍 Vérification de la base de données..."
while ! docker-compose exec -T db pg_isready -U user -d reboul_db; do
    echo "  Attente de PostgreSQL..."
    sleep 2
done

echo "✅ Environnement local prêt !"
echo ""
echo "🌐 URLs disponibles :"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:5001"
echo "  - Base de données: localhost:5432"
echo "  - NocoDb: http://localhost:8080"
echo ""
echo "📋 Commandes utiles :"
echo "  - Voir les logs: docker-compose logs -f"
echo "  - Arrêter: docker-compose down"
echo "  - Redémarrer: docker-compose restart"
