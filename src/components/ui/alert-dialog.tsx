"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "@/components/ui/button"

interface AlertDialogProps {
    children: React.ReactNode
    onOpenChange?: (open: boolean) => void
}

const AlertDialog = ({ children, onOpenChange }: AlertDialogProps) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        onOpenChange?.(open)
    }

    return (
        <AlertDialogContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
            {children}
        </AlertDialogContext.Provider>
    )
}

const AlertDialogContext = React.createContext<{
    isOpen: boolean
    setIsOpen: (open: boolean) => void
} | null>(null)

const useAlertDialog = () => {
    const context = React.useContext(AlertDialogContext)
    if (!context) {
        throw new Error("useAlertDialog must be used within an AlertDialog")
    }
    return context
}

const AlertDialogTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, ...props }, ref) => {
    const { setIsOpen } = useAlertDialog()
    return (
        <button {...props} ref={ref} onClick={() => setIsOpen(true)}>
            {children}
        </button>
    )
})
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
    const { isOpen, setIsOpen } = useAlertDialog()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full" onClick={(e) => e.stopPropagation()} {...props}>
                {children}
            </div>
        </div>
    )
}

const AlertDialogHeader = ({
                               className,
                               ...props
                           }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
                               className,
                               ...props
                           }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
    />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    ButtonProps
>(({ className, ...props }, ref) => (
    <Button ref={ref} className={cn(className)} {...props} />
))
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    ButtonProps
>(({ className, ...props }, ref) => (
    <Button
        ref={ref}
        variant="outline"
        className={cn("mt-2 sm:mt-0", className)}
        {...props}
    />
))
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}

