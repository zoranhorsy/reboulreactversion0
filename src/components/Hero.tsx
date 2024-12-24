import Image from 'next/image'
import { useAnime } from '@/hooks/useAnime'

interface HeroProps {
    title: string
    subtitle: string
    imageUrl: string
    overlayColor?: string
    parallax?: boolean
}

export function Hero({ title, subtitle, imageUrl, overlayColor = 'rgba(0, 0, 0, 0.5)', parallax = false }: HeroProps) {
    const titleRef = useAnime({
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 300
    })

    const subtitleRef = useAnime({
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1000,
        easing: 'easeOutExpo',
        delay: 600
    })

    return (
        <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
            <div className={`absolute inset-0 ${parallax ? 'parallax-bg' : ''}`}>
                <Image
                    src={imageUrl}
                    alt={title}
                    layout="fill"
                    objectFit="cover"
                    quality={100}
                    priority
                />
            </div>
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: overlayColor }}
            >
                <div className="text-center text-white max-w-3xl px-4">
                    <h1
                        ref={titleRef}
                        className="text-5xl font-bold mb-4 opacity-0"
                    >
                        {title}
                    </h1>
                    <p
                        ref={subtitleRef}
                        className="text-xl opacity-0"
                    >
                        {subtitle}
                    </p>
                </div>
            </div>
        </div>
    )
}

