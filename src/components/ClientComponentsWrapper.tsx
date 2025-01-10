'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const ClientComponents = dynamic(() => import('@/components/ClientComponents'), {
  ssr: false
})

export default function ClientComponentsWrapper() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return <ClientComponents />
}

