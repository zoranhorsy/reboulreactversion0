import { HomeContent } from '@/components/HomeContent'
import { GsapProvider } from '@/components/GsapProvider'

export default function Home() {
    return (
        <GsapProvider>
            <HomeContent />
        </GsapProvider>
    )
}

