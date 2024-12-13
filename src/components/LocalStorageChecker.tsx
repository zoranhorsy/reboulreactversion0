'use client'

import { useEffect } from 'react'

export function LocalStorageChecker() {
    useEffect(() => {
        const checkLocalStorage = () => {
            const productsJson = localStorage.getItem('products')
            console.log('Contenu brut du localStorage (products):', productsJson)

            if (productsJson) {
                try {
                    const products = JSON.parse(productsJson)
                    console.log('Nombre de produits dans le localStorage:', products.length)
                    products.forEach((product: any, index: number) => {
                        console.log(`\nProduit ${index + 1}:`)
                        console.log('ID:', product.id)
                        console.log('Nom:', product.name)
                        console.log('Prix:', product.price)
                        console.log('Catégorie:', product.category)
                        console.log('Marque:', product.brand)
                        console.log('Nombre de variantes:', product.variants?.length || 0)
                        console.log('Tags:', product.tags?.join(', ') || 'Aucun')
                        console.log('Nombre d\'avis:', product.reviews?.length || 0)
                        console.log('Nombre de questions:', product.questions?.length || 0)
                        console.log('Nombre de FAQs:', product.faqs?.length || 0)
                        console.log('Nombre de tailles dans le guide:', product.sizeChart?.length || 0)
                    })
                } catch (error) {
                    console.error('Erreur lors du parsing du JSON:', error)
                }
            } else {
                console.log('Aucun produit trouvé dans le localStorage.')
            }
        }

        checkLocalStorage()
    }, [])

    return null
}

