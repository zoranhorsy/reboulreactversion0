import { NextResponse } from 'next/server'

const brands = ["Stone Island", "CP Company", "Reboul"]

export async function GET() {
    return NextResponse.json(brands)
}

