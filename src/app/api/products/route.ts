import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const API_URL = process.env.API_URL || "http://localhost:5001/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

      // Transmettre tous les paramètres de recherche au backend
      const backendUrl = `${API_URL}/products?${searchParams.toString()}`

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

  