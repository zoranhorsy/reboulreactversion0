import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app"

export async function GET(request: NextRequest) {
    try {
        // Récupérer le token d'authentification
        const authHeader = request.headers.get('authorization')
        console.log('API Route - Auth Header:', authHeader ? 'Present' : 'Missing')
        
        // Construire l'URL du backend
        const backendUrl = `${BACKEND_URL}/api/admin/dashboard/stats`
        console.log('API Route - Backend URL:', backendUrl)

        // Faire la requête au backend
        console.log('API Route - Sending request to backend...')
        const response = await fetch(backendUrl, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        console.log('API Route - Backend response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error('API Route - Backend error:', {
                status: response.status,
                statusText: response.statusText,
                data: errorData
            })
            throw new Error(errorData.error || `Backend responded with status: ${response.status}`)
        }

        const data = await response.json()
        console.log('API Route - Backend data received:', data)

        return NextResponse.json(data)
    } catch (error) {
        console.error("API Route - Error:", error)
        return NextResponse.json(
            { 
                error: "Internal Server Error", 
                details: error instanceof Error ? error.message : "Unknown error" 
            },
            { status: 500 }
        )
    }
} 