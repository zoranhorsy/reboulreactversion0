import { useState, useCallback } from 'react'
import { getColorValue, getColorName } from '@/config/productColors'

export function useColorSelector(initialColor: string, availableColors: string[]) {
    const [selectedColor, setSelectedColor] = useState(initialColor)

    const handleColorChange = useCallback((color: string) => {
        setSelectedColor(color)
    }, [])

    const getSelectedColorValue = useCallback(() => {
        return getColorValue(selectedColor)
    }, [selectedColor])

    const getSelectedColorName = useCallback(() => {
        return getColorName(getColorValue(selectedColor))
    }, [selectedColor])

    return {
        selectedColor,
        handleColorChange,
        getSelectedColorValue,
        getSelectedColorName,
        availableColors,
    }
}

