import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id, size, color } = req.query

    if (req.method === 'GET') {
        try {
            // Ici, vous devriez implémenter la logique pour récupérer le stock réel du produit
            // Pour l'instant, nous allons simuler une vérification de stock
            const stock = Math.floor(Math.random() * 10) // Simule un stock aléatoire entre 0 et 9

            res.status(200).json({ stock })
        } catch (error) {
            console.error('Erreur lors de la récupération du stock:', error)
            res.status(500).json({ message: 'Erreur lors de la récupération du stock' })
        }
    } else {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}

