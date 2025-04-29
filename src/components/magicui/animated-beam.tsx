/* eslint-disable prefer-const */
"use client";

import { motion } from "motion/react";
import { RefObject, useEffect, useId, useState } from "react";

import { cn } from "@/lib/utils";

export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>; // Container ref
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  pathColor?: string;
  pathWidth?: number;
  pathOpacity?: number;
  gradientStartColor?: string;
  gradientStopColor?: string;
  delay?: number;
  duration?: number;
  startXOffset?: number;
  startYOffset?: number;
  endXOffset?: number;
  endYOffset?: number;
  beamCount?: number; // Number of beams to display
  intensity?: "low" | "medium" | "high"; // Control beam intensity
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = Math.random() * 2 + 3.5, // Slightly faster base duration
  delay = 0,
  pathColor = "#e2e8f0", // Slightly lighter path color
  pathWidth = 1.5, // Thinner background path
  pathOpacity = 0.15, // Slightly more subtle
  gradientStartColor,
  gradientStopColor,
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
  beamCount = 5, // Increased to 5 beams
  intensity = "medium", // Default medium intensity
}) => {
  const baseId = useId();
  const [pathD, setPathD] = useState("");
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });

  // Modern gradient color pairs based on the type of connection
  const gradientPairs = [
    { start: "#6366f1", stop: "#ec4899" }, // Indigo to Pink
    { start: "#3b82f6", stop: "#10b981" }, // Blue to Green
    { start: "#8b5cf6", stop: "#f59e0b" }, // Purple to Amber
    { start: "#0ea5e9", stop: "#f43f5e" }, // Sky to Rose
    { start: "#14b8a6", stop: "#a855f7" }, // Teal to Purple
  ];

  // Apply intensity settings
  const intensitySettings = {
    low: {
      opacity: 0.4,
      strokeWidth: pathWidth * 0.8,
      staggerDelay: 0.8,
      durationVariance: 0.4,
    },
    medium: {
      opacity: 0.65,
      strokeWidth: pathWidth,
      staggerDelay: 0.5,
      durationVariance: 0.3,
    },
    high: {
      opacity: 0.85,
      strokeWidth: pathWidth * 1.2,
      staggerDelay: 0.3,
      durationVariance: 0.2,
    },
  }[intensity];

  // Calculate the gradient coordinates based on the reverse prop
  const gradientCoordinates = reverse
    ? {
        x1: ["90%", "-10%"],
        x2: ["100%", "0%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }
    : {
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      };

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const rectA = fromRef.current.getBoundingClientRect();
        const rectB = toRef.current.getBoundingClientRect();

        const svgWidth = containerRect.width;
        const svgHeight = containerRect.height;
        setSvgDimensions({ width: svgWidth, height: svgHeight });

        const startX =
          rectA.left - containerRect.left + rectA.width / 2 + startXOffset;
        const startY =
          rectA.top - containerRect.top + rectA.height / 2 + startYOffset;
        const endX =
          rectB.left - containerRect.left + rectB.width / 2 + endXOffset;
        const endY =
          rectB.top - containerRect.top + rectB.height / 2 + endYOffset;

        // Calculate control point for the quadratic curve
        const midX = (startX + endX) / 2;
        const controlY = startY - curvature;
        
        const d = `M ${startX},${startY} Q ${midX},${controlY} ${endX},${endY}`;
        setPathD(d);
      }
    };

    // Initialize ResizeObserver
    const resizeObserver = new ResizeObserver(() => updatePath());

    // Observe the container element
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);

      // Also observe parent elements for more robust resize handling
      let parent = containerRef.current.parentElement;
      if (parent) resizeObserver.observe(parent);
      
      // Window resize events can also affect positioning
      window.addEventListener("resize", updatePath);
    }

    // Call the updatePath initially to set the initial path
    updatePath();

    // Clean up the observer on component unmount
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updatePath);
    };
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ]);

  // Create array of beam indexes
  const beams = Array.from({ length: beamCount }, (_, i) => i);

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "pointer-events-none absolute left-0 top-0 transform-gpu stroke-2 z-10",
        className,
      )}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      {/* Background path */}
      <path
        d={pathD}
        stroke={pathColor}
        strokeWidth={pathWidth}
        strokeOpacity={pathOpacity}
        strokeLinecap="round"
      />

      {/* Multiple beam paths with different gradients and timings */}
      {beams.map((index) => {
        const id = `${baseId}-${index}`;
        const colorIndex = index % gradientPairs.length;
        const colors = gradientPairs[colorIndex];
        
        // Customized colors if provided
        const startColor = index === 0 && gradientStartColor ? gradientStartColor : colors.start;
        const stopColor = index === 0 && gradientStopColor ? gradientStopColor : colors.stop;
        
        // Stagger delays for more natural flow
        const staggeredDelay = delay + index * intensitySettings.staggerDelay; 
        
        // Slightly varying durations for visual interest
        const baseDuration = duration * (1.0 - (index % 2) * intensitySettings.durationVariance);
        const adjustedDuration = baseDuration * (0.9 + Math.random() * 0.2);
        
        return (
          <g key={id}>
            <path
              d={pathD}
              strokeWidth={intensitySettings.strokeWidth}
              stroke={`url(#${id})`}
              strokeOpacity={intensitySettings.opacity}
              strokeLinecap="round"
            />
            <defs>
              <motion.linearGradient
                className="transform-gpu"
                id={id}
                gradientUnits={"userSpaceOnUse"}
                initial={{
                  x1: "0%",
                  x2: "0%",
                  y1: "0%",
                  y2: "0%",
                }}
                animate={{
                  x1: gradientCoordinates.x1,
                  x2: gradientCoordinates.x2,
                  y1: gradientCoordinates.y1,
                  y2: gradientCoordinates.y2,
                }}
                transition={{
                  delay: staggeredDelay,
                  duration: adjustedDuration,
                  ease: [0.16, 1, 0.3, 1], // https://easings.net/#easeOutExpo
                  repeat: Infinity,
                  repeatDelay: 0,
                }}
              >
                <stop stopColor={startColor} stopOpacity="0"></stop>
                <stop stopColor={startColor} stopOpacity="0.85"></stop>
                <stop offset="32.5%" stopColor={stopColor} stopOpacity="0.9"></stop>
                <stop
                  offset="100%"
                  stopColor={stopColor}
                  stopOpacity="0"
                ></stop>
              </motion.linearGradient>
            </defs>
          </g>
        );
      })}
    </svg>
  );
};