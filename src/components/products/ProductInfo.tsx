interface ProductInfoProps {
    name: string
    description: string
    price: number
  }

  export function ProductInfo({ name, description, price }: ProductInfoProps) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">{name}</h1>
        <p className="text-sm text-gray-600 mb-2">{description}</p>
        <p className="text-2xl font-bold">{price}€</p>
      </div>
    )
  }

  