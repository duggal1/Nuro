/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useId, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
// Import the slim version of tsparticles
import { loadSlim } from "@tsparticles/slim" // loads tsparticles-slim

interface SparklesProps {
  className?: string;
  background?: string;
  size?: number;
  minSize?: number | null;
  density?: number;
  speed?: number;
  minSpeed?: number | null;
  opacity?: number;
  opacitySpeed?: number;
  minOpacity?: number | null;
  color?: string;
  options?: Record<string, any>;
}

export const Sparkles: React.FC<SparklesProps> = ({
  className,
  size = 1,
  minSize = null,
  density = 800,
  speed = 6,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = "#FFFFFF",
  background = "transparent",
  options = {},
}) => {
  // State to track if the particle engine is ready
  const [isReady, setIsReady] = useState(false)

  // Effect to initialize the particle engine on component mount
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // Load the slim version of the engine
      await loadSlim(engine)
    }).then(() => {
      // Set ready state to true once loaded
      setIsReady(true)
    })
  }, []) // Empty dependency array ensures this runs only once on mount

  // Generate a unique ID for the particles container
  const id = useId()

  // Define the default particle options
  const defaultOptions = {
    background: {
      color: {
        value: background, // Set background color
      },
    },
    fullScreen: {
      enable: false, // Don't make the canvas full screen by default
      zIndex: 1, // Set z-index if full screen
    },
    fpsLimit: 120, // Limit frames per second for performance
    particles: {
      color: {
        value: color, // Set particle color
      },
      move: {
        enable: true,
        direction: "top",
        speed: {
          min: minSpeed || speed / 2,
          max: speed,
        },
        straight: true,
        outModes: {
          default: "none",  // Changed from "out" to "none"
          top: "bounce",    // Changed from "destroy" to "bounce"
          bottom: "bounce", // Added bottom bounce
        },
      },
      number: {
        value: density,
        density: {
          enable: true,
          value_area: 800,  // Added density area control
        }
      },
      opacity: {
        value: {
          min: minOpacity || opacity / 10,
          max: opacity,
        },
        animation: {
          enable: true, // Enable opacity animation
          sync: false, // Don't sync opacity animation
          speed: opacitySpeed, // Set opacity animation speed
        },
      },
      size: {
        value: {
          min: minSize || size / 2.5,
          max: size,
        },
      },
    },
    retina_detect: true,
    fps_limit: 60,
    emitters: {  // Added emitters for continuous particle generation
      direction: "top",
      life: {
        count: 0,  // Infinite emissions
        duration: 0.1,
        delay: 0.1
      },
      rate: {
        delay: 0.01,
        quantity: 1
      },
      size: {
        width: 100,
        height: 0
      },
      position: {
        y: 100,
        x: 50
      }
    }
  }

  // Render the Particles component only when the engine is ready
  return isReady && <Particles id={id} options={{ ...defaultOptions, ...options }} className={className} />
}

// Example Usage (Optional - requires a parent React component)
/*
function App() {
  return (
    <div style={{ height: '100vh', position: 'relative', background: '#000' }}>
      <Sparkles
        className="absolute inset-0" // Make it cover the parent div
        background="transparent"
        minSize={0.4}
        size={1.4}
        speed={5} // Adjust speed as needed
        minSpeed={1}
        density={1000} // Adjust density
        color="#FFFFFF"
        opacity={0.8}
        minOpacity={0.1}
        opacitySpeed={2}
      />
      <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-4xl z-10">
        Particles Rising
      </h1>
    </div>
  );
}

export default App; // Make sure to export if this is your main app component
*/
