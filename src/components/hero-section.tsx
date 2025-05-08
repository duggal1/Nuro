/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'


import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { BlurredStagger } from './ui/blurred-stagger-text'

export default function HeroSection() {
    // Properly type the video reference as HTMLVideoElement
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Ensure video plays smoothly
        if (videoRef.current) {
            videoRef.current.playbackRate = 0.8; // Slightly slower for smoother appearance
            videoRef.current.play().catch((e: any) => console.log('Video autoplay prevented:', e));
        }
    }, []);

    return (
        <>
            <main className="overflow-x-hidden">
                <section className="relative min-h-screen">
                    {/* Video Background with improved overlay for better dark/light mode handling */}
                    <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10"></div>
                        {/* Enhanced gradient overlay that works better in both modes */}

                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            loop
                            className="absolute inset-0 h-full w-full object-cover opacity-90 dark:opacity-70"
                            style={{ 
                                transform: 'scale(1.05)',
                                transition: 'transform 0.5s ease-out',
                                filter: 'brightness(0.95) contrast(1.1) dark:brightness(0.85)'
                            }}
                        >
                            <source src="/video/nurovid.mp4" type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>

                    <div className="relative z-10 py-24 md:pb-32 lg:pb-36 lg:pt-72">
                        <div className="relative mx-auto flex max-w-7xl flex-col px-6 lg:block lg:px-12">
                            <div className="mx-auto max-w-lg text-center lg:ml-0 lg:max-w-full lg:text-left">
                                {/* Improved heading alignment and styling */}
                                <div className="space-y-2">
                                    
                                <BlurredStagger
        text="Analyze and Build with"
        className="text-7xl font-black text-gray-800  dark:text-white "
      />
                 <BlurredStagger
        text="Genomic Data"
        className="text-7xl font-black text-gray-800 dark:text-white "
      />
                     
                                </div>

 


                                <div className="mt-12 flex flex-col items-center justify-center gap-2 sm:flex-row lg:justify-start">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="h-12 rounded-full pl-5 pr-3 text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 transition-all duration-300 shadow-lg">
                                        <Link href="#link">
                                            <span className="text-nowrap">Start Building</span>
                                            <ChevronRight className="ml-1" />
                                        </Link>
                                    </Button>
                                    <Button
                                        key={2}
                                        asChild
                                        size="lg"
                                        variant="ghost"
                                        className="h-12 rounded-full px-5 text-base hover:bg-zinc-950/5 border border-indigo-400/20 backdrop-blur-sm dark:hover:bg-white/5 dark:border-indigo-400/30">
                                        <Link href="#link">
                                            <span className="text-nowrap">Request a demo</span>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}