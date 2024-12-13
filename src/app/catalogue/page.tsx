import { Metadata } from 'next'
import { Suspense } from 'react'
import ClientOnly from '@/components/ClientOnly'
import { CatalogueContent } from '@/components/catalogue/CatalogueContent'
import { Loader } from '@/components/ui/Loader'
import {LocalStorageChecker} from "@/components/LocalStorageChecker";

export const generateMetadata = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }): Promise<Metadata> => {
    const category = searchParams.categories as string
    const brand = searchParams.brand as string
    const search = searchParams.search as string

    let title = "Catalogue - Reboul Store"
    let description = "Découvrez notre sélection de vêtements premium chez Reboul Store."

    if (category) {
        title = `${category} - Catalogue Reboul Store`
        description = `Explorez notre collection de ${category} chez Reboul Store.`
    }

    if (brand) {
        title = `${brand} - Catalogue Reboul Store`
        description = `Découvrez les produits ${brand} disponibles chez Reboul Store.`
    }

    if (search) {
        title = `Résultats pour "${search}" - Catalogue Reboul Store`
        description = `Explorez les résultats de recherche pour "${search}" dans notre catalogue Reboul Store.`
    }

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: 'https://reboul-store.com/catalogue',
            images: [
                {
                    url: 'https://reboul-store.com/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: 'Reboul Store Catalogue',
                },
            ],
        },
    }
}

export default function CataloguePage() {
    return (
        <ClientOnly>
            <Suspense fallback={<Loader />}>
                <LocalStorageChecker />
                <CatalogueContent />
            </Suspense>
        </ClientOnly>
    )
}

