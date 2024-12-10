'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { motion } from 'framer-motion'
import { Color } from 'three';

export function Loader() {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    // const lottieContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        // Three.js setup
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 5

        const renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.current,
            alpha: true,
            antialias: true
        })
        renderer.setClearColor(0x000000, 0) // Fond transparent
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        // Create a render target for the logo
        const renderTarget = new THREE.WebGLRenderTarget(512, 512)

        // Logo setup with Three.js texture loader
        const textureLoader = new THREE.TextureLoader()
        textureLoader.load('/images/logo_black.png',
            (texture) => {
                console.log('Logo texture loaded successfully')
                const logoGeometry = new THREE.PlaneGeometry(1.5, 1.5)
                const logoMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    color: new Color(0x000000)
                })
                const logo = new THREE.Mesh(logoGeometry, logoMaterial)
                logo.position.set(0, 0, 0)
                scene.add(logo)

                // Animations
                // Supprimer ces lignes
                // gsap.to(logoMaterial, {
                //   opacity: 1,
                //   duration: 1.5,
                //   ease: 'power2.inOut'
                // })

                gsap.to(logo.scale, {
                    x: 1.1,
                    y: 1.1,
                    duration: 1.5,
                    yoyo: true,
                    repeat: -1,
                    ease: 'sine.inOut'
                })

                // Faire disparaître le loader après 5 secondes
                gsap.to(containerRef.current, {
                    opacity: 0,
                    duration: 6,
                    delay: 5, // Augmenté de 2 à 5 secondes
                    ease: 'power2.inOut',
                    onComplete: () => {
                        if (containerRef.current) {
                            containerRef.current.style.display = 'none'
                        }
                    }
                })
            },
            undefined,
            (error) => console.error('Error loading logo texture:', error)
        )


        // Animation loop
        const animate = () => {
            renderer.render(scene, camera)
        }

        gsap.ticker.add(animate)

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight
            camera.updateProjectionMatrix()
            renderer.setSize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            gsap.ticker.remove(animate)
            renderer.dispose()
            renderTarget.dispose()
            // logoMaterial.dispose() // Dispose after texture is loaded
            // logoGeometry.dispose() // Dispose after texture is loaded
            // logoTexture.dispose() // Dispose after texture is loaded
            // lottieAnimation.destroy()
        }
    }, [])

    return (
        <motion.div
            ref={containerRef}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <canvas ref={canvasRef} className="absolute inset-0" />
            {/* <div ref={lottieContainerRef} className="absolute w-64 h-64" /> */}
            <motion.div
                className="text-xl font-bold text-white relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                exit={{ opacity: 0, y: -20 }}
            >

            </motion.div>
        </motion.div>
    )
}

