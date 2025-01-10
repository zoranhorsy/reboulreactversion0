'use client'

import { Dock } from '@/components/Dock'
import { DynamicBodyAttributes } from '@/components/DynamicBodyAttributes'
import { Loader } from '@/components/ui/Loader'
import GsapInitializer from '@/components/GsapInitializer'

export default function ClientComponents() {
    return (
        <>
            <DynamicBodyAttributes>
                <Loader />
                <GsapInitializer />
            </DynamicBodyAttributes>
            <Dock />
        </>
    )
}

