import Image from 'next/image'

interface LogoProps {
    className?: string
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={`relative w-40 h-16 ${className || ''}`}>
            <Image
                src="/images/logo_black.png"
                alt="Reboul Store Logo"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                className="object-contain"
            />
        </div>
    )
}

