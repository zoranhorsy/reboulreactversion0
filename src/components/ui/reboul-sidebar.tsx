"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { useTheme } from "next-themes";
import Image from "next/image";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  // Bloquer le scroll de la page principale quand la sidebar mobile est ouverte
  useEffect(() => {
    if (open) {
      // Empêcher le scroll sur mobile uniquement
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = '0px'; // Éviter le jump de layout
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // Cleanup au démontage
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
  className,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
  className?: string;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      <div className={className}>
        {children}
      </div>
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "fixed top-0 left-0 px-4 py-4 hidden md:flex md:flex-col shrink-0 border-r border-gray-200 dark:border-zinc-700 z-40",
          "bg-gradient-to-b from-white via-gray-50/98 to-gray-100/95 dark:from-zinc-950 dark:via-zinc-950/95 dark:to-zinc-900/90",
          "backdrop-blur-sm shadow-xl overflow-y-auto",
          className,
        )}
        style={{
          height: 'fit-content',
          maxHeight: '100vh',
          borderRadius: '10px',
          left: '10px',
          top: '10px',
        }}
        animate={{
          width: animate ? (open ? "280px" : "80px") : "280px",
        }}
        onMouseEnter={() => animate && setOpen(true)}
        onMouseLeave={() => animate && setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-14 px-4 py-4 flex flex-row md:hidden items-center justify-between",
          "bg-gradient-to-r from-background via-background/95 to-background/90",
          "border-b border-border/50 backdrop-blur-sm w-full",
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-foreground h-5 w-5 cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-[85vw] max-w-sm inset-y-0 left-0 z-[100] flex flex-col",
                "bg-gradient-to-b from-background via-background/98 to-background/95",
                "backdrop-blur-md p-6 shadow-2xl border-r border-border/50",
                className,
              )}
            >
              <div
                className="absolute right-4 top-4 z-50 text-foreground cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <IconX className="h-6 w-6" />
              </div>
              <div className="mt-8">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-3 rounded-lg",
        "hover:bg-accent/80 transition-all duration-300 ease-in-out",
        "text-muted-foreground hover:text-accent-foreground",
        "border border-transparent hover:border-border/50",
        className,
      )}
      {...props}
    >
      <div className="text-foreground/80 group-hover/sidebar:text-primary transition-colors duration-300">
        {link.icon}
      </div>

      {/* Sur mobile, on affiche toujours le texte. Sur desktop, on utilise l'animation */}
      <span className={cn(
        "text-sm font-medium whitespace-pre transition-all duration-300",
        "group-hover/sidebar:translate-x-1",
        "text-foreground/80 group-hover/sidebar:text-foreground",
        // Sur mobile (md-), toujours visible
        "block md:hidden",
      )}>
        {link.label}
      </span>
      
      {/* Animation pour desktop seulement */}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className={cn(
          "text-sm font-medium whitespace-pre inline-block !p-0 !m-0",
          "group-hover/sidebar:translate-x-1 transition-all duration-300",
          "text-foreground/80 group-hover/sidebar:text-foreground",
          // Sur desktop seulement
          "hidden md:inline-block",
        )}
      >
        {link.label}
      </motion.span>
    </a>
  );
};

// Composant Logo Reboul pour la sidebar
export const SidebarLogo = ({ collapsed = false }: { collapsed?: boolean }) => {
  const { open, animate } = useSidebar();
  const { theme } = useTheme();

  // Utiliser logo_white (blanc) pour dark mode et logo_black (noir) pour light mode
  const logoSrc = theme === "dark" ? "/images/logo_white.png" : "/images/logo_black.png";

  return (
    <div className="flex items-center gap-3 px-3 py-4 border-b border-border/30 mb-4">
      <div className="relative w-12 h-12 flex-shrink-0">
        <Image
          src={logoSrc}
          alt="Reboul Logo"
          width={48}
          height={48}
          className="object-contain"
          priority
        />
      </div>
      
      {/* Version mobile - toujours visible */}
      <div className="block md:hidden overflow-hidden">
        <h2 className="text-lg font-bold text-foreground">Reboul Store 2.0</h2>
        <p className="text-xs text-muted-foreground">Concept Store</p>
      </div>
      
      {/* Version desktop - avec animation */}
      <motion.div
        animate={{
          display: animate ? (open ? "block" : "none") : "block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="hidden md:block overflow-hidden"
      >
       <h2 className="text-lg font-bold text-foreground">Reboul Store 2.0</h2>
       <p className="text-xs text-muted-foreground">Concept Store</p>
      </motion.div>
    </div>
  );
};

// Composant Avatar pour la sidebar
export const SidebarAvatar = ({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email?: string;
  avatarUrl?: string;
}) => {
  const { open, animate } = useSidebar();

  return (
    <div className="flex items-center gap-3 px-3 py-4 border-t border-border/30 mt-auto">
      <div className="relative w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            fill
            className="object-cover rounded-full"
          />
        ) : (
          <span className="text-primary font-medium text-sm">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()}
          </span>
        )}
      </div>
      <motion.div
        animate={{
          display: animate ? (open ? "block" : "none") : "block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="overflow-hidden"
      >
        <p className="text-sm font-medium text-foreground truncate">{name}</p>
        {email && (
          <p className="text-xs text-muted-foreground truncate">{email}</p>
        )}
      </motion.div>
    </div>
  );
};


