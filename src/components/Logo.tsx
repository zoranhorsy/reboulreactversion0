import Image from "next/image";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`relative w-40 h-16 ${className || ""}`}>
        <Image
          src="/images/logo_black.png"
          alt="Reboul Store Logo"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          className="object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-40 h-16 ${className || ""}`}>
      <Image
        src={theme === "dark" ? "/images/logo_white.png" : "/images/logo_black.png"}
        alt="Reboul Store Logo"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority
        className="object-contain"
      />
    </div>
  );
}
