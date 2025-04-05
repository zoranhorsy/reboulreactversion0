"use client"

import { createContext, useContext, useState, useCallback } from 'react'
import { PromoCode, AppliedPromoCode } from '@/types/promo'

interface PromoContextType {
  promoCodes: PromoCode[]
  appliedPromo: AppliedPromoCode | null
  applyPromoCode: (code: string, subtotal: number) => Promise<boolean>
  removePromoCode: () => void
  addPromoCode: (promo: PromoCode) => void
  removePromoCodeFromList: (code: string) => void
}

const PromoContext = createContext<PromoContextType | undefined>(undefined)

// Liste initiale des codes promos
const initialPromoCodes: PromoCode[] = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    description: "10% de réduction sur votre première commande",
    isActive: true,
    minOrderAmount: 50
  },
  {
    code: "SUMMER2024",
    type: "fixed",
    value: 15,
    description: "15€ de réduction sur votre commande",
    isActive: true,
    minOrderAmount: 100
  }
]

export function PromoProvider({ children }: { children: React.ReactNode }) {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes)
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromoCode | null>(null)

  const applyPromoCode = useCallback(async (code: string, subtotal: number): Promise<boolean> => {
    const promo = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase())
    
    if (!promo) {
      return false
    }

    if (!promo.isActive) {
      return false
    }

    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      return false
    }

    if (promo.startDate && new Date() < promo.startDate) {
      return false
    }

    if (promo.endDate && new Date() > promo.endDate) {
      return false
    }

    if (promo.usageLimit && promo.currentUsage && promo.currentUsage >= promo.usageLimit) {
      return false
    }

    const discountAmount = promo.type === 'percentage' 
      ? (subtotal * promo.value) / 100 
      : promo.value

    const appliedPromo: AppliedPromoCode = {
      ...promo,
      appliedAt: new Date(),
      discountAmount
    }

    setAppliedPromo(appliedPromo)
    return true
  }, [promoCodes])

  const removePromoCode = useCallback(() => {
    setAppliedPromo(null)
  }, [])

  const addPromoCode = useCallback((promo: PromoCode) => {
    setPromoCodes(prev => [...prev, promo])
  }, [])

  const removePromoCodeFromList = useCallback((code: string) => {
    setPromoCodes(prev => prev.filter(p => p.code !== code))
  }, [])

  return (
    <PromoContext.Provider value={{
      promoCodes,
      appliedPromo,
      applyPromoCode,
      removePromoCode,
      addPromoCode,
      removePromoCodeFromList
    }}>
      {children}
    </PromoContext.Provider>
  )
}

export function usePromo() {
  const context = useContext(PromoContext)
  if (context === undefined) {
    throw new Error('usePromo must be used within a PromoProvider')
  }
  return context
} 