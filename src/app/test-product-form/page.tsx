"use client"

import { useState } from "react"
import { ProductForm } from "@/components/admin/ProductForm"
import { type Product } from "@/lib/types/product"
import { toast } from "@/components/ui/use-toast"

export default function TestProductFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedProduct, setSubmittedProduct] = useState<Product | null>(null)

  const handleSubmit = async (product: Product) => {
    try {
      setIsSubmitting(true)
      console.log("Produit soumis:", product)
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSubmittedProduct(product)
      toast({
        title: "Succès",
        description: "Le produit a été soumis avec succès (mode test).",
      })
    } catch (error) {
      console.error("Erreur lors de la soumission:", error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission du produit.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Test du formulaire de produit avec Cloudinary</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Formulaire</h2>
          <ProductForm
            product={null}
            categories={[
              { id: 1, name: "Vêtements", slug: "vetements" },
              { id: 2, name: "Chaussures", slug: "chaussures" },
              { id: 3, name: "Accessoires", slug: "accessoires" },
            ]}
            brands={[
              { id: 1, name: "Nike", slug: "nike" },
              { id: 2, name: "Adidas", slug: "adidas" },
              { id: 3, name: "Puma", slug: "puma" },
            ]}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Résultat</h2>
          {submittedProduct ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Nom</h3>
                <p>{submittedProduct.name}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Description</h3>
                <p className="text-sm">{submittedProduct.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium">Prix</h3>
                <p>{submittedProduct.price} €</p>
              </div>
              
              <div>
                <h3 className="font-medium">Images ({submittedProduct.images?.length || 0})</h3>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                  {submittedProduct.images?.map((image, index) => (
                    <div key={index} className="text-xs break-all bg-muted/20 p-2 rounded">
                      {typeof image === 'string' ? image : 'Non-string image'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Aucun produit soumis</p>
          )}
        </div>
      </div>
    </div>
  )
} 