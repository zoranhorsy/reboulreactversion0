"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Home, ShoppingBag, User, Info, ShoppingCart, LogIn, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/app/contexts/CartContext"
import { CartSheet } from "@/components/cart/CartSheet"
import { useTheme } from "next-themes"
import { useAuth } from "@/app/contexts/AuthContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

const variants = {
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.2 },
  },
  closed: {
    opacity: 0,
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
}

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
}

export function Dock() {
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false)
  const { items } = useCart()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const { theme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const { user, logout } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleOpen = () => setIsOpen(!isOpen)

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
    { href: "/", icon: Home, label: "Accueil" },
    {
      href: "#",
      icon: ShoppingBag,
      label: "Catalogue",
      onClick: () => setIsCatalogueOpen(!isCatalogueOpen),
      subMenu: [
        { href: "/catalogue/", label: "Tous les produits" },
        { href: "/adulte", label: "Adulte" },
        { href: "/minots", label: "Enfant" },
        { href: "/sneakers", label: "Sneakers" },
      ],
    },
    { href: "/about", icon: Info, label: "À propos" },
    ...(user
      ? [
          { href: "/profil", icon: User, label: "Profil" },
          { href: "#", icon: LogOut, label: "Déconnexion", onClick: handleLogout },
        ]
      : [{ href: "/connexion", icon: LogIn, label: "Connexion" }]),
    ...(user?.isAdmin ? [{ href: "/admin", icon: Settings, label: "Administration" }] : []),
  ]

  return (
    <TooltipProvider>
      <motion.div
        className="fixed top-6 left-6 z-50"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div
          className={`flex flex-col items-center space-y-4 ${
            theme === "dark" ? "bg-gray-800" : "bg-white"
          } bg-opacity-25 backdrop-blur-lg rounded-2xl shadow-lg p-4`}
          layout
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={toggleOpen}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`w-10 h-10 rounded-xl ${
                  theme === "dark" ? "bg-gray-700" : "bg-white"
                } shadow-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-expanded={isOpen}
                aria-label="Toggle menu"
              >
                <Image
                  src={theme === "dark" ? "/images/logo_white.png" : "/images/logo_black.png"}
                  alt="Reboul Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Menu principal</p>
            </TooltipContent>
          </Tooltip>

          <AnimatePresence>
            {isOpen && (
              <motion.div initial="closed" animate="open" exit="closed" variants={variants} className="space-y-4">
                {menuItems.map((item) => (
                  <motion.div key={item.href} variants={itemVariants} className="relative">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {item.onClick ? (
                          <motion.button
                            onClick={item.onClick}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className={`w-10 h-10 rounded-xl ${
                              theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"
                            } shadow-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 relative`}
                            aria-label={item.label}
                          >
                            <item.icon className={`h-5 w-5 ${theme === "dark" ? "text-white" : "text-gray-700"}`} />
                          </motion.button>
                        ) : (
                          <Link href={item.href}>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className={`w-10 h-10 rounded-xl ${
                                theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-white hover:bg-gray-100"
                              } shadow-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500`}
                              aria-label={item.label}
                            >
                              <item.icon className={`h-5 w-5 ${theme === "dark" ? "text-white" : "text-gray-700"}`} />
                            </motion.div>
                          </Link>
                        )}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                    {item.subMenu && isCatalogueOpen && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="absolute left-full ml-2 top-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-2 min-w-[150px]"
                      >
                        {item.subMenu.map((subItem) => (
                          <Link key={subItem.href} href={subItem.href}>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={`px-4 py-2 rounded-lg ${
                                theme === "dark" ? "hover:bg-gray-700" : "hover:bg-gray-100"
                              } flex items-center justify-start`}
                            >
                              <span className={`text-sm ${theme === "dark" ? "text-white" : "text-gray-700"}`}>
                                {subItem.label}
                              </span>
                            </motion.div>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <CartSheet isOpen={isCartOpen} onOpenChange={setIsCartOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.button
                  onClick={() => setIsCartOpen(true)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl ${
                    theme === "dark" ? "bg-gray-700" : "bg-white"
                  } shadow-md relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label="Panier"
                >
                  <ShoppingCart className={`h-5 w-5 ${theme === "dark" ? "text-white" : "text-gray-700"}`} />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Panier</p>
              </TooltipContent>
            </Tooltip>
          </CartSheet>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  )
}

