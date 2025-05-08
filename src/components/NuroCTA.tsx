"use client"

import { Button } from "@/components/ui/button"
import { NeonMaze } from "@/components/ui/neon-maze"

import { motion } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Dna } from "lucide-react"
import AnimationContainer from "./Contanier"

export function NuroCTA() {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Register ScrollTrigger plugin
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }
    setMounted(true);
    
    return () => {
      // Clean up ScrollTrigger
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || !textRef.current || !cardRef.current) return;
    
    // Ultra-smooth main timeline with enhanced easing
    const mainTl = gsap.timeline({ 
      defaults: { 
        ease: "expo.out",
        duration: 0.65
      }
    });
    
    // Text animations with refined staggering and a slight bounce
    const animateItems = textRef.current.getElementsByClassName("animate-item");
    mainTl.fromTo(
      animateItems,
      { 
        y: 25,
        opacity: 0,
        scale: 0.98
      },
      { 
        y: 0, 
        opacity: 1,
        scale: 1,
        stagger: 0.08,
        clearProps: "all" 
      }
    );
    
    // Premium card animation with better timing and physics
    const cardTl = gsap.timeline({
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top bottom-=120",
        toggleActions: "play none none reverse",
        markers: false
      }
    });
    
    // Feature items animated with a sleek slide-in
    cardTl.fromTo(
      cardRef.current.querySelectorAll(".feature-item"),
      { 
        x: 15,
        opacity: 0,
        scale: 0.97
      },
      { 
        x: 0, 
        opacity: 1,
        scale: 1,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "all" 
      }
    );
    
    // Enhanced background pulse animation with subtle motion
    const pulseAnimation = gsap.to(
      containerRef.current.querySelector(".bg-pulse"),
      {
        opacity: 0.35,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      }
    );
    
    // Add subtle hover animations for interactive elements
    const buttons = document.querySelectorAll("button");
    buttons.forEach(button => {
      button.addEventListener("mouseenter", () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.25,
          ease: "power1.out"
        });
      });
      
      button.addEventListener("mouseleave", () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.25,
          ease: "power1.out"
        });
      });
    });
    
    return () => {
      // Clean up all animations
      mainTl.kill();
      cardTl.kill();
      pulseAnimation.kill();
      
      // Remove event listeners
      buttons.forEach(button => {
        button.removeEventListener("mouseenter", () => {});
        button.removeEventListener("mouseleave", () => {});
      });
    };
  }, [mounted]);

  return (
    <section 
      ref={containerRef} 
      className="relative overflow-hidden bg-gradient-to-b from-white to-slate-100 dark:from-slate-950 dark:to-black transition-colors duration-300 rounded-3xl mx-auto max-w-[95%] lg:max-w-[85%]"
    >

         <AnimationContainer animation="slide-up" delay={0.3} duration={0.8}>

      <div className="absolute inset-0 bg-pulse opacity-20 pointer-events-none transition-opacity">
        <NeonMaze />
      </div>
      <div className="absolute inset-0 bg-gradient-radial from-indigo-500/10 via-transparent to-transparent dark:from-indigo-500/20 pointer-events-none" />
      
      <div className="container relative z-10 grid items-center grid-cols-1 gap-6 py-12 md:py-16 md:grid-cols-2 lg:gap-8 max-w-5xl mx-auto px-4">
        {/* Text content section - Improved text alignment and spacing */}
        <div ref={textRef} className="flex flex-col items-start gap-4 md:gap-5 pr-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex items-center gap-2  pl-12 animate-item"
          >
            <Dna className="text-fuchsia-600 dark:text-pink-600 w-7 h-7 hover:animate-spin " />
            <span className="font-serif font-medium text-slate-700 dark:text-white/80 tracking-wide   text-sm">
           
            Biotech Innovation</span>
          </motion.div>
          
          <h2 className="font-serif text-3xl pl-12 font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl xl:text-5xl leading-tight animate-item">
            Redefining DNA Analysis with Machine Learning
          </h2>
          
          <p className="text-lg text-slate-700 dark:text-white/80 leading-relaxed max-w-md animate-item pl-12">
            Nuro combines cutting-edge genomic research with advanced machine learning to accelerate discoveries and transform healthcare.
          </p>
          
          <div className="flex flex-wrap gap-3 mt-3  pl-10 animate-item">
            <Button 
              size="lg" 
              className="bg-gradient-to-bl from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 hover:scale-105 transition-all duration-300 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/20"
            >
              Start Free Trial
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-slate-300 dark:border-white/20 text-slate-800 dark:text-white hover:bg-gray-200 pl-10 dark:hover:bg-white/10 rounded-xl hover:scale-105 transition-all duration-300"
            >
              Book a Demo
            </Button>
          </div>
        </div>
        
        {/* Card section - More compact and refined */}
        <motion.div 
          ref={cardRef}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="relative p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden group"
        >
         
      
          
          <h3 className="font-serif text-xl font-semibold text-slate-900 dark:text-white mb-4 mt-1 relative pl-1">DNA + Machine Learning</h3>
          
          <div className="space-y-3 relative">
            <motion.div className="feature-item flex items-start gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800/50 transition-colors duration-200">
              <div className="p-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22v-5" /><path d="M9 7V2" /><path d="M15 7V2" /><path d="M5 16c5.5 2 12.5 2 18 0" />
                  <path d="M5 16V2" /><path d="M23 16V2" /><path d="M12 22c-4.4 0-8-3.6-8-8v-4" /><path d="M20 10v4c0 4.4-3.6 8-8 8" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Advanced Genomic Analysis</p>
                <p className="text-xs text-slate-600 dark:text-white/70">Process millions of genomic sequences in minutes</p>
              </div>
            </motion.div>
            
            <motion.div className="feature-item flex items-start gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800/50 transition-colors duration-200">
              <div className="p-1.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="10" x="3" y="8" rx="2" /><path d="M10 8V5c0-1.1.9-2 2-2s2 .9 2 2v3" />
                  <path d="M7 15h0M12 15h0M17 15h0" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">AI-Driven Insights</p>
                <p className="text-xs text-slate-600 dark:text-white/70">Machine learning models on vast genomic datasets</p>
              </div>
            </motion.div>
            
            <motion.div className="feature-item flex items-start gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800/50 transition-colors duration-200">
              <div className="p-1.5 rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                  <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Research Acceleration</p>
                <p className="text-xs text-slate-600 dark:text-white/70">Reduce discovery timeline from years to months</p>
              </div>
            </motion.div>
            
            <motion.div className="feature-item flex items-start gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-800/50 transition-colors duration-200">
              <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 2a5 5 0 0 1 5 5v3a3 3 0 0 0 6 0V7a5 5 0 0 1 10 0v6a3 3 0 0 0 6 0v-4" />
                  <path d="M22 22a5 5 0 0 1-5-5v-3a3 3 0 0 0-6 0v3a5 5 0 0 1-10 0v-6a3 3 0 0 0-6 0v4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Precision Healthcare</p>
                <p className="text-xs text-slate-600 dark:text-white/70">Personalized solutions based on genetic profiles</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
     </AnimationContainer>
    </section>
  )
}