import { useRef, useEffect } from 'react'
import anime from 'animejs'

type AnimeParams = anime.AnimeParams

export function useAnime<T extends HTMLElement>(params: AnimeParams) {
    const ref = useRef<T>(null)

    useEffect(() => {
        if (ref.current) {
            anime({
                targets: ref.current,
                ...params
            })
        }
    }, [params])

    return ref
}

