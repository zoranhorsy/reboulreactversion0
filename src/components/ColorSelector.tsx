interface ColorSelectorProps {
  selectedColor: string
  onColorChange: (color: string) => void
  variants: { size: string; color: string; stock: number }[]
}

export function ColorSelector({ selectedColor, onColorChange, variants }: ColorSelectorProps) {
  const availableColors = Array.from(new Set(variants.map((v) => v.color)))

  const getColorHex = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      Blanc: "#FFFFFF",
      Noir: "#000000",
      Rouge: "#FF0000",
      Bleu: "#0000FF",
      Vert: "#008000",
      Jaune: "#FFFF00",
      Orange: "#FFA500",
      Violet: "#800080",
      Rose: "#FFC0CB",
      Gris: "#808080",
      Marron: "#A52A2A",
      Beige: "#F5F5DC",
      Turquoise: "#40E0D0",
      Corail: "#FF7F50",
      Indigo: "#4B0082",
    }
    return colorMap[colorName] || colorName
  }

  const getColorLabel = (colorName: string) => {
    return colorName.toUpperCase()
  }

  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace("#", "")
    const r = Number.parseInt(hex.substr(0, 2), 16)
    const g = Number.parseInt(hex.substr(2, 2), 16)
    const b = Number.parseInt(hex.substr(4, 2), 16)

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? "text-black" : "text-white"
  }

  return (
    <div>
      <div className="flex gap-[2px]">
        {availableColors.map((color) => {
          const isWhite = color.toLowerCase() === "blanc" || color.toLowerCase() === "white"
          const hexColor = getColorHex(color)

          return (
            <div key={color} className="group">
              <button onClick={() => onColorChange(color)} className="relative w-8 h-8">
                <div
                  className={`w-full h-full ${
                    isWhite ? "border border-gray-300" : ""
                  } ${selectedColor === color ? "ring-1 ring-black" : ""}`}
                  style={{ backgroundColor: hexColor }}
                />
                <div
                  className="absolute bottom-full left-0 w-8 h-0 group-hover:h-5 transition-all duration-200 ease-out overflow-hidden"
                  style={{ backgroundColor: hexColor }}
                >
                  <div className={`text-[8px] ${getTextColor(hexColor)} text-center py-[2px] px-[1px] leading-tight`}>
                    {getColorLabel(color)}
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

