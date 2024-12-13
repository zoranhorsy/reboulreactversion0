import ClientOnly from '@/components/ClientOnly'
import { AboutContent } from '@/components/about/AboutContent'

export default function About() {
    return (
        <ClientOnly>
            <AboutContent />
        </ClientOnly>
    )
}

