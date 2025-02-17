export function StockIndicator() {
    return (
        <div className="grid grid-cols-6 gap-1">
            {[...Array(6)].map((_, index) => (
                <div
                    key={index}
                    className="h-1 bg-black"
                />
            ))}
        </div>
    )
}

