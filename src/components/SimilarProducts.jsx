import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from "@/components/ui/card"
import PropTypes from 'prop-types'

export function SimilarProducts({ products }) {
    return (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <Link href={`/produit/${product.id}`}>
                    <div className="aspect-square relative mb-2">
                      <Image
                        src={product.image}
                        alt={product.name}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-md"
                      />
                    </div>
                    <h3 className="font-medium text-sm">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.price.toFixed(2)} €</p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    SimilarProducts.propTypes = {
      products: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          price: PropTypes.number.isRequired,
          image: PropTypes.string.isRequired,
        })
      ).isRequired,
    }

    