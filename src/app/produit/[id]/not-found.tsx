import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
            <p className="text-xl mb-8">We&apos;re sorry, but the product you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild>
                <Link href="/catalogue">
                    Return to Catalogue
                </Link>
            </Button>
        </div>
    )
}

