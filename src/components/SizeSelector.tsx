import React from 'react'
import PropTypes from 'prop-types'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SizeSelector({ availableSizes, selectedSize, onSizeChange, sizeStock }) {
    return (
        <div className="space-y-2">
            <Label htmlFor="size-select">Size</Label>
            <RadioGroup
                id="size-select"
                value={selectedSize}
                onValueChange={onSizeChange}
                className="flex flex-wrap gap-2"
            >
                {availableSizes.map((size) => {
                    const isOutOfStock = sizeStock && sizeStock[size] === 0;
                    return (
                        <TooltipProvider key={size}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <RadioGroupItem
                                            value={size}
                                            id={`size-${size}`}
                                            disabled={isOutOfStock}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={`size-${size}`}
                                            className={`flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 text-sm font-medium transition-colors hover:bg-gray-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground ${
                                                isOutOfStock ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                                            }`}
                                        >
                                            {size}
                                        </Label>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isOutOfStock ? 'Out of stock' : `${sizeStock ? sizeStock[size] : 'Unknown'} in stock`}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}
            </RadioGroup>
        </div>
    )
}

SizeSelector.propTypes = {
    availableSizes: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedSize: PropTypes.string.isRequired,
    onSizeChange: PropTypes.func.isRequired,
    sizeStock: PropTypes.objectOf(PropTypes.number),
}

SizeSelector.defaultProps = {
    sizeStock: null,
}
