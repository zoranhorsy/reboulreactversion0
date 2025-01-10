'use client'

import Image from 'next/image'

export function Hero() {
    return (
        <div className="relative min-h-[60vh] w-full bg-white flex items-center justify-end px-4 sm:px-6 lg:px-8">
            <div className="relative flex flex-col items-end space-y-4 sm:space-y-6 md:space-y-8">
                <div className="w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px]">
                    <Image
                        src="/typo_b.png"
                        alt="REBOUL"
                        width={600}
                        height={150}
                        priority
                        className="w-full h-auto"
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
        </div>
    )
}

