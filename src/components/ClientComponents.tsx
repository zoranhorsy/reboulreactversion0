'use client'

import { Dock } from '@/components/Dock'
import DynamicBodyAttributes from '@/components/DynamicBodyAttributes'
import { LoaderComponent } from '@/components/ui/Loader'
import { GsapInitializer } from '@/components/GsapInitializer'

export default function ClientComponents() {
    return (
        <>
            <DynamicBodyAttributes>
                <LoaderComponent />
                <GsapInitializer />
            </DynamicBodyAttributes>
            <Dock />
        </>
    )
}

