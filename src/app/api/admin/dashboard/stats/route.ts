import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app"

export async function GET(request: NextRequest) {
    try {
        // Récupérer le token d'authentification
        const authHeader = request.headers.get('authorization')
        
        // Construire l'URL du backend
        const backendUrl = `${BACKEND_URL}/api/admin/dashboard/stats`

        // Faire la requête au backend
        const response = await fetch(backendUrl, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`Backend responded with status: ${response.status}`)
        }

        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error("Error fetching stats from backend:", error)
        return NextResponse.json(
            { 
                error: "Internal Server Error", 
                details: error instanceof Error ? error.message : "Unknown error" 
            },
            { status: 500 }
        )
    }
} 