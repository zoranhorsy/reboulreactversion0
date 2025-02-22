import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001/api"

export async function GET(request: NextRequest) {
  try {
    // Utiliser searchParams directement de la requête
    const searchParams = request.nextUrl.searchParams

    // Construire l'URL du backend
    const backendUrl = `${BACKEND_URL}/products?${searchParams.toString()}`

    const response = await fetch(backendUrl)

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching products from backend:", error)
    return NextResponse.json(
      { error: "Internal Server Error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

  