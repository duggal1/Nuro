"use client"

import { Gemini, Replit, MagicUI, VSCodium, MediaWiki, GooglePaLM } from '@/components/logos'

import { cn } from '@/lib/utils'
import React, { useRef, useEffect } from 'react'
import { AnimatedBeam } from '@/components/magicui/animated-beam'
import { BlurredStagger } from './ui/blurred-stagger-text'
import Nurocta from './blocks/cta/cta'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import AnimationContainer from './Contanier'

export default function IntegrationsBeam() {
    // Add typed refs for the container and each integration card
    const containerRef = useRef<HTMLDivElement>(null);
    const div1Ref = useRef<HTMLDivElement>(null); // left-top (Gemini)
    const div2Ref = useRef<HTMLDivElement>(null); // left-middle (Replit)
    const div3Ref = useRef<HTMLDivElement>(null); // left-bottom (MagicUI)
    const div4Ref = useRef<HTMLDivElement>(null); // center (LogoIcon)
    const div5Ref = useRef<HTMLDivElement>(null); // right-top (VSCodium)
    const div6Ref = useRef<HTMLDivElement>(null); // right-middle (MediaWiki)
    const div7Ref = useRef<HTMLDivElement>(null); // right-bottom (GooglePaLM)
    const sectionRef = useRef<HTMLDivElement>(null);

    // GSAP animation for enhanced motion effects
    useEffect(() => {
        if (!containerRef.current) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sectionRef.current,
                start: "top 60%",
                end: "bottom 40%",
                toggleActions: "play none none reverse"
            }
        });

        // Animate the main logo and cards
        tl.fromTo(div4Ref.current, 
            { scale: 0, opacity: 0 }, 
            { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
        );

        // Animate the surrounding cards with staggered delay
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        [div1Ref, div2Ref, div3Ref, div5Ref, div6Ref, div7Ref].forEach((ref, index) => {
            tl.fromTo(ref.current,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)" },
                "-=0.4"
            );
        });

        return () => {
            tl.kill();
        };
    }, []);

    return (
        <section ref={sectionRef} className="relative">
              <AnimationContainer animation="slide-up" delay={0.3} duration={0.8}>
            <div className="bg-white dark:bg-background py-24 md:py-32">
                <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-12">
                    {/* Integrations Beam on LEFT */}
                    <div className="w-full md:w-1/2">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                        >
                            <div ref={containerRef} className="relative mx-auto flex max-w-sm items-center justify-between">
                                <div className="space-y-6">
                                    <IntegrationCard position="left-top" ref={div1Ref}>
                                        <Gemini />
                                    </IntegrationCard>
                                    <IntegrationCard position="left-middle" ref={div2Ref}>
                                        <Replit />
                                    </IntegrationCard>
                                    <IntegrationCard position="left-bottom" ref={div3Ref}>
                                        <MagicUI />
                                    </IntegrationCard>
                                </div>
                                <div className="mx-auto my-2 flex w-fit justify-center gap-2">
                                    <div className="bg-muted relative z-20 rounded-2xl border p-1">
                                        <IntegrationCard
                                            className="shadow-black-950/10 dark:bg-background size-16 border-black/25 shadow-xl dark:border-white/25 dark:shadow-white/10"
                                            isCenter={true}
                                            ref={div4Ref}>
                                            <Link
                                                                          href="/"
                                                                          aria-label="home"
                                                                         >
                                                                       <Image
                                                                              src="/nuro1.png"
                                                                              alt="Logo"
                                                                              width={40}
                                                                              height={40}
                                                                              className=' hover:animate-ping'
                                                                              
                                                                          />
                                                                         
                                                                    
                                                                      </Link>
                                        </IntegrationCard>
                                    </div>
                                </div>
                                <div
                                    role="presentation"
                                    className="absolute inset-1/3 bg-[radial-gradient(var(--dots-color)_1px,transparent_1px)] opacity-50 [--dots-color:black] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:[--dots-color:white]"></div>

                                <div className="space-y-6">
                                    <IntegrationCard position="right-top" ref={div5Ref}>
                                        <VSCodium />
                                    </IntegrationCard>
                                    <IntegrationCard position="right-middle" ref={div6Ref}>
                                        <MediaWiki />
                                    </IntegrationCard>
                                    <IntegrationCard position="right-bottom" ref={div7Ref}>
                                        <GooglePaLM />
                                    </IntegrationCard>
                                </div>
                                
                                {/* Top-left featured connection - high intensity */}
                                <AnimatedBeam 
                                    containerRef={containerRef} 
                                    fromRef={div1Ref} 
                                    toRef={div4Ref} 
                                    curvature={-75} 
                                    endYOffset={-10}
                                    intensity="high"
                                    beamCount={6}
                                    gradientStartColor="#6366f1"
                                    gradientStopColor="#ec4899" 
                                />
                                
                                {/* Middle connections - medium intensity */}
                                <AnimatedBeam 
                                    containerRef={containerRef} 
                                    fromRef={div2Ref} 
                                    toRef={div4Ref}
                                    intensity="medium"
                                    beamCount={4}
                                    delay={0.5}
                                    gradientStartColor="#3b82f6"
                                    gradientStopColor="#10b981"
                                />
                                
                                <AnimatedBeam 
                                    containerRef={containerRef} 
                                    fromRef={div3Ref} 
                                    toRef={div4Ref} 
                                    curvature={75} 
                                    endYOffset={10}
                                    intensity="medium"
                                    beamCount={4}
                                    delay={1}
                                    gradientStartColor="#8b5cf6"
                                    gradientStopColor="#f59e0b"
                                />
                                
                                {/* Right side connections - mixed intensities */}
                                <AnimatedBeam 
                                    containerRef={containerRef} 
                                    fromRef={div5Ref} 
                                    toRef={div4Ref} 
                                    curvature={-75} 
                                    endYOffset={-10} 
                                    reverse
                                    intensity="high"
                                    beamCount={5}
                                    delay={0.2}
                                    gradientStartColor="#0ea5e9"
                                    gradientStopColor="#f43f5e"
                                />
                                
                                <AnimatedBeam 
                                    containerRef={containerRef} 
                                    fromRef={div6Ref} 
                                    toRef={div4Ref} 
                                    reverse
                                    intensity="medium"
                                    beamCount={4}
                                    delay={0.7}
                                    gradientStartColor="#14b8a6"
                                    gradientStopColor="#a855f7"
                                />
                                
                                <AnimatedBeam 
                                    containerRef={containerRef} 
                                    fromRef={div7Ref} 
                                    toRef={div4Ref} 
                                    curvature={75} 
                                    endYOffset={10} 
                                    reverse
                                    intensity="high"
                                    beamCount={6}
                                    delay={1.2}
                                    gradientStartColor="#6366f1"
                                    gradientStopColor="#ec4899"
                                />
                            </div>
                                  
                            <motion.div 
                                className="mx-auto text-center mt-12"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                            >
                                <BlurredStagger 
                                    text="Integrate Nuro with your favorite tools" 
                                    className="
                                        text-balance 
                                        text-2xl font-semibold md:text-3xl 
                                        text-gray-600 dark:text-gray-50
                                    "
                                />
                                <BlurredStagger 
                                    text="and supercharge your workflow" 
                                    className="
                                        text-balance 
                                        text-2xl font-semibold md:text-3xl 
                                        text-gray-600 dark:text-gray-50 mt-2
                                    "
                                />
                            </motion.div>
                        </motion.div>
                    </div>
                    
                    {/* Nuro CTA on RIGHT */}
                    <div
                        className="w-full pl-16 "      
                    >
                        <Nurocta />
                    </div>
                </div>
            </div>
            </AnimationContainer>
        </section>
    )
}

// Define proper interface for IntegrationCard props
interface IntegrationCardProps {
    children: React.ReactNode;
    className?: string;
    position?: 'left-top' | 'left-middle' | 'left-bottom' | 'right-top' | 'right-middle' | 'right-bottom';
    isCenter?: boolean;
}

// Modified to accept ref forwarding with proper typing
const IntegrationCard = React.forwardRef<HTMLDivElement, IntegrationCardProps>(
    ({ children, className, position, isCenter = false }, ref) => {
        return (
            <div 
                ref={ref}
                className={cn('bg-background relative flex size-12 rounded-xl border dark:bg-transparent', className)}>
                <div className={cn('relative z-20 m-auto size-fit *:size-6', isCenter && '*:size-8')}>{children}</div>
                {position && !isCenter && (
                    <div
                        className={cn(
                            'bg-linear-to-r to-muted-foreground/25 absolute z-10 h-px',
                            position === 'left-top' && 'left-full top-1/2 w-[130px] origin-left rotate-[25deg]',
                            position === 'left-middle' && 'left-full top-1/2 w-[120px] origin-left',
                            position === 'left-bottom' && 'left-full top-1/2 w-[130px] origin-left rotate-[-25deg]',
                            position === 'right-top' && 'bg-linear-to-l right-full top-1/2 w-[130px] origin-right rotate-[-25deg]',
                            position === 'right-middle' && 'bg-linear-to-l right-full top-1/2 w-[120px] origin-right',
                            position === 'right-bottom' && 'bg-linear-to-l right-full top-1/2 w-[130px] origin-right rotate-[25deg]'
                        )}
                    />
                )}
            </div>
        )
    }
);

IntegrationCard.displayName = 'IntegrationCard';