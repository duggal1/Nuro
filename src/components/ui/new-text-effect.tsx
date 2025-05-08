"use client";

import { motion, useAnimation } from "framer-motion";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface BlurredStaggerProps {
  text: string;
  className?: string;
  [key: string]: any;
}

export const BlurredStagger: React.FC<BlurredStaggerProps> = ({
  text,
  className = "",
  ...props
}) => {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.2,
    rootMargin: "-10px",
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [inView, controls]);

  // Split text into lines based on <br> tags
  const lines = text.split(/<br\s*\/?>/i);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.1,
        ease: [0.22, 1, 0.36, 1], // Custom easing
      },
    },
  };

  const lineContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      y: 40,
      opacity: 0,
      rotateX: -40,
      filter: "blur(10px)",
    },
    visible: {
      y: 0,
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`relative perspective-1000 ${className}`}
      aria-label={text.replace(/<br\s*\/?>/gi, '\n')}
      {...props}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate={controls}
        className="flex flex-col gap-2"
      >
        {lines.map((line, lineIndex) => (
          <motion.span
            key={lineIndex}
            variants={lineContainer}
            className="inline-block"
          >
            {line.split("").map((char, charIndex) => (
              <motion.span
                key={`${lineIndex}-${charIndex}`}
                variants={letterAnimation}
                className="inline-block origin-top"
                style={{
                  whiteSpace: 'pre',
                  willChange: 'transform',
                  transformStyle: 'preserve-3d',
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        ))}
      </motion.div>
    </motion.div>
  );
};