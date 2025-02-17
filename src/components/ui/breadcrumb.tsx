import * as React from "react"
import Link from "next/link"
import { ChevronRight } from 'lucide-react'
import anime from 'animejs/lib/anime.es.js'

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<
    HTMLElement,
    React.ComponentPropsWithoutRef<"nav"> & {
    separator?: React.ReactNode
}
>(({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<
    HTMLOListElement,
    React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
    <ol
        ref={ref}
        className={cn(
            "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
            className
        )}
        {...props}
    />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => {
    const itemRef = React.useRef<HTMLLIElement | null>(null)

    React.useEffect(() => {
        if (itemRef.current) {
            anime({
                targets: itemRef.current,
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 500,
                easing: 'easeOutQuad',
                delay: anime.stagger(100)
            })
        }
    }, [])

    return (
        <li
            ref={(node) => {
                if (node) {
                    itemRef.current = node
                    if (typeof ref === 'function') ref(node)
                    else if (ref) ref.current = node
                }
            }}
            className={cn("inline-flex items-center gap-1.5", className)}
            {...props}
        />
    )
})
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentPropsWithoutRef<typeof Link> & {
    isCurrentPage?: boolean
}
>(({ className, isCurrentPage, ...props }, ref) => (
    <Link
        ref={ref}
        className={cn(
            "transition-colors hover:text-foreground",
            isCurrentPage ? "text-foreground font-medium pointer-events-none" : "text-muted-foreground",
            className
        )}
        aria-current={isCurrentPage ? "page" : undefined}
        {...props}
    />
))
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = ({
                                 children,
                                 className,
                                 ...props
                             }: React.ComponentProps<"li">) => (
    <li
        role="presentation"
        aria-hidden="true"
        className={cn("[&>svg]:size-3.5", className)}
        {...props}
    >
        {children || <ChevronRight />}
    </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

export {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbSeparator,
}

