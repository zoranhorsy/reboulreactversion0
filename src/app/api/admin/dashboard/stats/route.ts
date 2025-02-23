import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://reboul-store-api-production.up.railway.app"

export async function GET(request: NextRequest) {
    try {
        // Récupérer le token d'authentification
        const authHeader = request.headers.get('authorization')
        console.log('API Route - Auth Header:', authHeader)
        console.log('API Route - All Headers:', Object.fromEntries(request.headers.entries()))
        
        if (!authHeader) {
            console.error('API Route - No authorization header found')
            return NextResponse.json(
                { error: "No authorization header" },
                { status: 401 }
            )
        }

        // Construire l'URL du backend
        const backendUrl = `${BACKEND_URL}/api/admin/dashboard/stats`
        console.log('API Route - Backend URL:', backendUrl)

        // Faire la requête au backend
        console.log('API Route - Sending request to backend with headers:', {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })

        const response = await fetch(backendUrl, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        console.log('API Route - Backend response:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
        })

        const responseText = await response.text()
        console.log('API Route - Raw response:', responseText)

        if (!response.ok) {
            console.error('API Route - Backend error response:', responseText)
            return NextResponse.json(
                { error: "Backend error", details: responseText },
                { status: response.status }
            )
        }

        const data = JSON.parse(responseText)
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