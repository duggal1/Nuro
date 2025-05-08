"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { BlurredStagger } from './ui/blurred-stagger-text'
import AnimationContainer from './Contanier'

export default function CommunitySections() {
    const containerRef = useRef(null)
    const avatarsRef = useRef(null)
    
    useEffect(() => {
        // Simple entrance animation for the container
        gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        )
        
        // Animate the avatars container
        if (avatarsRef.current && avatarsRef.current.children) {
            gsap.fromTo(
                avatarsRef.current.children,
                { opacity: 0, scale: 0.8, y: 15 },
                { 
                    opacity: 1, 
                    scale: 1, 
                    y: 0, 
                    duration: 0.7, 
                    stagger: 0.06,
                    ease: "back.out(1.7)"
                }
            )
            
            // Add a subtle floating animation to avatars
            gsap.to(
                avatarsRef.current.children,
                {
                    y: '-8px',
                    duration: 1.5,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    stagger: 0.1
                }
            )
        }
    }, [])
    
    // Enhanced avatar hover animations
    const avatarVariants = {
        initial: { scale: 1 },
        hover: { 
            scale: 1.2,
            transition: { 
                type: "spring", 
                stiffness: 500, 
                damping: 12,
                duration: 0.3 
            }
        }
    }
    
    // Enhanced image hover animations
    const imageVariants = {
        initial: { 
            filter: "grayscale(30%)",
            transition: { duration: 0.3 }
        },
        hover: { 
            filter: "grayscale(0%)",
            rotate: 10,
            transition: { 
                duration: 0.4,
                ease: "easeOut"
            }
        }
    }
    
    return (
        <section className="py-16 md:py-24 overflow-hidden">
              <AnimationContainer animation="slide-up" delay={0.3} duration={0.8}>
            <div ref={containerRef} className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <BlurredStagger 
                        text="Thousands of Researchers and Scientists using Nuro" 
                        className="text-3xl font-bold text-black dark:text-white mb-4"
                    />
                <p
                    className="  text-gray-500 dark:text-gray-200 text-lg max-w-2xl mx-auto"
                >
                        Join our community of experts refining what we can do with DNA gene sequencing
                    </p>
                </div>
                
                <div 
                    ref={avatarsRef}
                    className="mx-auto mt-12 flex max-w-lg flex-wrap justify-center gap-5"
                >
                    {Array.from({ length: 15 }).map((_, i) => (
                        <div key={i}>
                            <Link href="#" title={`Researcher ${i + 1}`}>
                                <motion.div 
                                    className="size-16 rounded-full border border-gray-200 dark:border-gray-700 overflow-hidden"
                                    variants={avatarVariants}
                                    initial="initial"
                                    whileHover="hover"
                                    whileTap={{ scale: 0.9, rotate: -5 }}
                                >
                                    <motion.img 
                                        alt={`Researcher ${i + 1}`} 
                                        src={`https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${(i % 10) + 1}.jpg`} 
                                        loading="lazy" 
                                        width={100} 
                                        height={100}
                                        className="size-full rounded-full object-cover"
                                        variants={imageVariants}
                                    />
                                </motion.div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            </AnimationContainer>
        </section>
    )
}