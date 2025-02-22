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

const dockVariants = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  }
}

const menuVariants = {
  closed: {
    scale: 0.95,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  },
  open: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30
    }
  }
}

const itemVariants = {
  rest: {
    scale: 1,
    y: 0
  },
  hover: {
    scale: 1.15,
    y: -2,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17
    }
  }
}

const dockStyles = {
  base: cn(
    "flex items-center justify-center h-16 gap-2 px-4",
    "bg-black/20 backdrop-blur-sm rounded-lg",
    "border border-white/5",
    "mx-auto shadow-md"
  ),
  item: cn(
    "relative px-2 group",
    "transition-all duration-200"
  ),
  icon: cn(
    "h-6 w-6 text-white",
    "opacity-90 group-hover:opacity-100 transition-opacity duration-200"
  )
}

const badgeVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 25
    }
  },
  pulse: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.3
    }
  }
}

export function Dock() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false)
  const { items } = useCart()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const { user, logout } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
    const timer = setTimeout(() => setIsOpen(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout()
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
      })
    }
  }

  if (!isMounted) {
    return null
  }

  const menuItems = [
    { id: 'home', href: "/", icon: Home, label: "Accueil" },
    {
      id: 'catalogue',
      href: "/catalogue",
      icon: ShoppingBag,
      label: "Catalogue",
      onClick: () => setIsCatalogueOpen(!isCatalogueOpen),
      subMenu: [
        { href: "/catalogue", label: "Tous les produits" },
        { href: "/catalogue?store_type=adult", label: "Adulte" },
        { href: "/catalogue?store_type=kids", label: "Enfant" },
        { href: "/catalogue?store_type=sneakers", label: "Sneakers" },
      ],
    },
    { id: 'about', href: "/about", icon: Info, label: "À propos" },
    ...(user
      ? [
          { id: 'profile', href: "/profil", icon: UserCircle2, label: "Profil" },
          { id: 'logout', href: "#", icon: LogOut, label: "Déconnexion", onClick: handleLogout },
        ]
      : [{ id: 'login', href: "/connexion", icon: LogIn, label: "Connexion" }]),
    ...(user?.isAdmin ? [{ id: 'admin', href: "/admin", icon: Settings2, label: "Administration" }] : []),
    {
      id: 'theme',
      href: "#",
      icon: ({ className }: { className?: string }) => (
        <>
          <Sun className={cn(className, "rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0")} />
          <Moon className={cn(className, "absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100")} />
        </>
      ),
      label: "Thème",
      onClick: () => setTheme(theme === "dark" ? "light" : "dark")
    }
  ]

  return (
    <TooltipProvider>
      <motion.div
        className="fixed bottom-6 inset-x-0 mx-auto w-fit z-50"
        variants={dockVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div className={dockStyles.base} layout>
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            initial="rest"
            whileHover="hover"
            className={dockStyles.item}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => setIsOpen(!isOpen)}
                  className="w-12 h-12 flex items-center justify-center"
                  aria-expanded={isOpen}
                  aria-label="Toggle menu"
                >
                  <Image
                    src="/images/logo_white.png"
                    alt="Reboul Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-contain opacity-90 group-hover:opacity-100"
                    priority
                  />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-background/90 backdrop-blur-sm border-white/10">
                <p>Menu principal</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>

          {/* Separator */}
          {isOpen && <div className="w-px h-8 bg-white/10 mx-1" />}

          {/* Menu Items */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                variants={menuVariants}
                initial="closed"
                animate="open"
                exit="closed"
                className="flex items-center gap-2"
              >
                {menuItems.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={itemVariants}
                    initial="rest"
                    whileHover="hover"
                    className={dockStyles.item}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {item.onClick ? (
                          <button
                            onClick={item.onClick}
                            className="w-12 h-12 flex items-center justify-center relative"
                            aria-label={item.label}
                          >
                            <item.icon className={dockStyles.icon} />
                          </button>
                        ) : (
                          <Link href={item.href}>
                            <div className="w-12 h-12 flex items-center justify-center relative">
                              <item.icon className={dockStyles.icon} />
                            </div>
                          </Link>
                        )}
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-background/90 backdrop-blur-sm border-white/10">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Sous-menu */}
                    {item.subMenu && isCatalogueOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
                          "bg-black/20 backdrop-blur-md",
                          "rounded-lg border border-white/5 p-1",
                          "min-w-[140px] shadow-lg shadow-black/10"
                        )}
                      >
                        {item.subMenu.map((subItem) => (
                          <Link key={subItem.href} href={subItem.href}>
                            <div className={cn(
                              "px-3 py-1.5 rounded-md",
                              "hover:bg-white/5 transition-colors",
                              "text-xs text-white/80 hover:text-white"
                            )}>
                              {subItem.label}
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Separator */}
          <div className="w-px h-8 bg-white/10 mx-1" />

          {/* Panier */}
          <motion.div
            variants={itemVariants}
            initial="rest"
            whileHover="hover"
            className="relative px-1.5"
          >
            <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="w-12 h-12 flex items-center justify-center relative"
                    aria-label="Panier"
                  >
                    <ShoppingCart className={dockStyles.icon} />
                    {itemCount > 0 && (
                      <div className="absolute right-0 -top-1.5 bg-red-500/90 text-white text-[10px] rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center font-medium">
                        {itemCount}
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Panier</p>
                </TooltipContent>
              </Tooltip>
            </CartSheet>
          </motion.div>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  )
}

