"use client";


import { motion, useAnimation } from "motion/react";
import React, { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export const BlurredStagger = ({
  text = "we love hextaui.com ❤️",
  className = "",
  ...props
}) => {
  // get a ref and inView boolean
  const [ref, inView] = useInView({
    triggerOnce: false,  // allow repeated triggers
    threshold: 0.1,
  });

  // control animations manually
  const controls = useAnimation();

  useEffect(() => {
    // when it enters viewport, play "show"; when it leaves, go back to "hidden"
    controls.start(inView ? "show" : "hidden");
  }, [inView, controls]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.015,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
    },
  };

  return (
    <div ref={ref} className="w-full" {...props}>
      <motion.h1
        variants={container}
        initial="hidden"
        animate={controls}
        className={className}
        style={{ display: "block" }}
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            variants={letterAnimation}
            transition={{ duration: 0.3 }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.h1>
    </div>
  );
};