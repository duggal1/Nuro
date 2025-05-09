"use client";

import * as React from "react";
import { motion, useAnimation, MotionProps, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";


type IntensityLevel = "subtle" | "medium" | "high" | "ultra";

interface AnimationContainerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  animation?:
    | "fade"
    | "slide-up"
    | "slide-down"
    | "slide-left"
    | "slide-right"
    | "scale"
    | "none";
  delay?: number;
  duration?: number;
  once?: boolean;
  intensity?: IntensityLevel;
}

// 2025-level fluid motion curves - optimized for maximum smoothness
const fluidMotionCurves: Record<IntensityLevel, number[]> = {
  subtle: [0.23, 0.82, 0.22, 1],
  medium: [0.2, 0.94, 0.27, 1],
  high: [0.17, 0.99, 0.3, 1],
  ultra: [0.1, 1.15, 0.2, 1], // Increased overshoot for ultra level
};

// Distance/scale maps with proper typing
const distanceMap: Record<IntensityLevel, number> = {
  subtle: 15,
  medium: 30,
  high: 45,
  ultra: 65, // Increased for more dramatic effect
};

const scaleMap: Record<IntensityLevel, number> = {
  subtle: 0.97,
  medium: 0.95,
  high: 0.92,
  ultra: 0.88, // More dramatic scale effect
};

// Type-safe animation generators
const animations = {
  fade: {
    initial: () => ({ opacity: 0 }),
    animate: { opacity: 1 },
  },
  "slide-up": {
    initial: (intensity: IntensityLevel) => ({ 
      y: distanceMap[intensity], 
      opacity: 0 
    }),
    animate: { y: 0, opacity: 1 },
  },
  "slide-down": {
    initial: (intensity: IntensityLevel) => ({ 
      y: -distanceMap[intensity], 
      opacity: 0 
    }),
    animate: { y: 0, opacity: 1 },
  },
  "slide-left": {
    initial: (intensity: IntensityLevel) => ({ 
      x: distanceMap[intensity], 
      opacity: 0 
    }),
    animate: { x: 0, opacity: 1 },
  },
  "slide-right": {
    initial: (intensity: IntensityLevel) => ({ 
      x: -distanceMap[intensity], 
      opacity: 0 
    }),
    animate: { x: 0, opacity: 1 },
  },
  scale: {
    initial: (intensity: IntensityLevel) => ({ 
      scale: scaleMap[intensity], 
      opacity: 0 
    }),
    animate: { scale: 1, opacity: 1 },
  },
  none: {
    initial: () => ({}),
    animate: {},
  },
};

// Spring physics configuration with proper typing
const springConfig: Record<IntensityLevel, { stiffness: number; damping: number; mass: number }> = {
  subtle: { stiffness: 75, damping: 18, mass: 0.8 },
  medium: { stiffness: 65, damping: 16, mass: 0.7 },
  high: { stiffness: 55, damping: 14, mass: 0.6 },
  ultra: { stiffness: 40, damping: 10, mass: 0.45 }, // Even more responsive
};

// Velocity configuration with proper typing
const velocityControl: Record<IntensityLevel, number> = {
  subtle: 1,
  medium: 1.8,
  high: 2.3,
  ultra: 2.8, // Increased for even more initial momentum
};

export const AnimationContainer = ({
  children,
  className,
  animation = "fade",
  delay = 0,
  duration = 0.7,
  once = false,
  intensity = "high",
  ...props
}: AnimationContainerProps) => {
  const controls = useAnimation();
  
  // Even more sensitive viewport detection
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: 0.03, // Ultra-sensitive
    rootMargin: "0px 0px -8% 0px", // Optimized trigger point
  });

  React.useEffect(() => {
    if (inView) {
      // Performance optimization with RAF
      requestAnimationFrame(() => {
        controls.start("animate");
      });
    } else if (!once) {
      requestAnimationFrame(() => {
        controls.start("initial");
      });
    }
  }, [inView, controls, once]);

  // Type-safe initial state getter
  const getInitialState = () => {
    const animationObj = animations[animation];
    if (typeof animationObj.initial === "function") {
      return animationObj.initial(intensity);
    }
    return animationObj.initial;
  };

  // Enhanced transition with ultra-smooth configuration
  const getTransition = () => {
    const baseDuration = animation === "slide-up" ? 
      (intensity === "ultra" ? 1 : 0.88) : duration;
    
    const transitionConfig = {
      delay,
      duration: baseDuration,
      ease: fluidMotionCurves[intensity],
    };
    
    // Hyper-optimized slide-up configuration
    if (animation === "slide-up") {
      return {
        ...transitionConfig,
        type: "spring",
        ...springConfig[intensity],
        velocity: velocityControl[intensity],
        restSpeed: 0.0005, // Even more precise rest point
        restDelta: 0.0005, // Ultra-fine control over animation ending
      };
    }
    
    // Configuration for other animations
    return {
      ...transitionConfig,
      type: "spring",
      ...springConfig[intensity],
    };
  };

  // Advanced GPU acceleration for silky smooth rendering
  const gpuStyle = {
    willChange: "transform, opacity",
    backfaceVisibility: "hidden" as const,
    perspective: 1000,
    WebkitFontSmoothing: "antialiased" as const,
    transformStyle: "preserve-3d" as const, // Enhanced 3D context
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={ref}
        className={cn(className)}
        initial={getInitialState()}
        animate={inView ? "animate" : getInitialState()}
        variants={{
          animate: animations[animation].animate,
        }}
        transition={getTransition()}
        style={gpuStyle}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimationContainer;