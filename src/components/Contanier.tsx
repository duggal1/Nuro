
"use client";

import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimationContainerProps extends MotionProps {
    children: React.ReactNode;
    className?: string;
    animation?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale" | "none";
    delay?: number;
    duration?: number;
    once?: boolean;
}

const animations = {
    "fade": {
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
    "scale": {
        initial: { scale: 0.95, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
    },
    "none": {
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
    once = true,
    ...props
}: AnimationContainerProps) => {
    return (
        <motion.div
            className={cn(className)}
            initial={animations[animation].initial}
            whileInView={animations[animation].animate}
            viewport={{ once, margin: "0px 0px -100px 0px" }}
            transition={{
                delay,
                duration,
                ease: customEase,
                type: "spring",
                stiffness: 100,
                damping: 20
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default AnimationContainer;