import React from 'react'
import PropTypes from 'prop-types'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus } from 'lucide-react'

export function QuantitySelector({ quantity, onQuantityChange, max }) {
  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1)
    }
  }

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10)
    if (!isNaN(value) && value >= 1 && value <= max) {
      onQuantityChange(value)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <Button onClick={handleDecrement} variant="outline" size="icon">
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={quantity}
        onChange={handleInputChange}
        min={1}
        max={max}
        className="w-16 text-center"
      />
      <Button onClick={handleIncrement} variant="outline" size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

QuantitySelector.propTypes = {
  quantity: PropTypes.number.isRequired,
  onQuantityChange: PropTypes.func.isRequired,
  max: PropTypes.number.isRequired,
}

