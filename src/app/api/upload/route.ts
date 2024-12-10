import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

// Ensure the uploads directory exists
async function ensureUploadsDirectoryExists() {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    try {
        await mkdir(uploadDir, { recursive: true })
        console.log('Uploads directory created successfully')
    } catch (error) {
        if ((error as any).code !== 'EEXIST') { // Ignore if directory already exists
            console.error('Error creating uploads directory:', error)
            throw error // Re-throw the error if it's not about the directory already existing
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        await ensureUploadsDirectoryExists()

        const formData = await request.formData()
        const images = formData.getAll('images') as File[]

        if (!images || images.length === 0) {
            return NextResponse.json({ success: false, message: 'No image files uploaded' }, { status: 400 })
        }

        const uploadedUrls = []

        for (const imageFile of images) {
            if (!(imageFile instanceof File)) {
                return NextResponse.json({ success: false, message: 'Invalid file uploaded' }, { status: 400 })
            }

            const bytes = await imageFile.arrayBuffer()
            const buffer = Buffer.from(bytes)

            const optimizedBuffer = await sharp(buffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer()

            const filename = `${uuidv4()}.webp`
            const uploadDir = path.join(process.cwd(), 'public', 'uploads')
            const filePath = path.join(uploadDir, filename)

            await writeFile(filePath, optimizedBuffer)

            const imageUrl = `/uploads/${filename}`
            uploadedUrls.push(imageUrl)
        }

        return NextResponse.json({ success: true, urls: uploadedUrls })
    } catch (error) {
        console.error('Error processing image:', error)
        return NextResponse.json({ success: false, message: 'Error processing image', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
    }
}

