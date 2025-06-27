# Guide de Modification du HeroSection

## Structure du Composant

Le HeroSection est composé de trois parties principales :

```tsx
<GridBackground>
    <div className="container">
        {/* 1. Logo */}
        <motion.div>
            <OptimizedImage />
        </motion.div>

        {/* 2. Description */}
        <motion.p>
            Description avec <Highlight>mise en évidence</Highlight>
        </motion.p>

        {/* 3. Boutons d'Action */}
        <motion.div>
            <Button>Explorer la collection</Button>
            <Button>Notre histoire</Button>
        </motion.div>
    </div>
</GridBackground>
```

## Modifications Courantes

### 1. Ajuster la Hauteur

```tsx
// Hauteur minimale et padding
className="min-h-[600px] py-16"  // Valeurs actuelles
```
- `min-h-[600px]` : Définit la hauteur minimale
- `py-16` : Ajoute un padding vertical (64px)

### 2. Modifier le Logo

```tsx
<OptimizedImage
    src={resolvedTheme === 'dark' ? "/images/logotype_w.png" : "/images/logotype_b.png"}
    alt="REBOUL"
    width={700}
    height={210}
    // Ajuster les tailles responsives
    sizes="(max-width: 400px) 280px, (max-width: 640px) 400px, (max-width: 768px) 500px, (max-width: 1024px) 600px, 700px"
/>
```

### 3. Changer la Description

```tsx
<motion.p className="text-center max-w-[280px] xs:max-w-[340px] sm:max-w-xl md:max-w-2xl">
    Votre texte ici avec <Highlight>mise en évidence</Highlight>
</motion.p>
```

### 4. Personnaliser les Boutons

```tsx
<Button 
    asChild 
    className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-white/90
        text-white hover:text-white dark:text-zinc-900 dark:hover:text-zinc-900
        h-12 w-full sm:w-auto px-8 rounded-lg"
>
    <Link href="/votre-lien">
        Votre texte
        <ChevronRight className="w-4 h-4" />
    </Link>
</Button>
```

## Animations

Chaque section utilise Framer Motion pour les animations :

```tsx
<motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, delay: 0.X }}  // X = 0.2 pour logo, 0.4 pour texte, 0.6 pour boutons
>
```

## Thème Sombre/Clair

Le composant s'adapte automatiquement au thème grâce à :
- `bg-white dark:bg-black` pour le fond
- `text-zinc-700 dark:text-zinc-300` pour le texte
- Logos différents selon le thème via `resolvedTheme`

## Responsive Design

Le composant est entièrement responsive avec des breakpoints :
- xs: 400px
- sm: 640px
- md: 768px
- lg: 1024px

Ajustez les classes Tailwind selon ces breakpoints pour modifier l'apparence sur différents écrans. 