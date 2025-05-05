import { GeistSans } from 'geist/font'
import localFont from 'next/font/local'

// La police GeistSans est déjà préconfigurée et ne peut pas être appelée comme une fonction
export const fontSans = GeistSans

// Charger les polices locales avec options optimisées
export const fontKernel = localFont({
  src: [
    {
      path: '../../public/fonts/KernelRegular.ttf',
      weight: '400',
      style: 'normal',
    }
  ],
  display: 'swap',
  preload: true,
  variable: '--font-kernel',
})

export const fontKernelOblique = localFont({
  src: [
    {
      path: '../../public/fonts/KernelOblique.ttf',
      weight: '400',
      style: 'italic',
    }
  ],
  display: 'swap',
  preload: true,
  variable: '--font-kernel-oblique',
}) 