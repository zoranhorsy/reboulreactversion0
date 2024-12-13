import { NextResponse } from 'next/server'

const tags = ["coton", "bio", "premium", "casual", "sport"]

export async function GET() {
    return NextResponse.json(tags)
}

