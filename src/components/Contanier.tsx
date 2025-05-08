"use client";

import * as React from "react";
import { motion, useAnimation, MotionProps } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

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
  once?: boolean; // now controls repeated trigger
}

const animations = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
  "slide-up": {
    initial: { y: 25, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
  "slide-down": {
    initial: { y: -25, opacity: 0 },
    animate: { y: 0, opacity: 1 },
  },
  "slide-left": {
    initial: { x: 25, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
  "slide-right": {
    initial: { x: -25, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
  },
  none: {
    initial: {},
    animate: {},
  },
};

// Custom cubic-bezier ease curve
const customEase = [0.25, 0.1, 0.25, 1.0];

export const AnimationContainer = ({
  children,
  className,
  animation = "fade",
  delay = 0,
  duration = 0.7,
  once = false,            // ← default to false for repeat
  ...props
}: AnimationContainerProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    triggerOnce: once,      // tie to prop
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (inView) {
      controls.start("animate");
    } else if (!once) {
      // reset to initial when leaving if we want repeats
      controls.start("initial");
    }
  }, [inView, controls, once]);

  const { initial, animate } = animations[animation];

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial="initial"
      animate={controls}
      variants={{
        initial,
        animate,
      }}
      transition={{
        delay,
        duration,
        ease: customEase,
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimationContainer;
