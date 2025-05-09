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

// Enhanced ultra-smooth motion curves for 2025-level fluidity
const fluidMotionCurves: Record<IntensityLevel, number[]> = {
  subtle: [0.19, 0.87, 0.18, 1],
  medium: [0.16, 0.96, 0.24, 1],
  high: [0.13, 0.98, 0.26, 1],
  ultra: [0.08, 1.12, 0.17, 1], // Refined overshoot with better return curve
};

// Refined distance/scale maps with proper typing
const distanceMap: Record<IntensityLevel, number> = {
  subtle: 12, // More subtle initial position
  medium: 28,
  high: 42,
  ultra: 60, // Balanced for dramatic effect but natural motion
};

const scaleMap: Record<IntensityLevel, number> = {
  subtle: 0.975,
  medium: 0.952,
  high: 0.93,
  ultra: 0.90, // Balanced scale effect
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

// Ultra-smooth spring physics configuration with optimized values
const springConfig: Record<IntensityLevel, { stiffness: number; damping: number; mass: number }> = {
  subtle: { stiffness: 85, damping: 22, mass: 0.75 }, // Increased stiffness for more immediate response
  medium: { stiffness: 76, damping: 20, mass: 0.65 },
  high: { stiffness: 65, damping: 18, mass: 0.55 }, // Better stiffness/damping ratio
  ultra: { stiffness: 45, damping: 15, mass: 0.42 }, // Optimized for silky motion
};

// Enhanced velocity configuration for butter-smooth motion
const velocityControl: Record<IntensityLevel, number> = {
  subtle: 1.1, // Slight increase for smoother starts
  medium: 1.9,
  high: 2.4,
  ultra: 2.7, // Balanced for smooth acceleration
};

// New friction coefficients for more natural deceleration
const frictionCoefficients: Record<IntensityLevel, number> = {
  subtle: 0.95,
  medium: 0.92,
  high: 0.88,
  ultra: 0.85,
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
  
  // Optimized viewport detection with dynamic threshold
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold: animation === "slide-up" ? 0.01 : 0.03, // Ultra-sensitive for slide-up
    rootMargin: "0px 0px -5% 0px", // Refined trigger point for earlier animation
  });

  React.useEffect(() => {
    let frameId: number;
    
    if (inView) {
      // Double RAF for smoother animation scheduling
      frameId = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          controls.start("animate");
        });
      });
    } else if (!once) {
      frameId = requestAnimationFrame(() => {
        controls.start("initial");
      });
    }
    
    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [inView, controls, once]);

  // Type-safe initial state getter
  const getInitialState = () => {
    const animationObj = animations[animation];
    if (typeof animationObj.initial === "function") {
      return animationObj.initial(intensity);
    }
    return animationObj.initial;
  };

  // Ultra-enhanced transition with hyper-smooth configuration
  const getTransition = () => {
    // Optimized base duration for slide-up animation
    const baseDuration = animation === "slide-up" ? 
      (intensity === "ultra" ? 0.98 : 0.85) : duration;
    
    const transitionConfig = {
      delay,
      duration: baseDuration,
      ease: fluidMotionCurves[intensity],
    };
    
    // Super-optimized slide-up configuration with advanced physics
    if (animation === "slide-up") {
      return {
        ...transitionConfig,
        type: "spring",
        ...springConfig[intensity],
        velocity: velocityControl[intensity],
        friction: frictionCoefficients[intensity], // Added friction for more natural deceleration
        restSpeed: 0.0003, // Ultra-precise rest point
        restDelta: 0.0002, // Micro-level control over animation ending
        bounce: 0.02, // Subtle bounce for natural feel
      };
    }
    
    // Configuration for other animations
    return {
      ...transitionConfig,
      type: "spring",
      ...springConfig[intensity],
    };
  };

  // Advanced GPU acceleration for buttery smooth rendering
  const gpuStyle = {
    willChange: "transform, opacity",
    backfaceVisibility: "hidden" as const,
    perspective: 1200, // Enhanced perspective
    WebkitFontSmoothing: "antialiased" as const,
    transformStyle: "preserve-3d" as const,
    contain: "paint" as const, // Performance optimization
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
