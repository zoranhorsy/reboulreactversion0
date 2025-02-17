'use client'

import Image from 'next/image'

interface HeroProps {
  title?: string;
  subtitle?: string;
  imageUrl?: string;
  overlayColor?: string;
  parallax?: boolean;
}

export function Hero({ title, subtitle, imageUrl, overlayColor, parallax }: HeroProps) {
    return (
        <div className={`relative min-h-full w-full bg-white flex items-center justify-end px-4 sm:px-6 lg:px-8 h-full ${parallax ? 'parallax-bg' : ''}`}>
            {imageUrl && (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                    />
                    {overlayColor && (
                        <div
                            className="absolute inset-0"
                            style={{ backgroundColor: overlayColor }}
                        />
                    )}
                </>
            )}

            {(title || subtitle) ? (
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center px-4 z-10">
                    {title && <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">{title}</h1>}
                    {subtitle && <p className="text-xl sm:text-2xl md:text-3xl">{subtitle}</p>}
                </div>
            ) : (
                <div className="relative flex flex-col items-end space-y-4 sm:space-y-6 md:space-y-8 z-10">
                    <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px]">
                        <Image
                            src="/typo_b.png"
                            alt="REBOUL"
                            width={400}
                            height={150}
                            priority
                            className="w-full h-full"
                            unoptimized
                        />
                    </div>
                    <div className="w-full max-w-[200px] md:max-w-[250px] lg:max-w-[300px]">
                        <Image
                            src="/SINCE 1872_.png"
                            alt="SINCE 1872"
                            width={300}
                            height={75}
                            priority
                            className="w-full h-auto"
                            unoptimized
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

