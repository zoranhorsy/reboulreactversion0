"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Home, 
  ShoppingBag, 
  UserCircle2, 
  Info, 
  LogIn, 
  LogOut, 
  Settings2,
  ShoppingCart,
  Sun,
  Moon
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/app/contexts/CartContext"
import { CartSheet } from "@/components/cart/CartSheet"
import { useTheme } from "next-themes"
import { useAuth } from "@/app/contexts/AuthContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const dockStyles = {
  base: cn(
    "fixed bottom-0 left-0 right-0",
    "mb-2 sm:mb-4",
    "flex items-center justify-center",
    "mx-auto",
    "w-fit",
    "h-[45px] sm:h-[50px]",
    "px-1 sm:px-2",
    "bg-black/80 backdrop-blur-sm rounded-full",
    "border border-white/5 shadow-lg",
    "z-[100]",
    "transition-all duration-300 ease-in-out"
  ),
  item: cn(
    "relative",
    "px-[1px] sm:px-1"
  ),
  icon: cn(
    "w-4 h-4 sm:w-5 sm:h-5",
    "text-white opacity-80 hover:opacity-100",
    "transition-all duration-200"
  ),
  button: cn(
    "w-8 h-8 sm:w-10 sm:h-10",
    "flex items-center justify-center relative"
  ),
  logo: cn(
    "w-4 h-4 sm:w-5 sm:h-5",
    "object-contain",
    "opacity-80 hover:opacity-100",
    "transition-all duration-300 ease-in-out"
  ),
  separator: cn(
    "w-px h-4 sm:h-5",
    "bg-white/10 mx-0.5 sm:mx-1"
  ),
  menuContainer: cn(
    "hidden opacity-0", // Caché par défaut
    "items-center gap-1",
    "ml-1",
    "transition-all duration-300 ease-in-out"
  ),
  menuVisible: "!flex !opacity-100", // Afficher en flex quand visible
  submenu: cn(
    "absolute bottom-full mb-2",
    "bg-black/80 backdrop-blur-sm rounded-lg",
    "p-1 md:p-1.5",
    "min-w-[140px]",
    "whitespace-nowrap",
    "border border-white/5",
    "shadow-lg",
    "flex flex-col gap-0.5 md:gap-1"
  ),
  submenuItem: cn(
    "w-full",
    "px-3 py-1 md:px-4 md:py-1.5",
    "text-white/80 text-[11px] md:text-xs",
    "hover:bg-white/10 rounded",
    "transition-colors",
    "text-left",
    "block",
    "cursor-pointer"
  )
}

export function Dock() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [showSubmenu, setShowSubmenu] = useState(false)
  const { items } = useCart()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()

  const menuItems = [
    { id: 'home', href: "/", icon: Home, label: "Accueil" },
    { id: 'catalogue', href: "/catalogue", icon: ShoppingBag, label: "Catalogue" },
    { id: 'about', href: "/about", icon: Info, label: "À propos" },
    ...(user
      ? [
          { id: 'profile', href: "/profil", icon: UserCircle2, label: "Profil" },
          { id: 'logout', href: "#", icon: LogOut, label: "Déconnexion", onClick: logout },
        ]
      : [{ id: 'login', href: "/connexion", icon: LogIn, label: "Connexion" }]),
    ...(user?.isAdmin ? [{ id: 'admin', href: "/admin", icon: Settings2, label: "Administration" }] : []),
    {
      id: 'theme',
      href: "#",
      icon: theme === "dark" ? Sun : Moon,
      label: "Thème",
      onClick: () => setTheme(theme === "dark" ? "light" : "dark")
    }
  ]

  const submenuItems = [
    { href: "/catalogue", label: "Tous les produits" },
    { href: "/catalogue/adulte", label: "Adulte" },
    { href: "/catalogue/enfant", label: "Enfant" },
    { href: "/catalogue/sneakers", label: "Sneakers" }
  ]

  return (
    <motion.div 
      className={dockStyles.base}
      layout
      transition={{
        layout: { 
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1]
        }
      }}
    >
      {/* Logo */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={dockStyles.button}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        whileHover={{ 
          scale: 1.1
        }}
        whileTap={{ 
          scale: 0.95
        }}
        animate={isOpen ? {
          scale: 1.1
        } : {
          scale: 1
        }}
        transition={{ 
          type: "spring",
          stiffness: 400,
          damping: 15
        }}
      >
        <Image
          src="/images/logo_white.png"
          alt="Reboul Logo"
          width={20}
          height={20}
          className={dockStyles.logo}
          priority
        />
      </motion.button>

      {/* Menu Items */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div 
            className={cn(dockStyles.menuContainer, dockStyles.menuVisible)}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ 
              duration: 0.3,
              ease: [0.23, 1, 0.32, 1]
            }}
            style={{ originX: 0 }}
          >
            {/* Separator */}
            <motion.div 
              className={dockStyles.separator}
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              exit={{ opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            />
            
            {menuItems.map((item, index) => (
              <motion.div 
                key={item.id} 
                className={dockStyles.item}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ 
                  duration: 0.2,
                  delay: 0.1 + index * 0.02,
                  ease: [0.23, 1, 0.32, 1]
                }}
              >
                {item.id === 'catalogue' ? (
                  <motion.div className="relative">
                    <motion.button
                      onClick={() => setShowSubmenu(!showSubmenu)}
                      className={dockStyles.button}
                      aria-label={item.label}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className={dockStyles.icon} />
                    </motion.button>
                    <AnimatePresence>
                      {showSubmenu && (
                        <motion.div
                          className={dockStyles.submenu}
                          initial={{ opacity: 0, y: 5, scaleY: 0.8 }}
                          animate={{ opacity: 1, y: 0, scaleY: 1 }}
                          exit={{ opacity: 0, y: 5, scaleY: 0.8 }}
                          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                          style={{ originY: 1 }}
                        >
                          {submenuItems.map((subItem, idx) => (
                            <motion.div
                              key={subItem.href}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ 
                                duration: 0.2,
                                delay: idx * 0.03,
                                ease: [0.23, 1, 0.32, 1]
                              }}
                              className="w-full"
                            >
                              <Link 
                                href={subItem.href}
                                className={dockStyles.submenuItem}
                                onClick={() => {
                                  setShowSubmenu(false)
                                  setIsOpen(false)
                                }}
                              >
                                {subItem.label}
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : item.onClick ? (
                  <motion.button
                    onClick={item.onClick}
                    className={dockStyles.button}
                    aria-label={item.label}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className={dockStyles.icon} />
                  </motion.button>
                ) : (
                  <Link href={item.href}>
                    <motion.div 
                      className={dockStyles.button}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <item.icon className={dockStyles.icon} />
                    </motion.div>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panier */}
      <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen}>
        <motion.button
          onClick={() => setIsCartOpen(true)}
          className={dockStyles.button}
          aria-label="Panier"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart className={dockStyles.icon} />
          {itemCount > 0 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -right-0.5 -top-0.5 bg-red-500/90 text-white text-[9px] rounded-full h-3 min-w-[12px] px-1 flex items-center justify-center"
            >
              {itemCount}
            </motion.div>
          )}
        </motion.button>
      </CartSheet>
    </motion.div>
  )
}

