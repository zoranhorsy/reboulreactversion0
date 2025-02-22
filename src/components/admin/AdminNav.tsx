'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
    Home, 
    Package, 
    Users, 
    ShoppingCart, 
    Settings, 
    Tags,
    Image,
    BarChart2
} from 'lucide-react'

const NAV_ITEMS = [
    { href: '/admin', label: 'Tableau de bord', icon: Home },
    { href: '/admin/products', label: 'Produits', icon: Package },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/archives', label: 'Archives', icon: Image },
    { href: '/admin/stats', label: 'Statistiques', icon: BarChart2 },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings }
]

export function AdminNav() {
    const pathname = usePathname()

    return (
        <nav className="grid gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname?.startsWith(href + '/')
                return (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            "hover:bg-accent",
                            isActive 
                                ? "bg-accent font-medium text-accent-foreground" 
                                : "text-muted-foreground"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </Link>
                )
            })}
        </nav>
    )
} 