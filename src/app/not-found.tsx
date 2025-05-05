import { NotFoundContent } from '@/components/NotFoundContent'
import { ClientPageWrapper, defaultViewport } from '@/components/ClientPageWrapper'
import type { Viewport } from 'next'

export const viewport: Viewport = defaultViewport

export default function NotFound() {
  return (
    <ClientPageWrapper>
      <NotFoundContent />
    </ClientPageWrapper>
  )
} 