"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <div className="relative w-full overflow-hidden bg-background py-6 sm:py-12">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      
      <div className="container relative mx-auto px-4">
        <div className="flex flex-col gap-4 text-center sm:gap-6">
          <motion.h1 
            className="text-3xl font-bold tracking-tight sm:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Découvrez notre collection
          </motion.h1>
          
          <motion.p 
            className="mx-auto max-w-xl text-muted-foreground sm:text-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Des pièces uniques sélectionnées avec soin pour votre style
          </motion.p>

          <motion.div 
            className="flex justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
              <div className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-gradient-to-r from-primary to-primary/30" />
              <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                Explorer la collection <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 