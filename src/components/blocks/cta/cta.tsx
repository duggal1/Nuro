import { useState, useEffect, useRef } from "react";
import { MousePointer2, Star, Sparkles, Wand2 } from "lucide-react";

const Nurocta: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 100, y: 100 });
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [opacity, setOpacity] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the main container

  // Array of cursor icons to cycle through
  const cursorIcons = [
    <MousePointer2 key="pointer" className="fill-violet-500 stroke-white" size={30} />,
    <Star key="star" className="fill-yellow-400 stroke-amber-600" size={32} />,
    <Sparkles key="sparkles" className="fill-blue-400 stroke-white" size={30} />,
    <Wand2 key="wand" className="fill-pink-400 stroke-white" size={30} />
  ];

  // Array of follower content to cycle through
  const followerContents = [
    <div key="nuro" className="bg-gradient-to-r from-violet-600 to-indigo-500 text-white border border-white/10 text-xs px-3 py-1 rounded-md shadow-md">
      Nuro Labs
    </div>,
    <div key="genomics" className="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 border border-white/10 text-xs px-3 py-1 rounded-md shadow-md">
      Genomics Pro
    </div>,
    <div key="dna" className="bg-gradient-to-r from-blue-600 to-cyan-400 text-white border border-white/10 text-xs px-3 py-1 rounded-md shadow-md">
      DNA Analytics
    </div>,
    <div key="research" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border border-white/10 text-xs px-3 py-1 rounded-md shadow-md">
      Research Mode
    </div>
  ];

  // Create more natural human-like cursor movement
  useEffect(() => {
    // Define waypoints that mimic natural human cursor paths
    // These coordinates will be relative to the container
    const waypoints = [
      { x: 120, y: 100 },
      { x: 180, y: 140 },
      { x: 200, y: 180 },
      { x: 250, y: 210 },
      { x: 180, y: 270 },
      { x: 250, y: 270 },
      { x: 120, y: 270 },
      { x: 200, y: 150 },
    ];
    
    let currentWaypoint = 0;
    let progress = 0;
    let lastTime = Date.now();
    
    const animatePosition = () => {
      const now = Date.now();
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;
      
      const current = waypoints[currentWaypoint];
      const next = waypoints[(currentWaypoint + 1) % waypoints.length];
      
      progress += deltaTime * 0.7; // Adjust speed here
      
      if (progress >= 1) {
        progress = 0;
        currentWaypoint = (currentWaypoint + 1) % waypoints.length;
      }
      
      const easeInOutCubic = (t: number): number => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const eased = easeInOutCubic(progress);
      
      const x = current.x + (next.x - current.x) * eased;
      const y = current.y + (next.y - current.y) * eased;
      
      const naturalX = x + Math.sin(Date.now() / 700) * 2;
      const naturalY = y + Math.sin(Date.now() / 900) * 1.5;

      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        // Approximate icon size for clamping. Adjust if icons vary significantly.
        const iconSize = 32; 
        const halfIconSize = iconSize / 2;

        // Clamp position to keep the center of the icon within container bounds
        const clampedX = Math.max(halfIconSize, Math.min(naturalX, containerWidth - halfIconSize));
        const clampedY = Math.max(halfIconSize, Math.min(naturalY, containerHeight - halfIconSize));
        
        setPosition({ x: clampedX, y: clampedY });
      } else {
        // Fallback if ref is not yet available (e.g., during initial render)
        setPosition({ x: naturalX, y: naturalY });
      }
    };

    // Cycle through cursor styles with fade transition
    const cycleStyles = () => {
      setOpacity(0); // Start fading out (CSS transition duration is 200ms)
      
      // After the fade-out duration, change the icon and start fading in
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % cursorIcons.length);
        setOpacity(1); // Start fading back in (CSS transition duration is 200ms)
      }, 200); // This timeout should match the CSS opacity transition duration for fade-out
    };

    const animationInterval = setInterval(animatePosition, 16); // ~60fps
    const styleInterval = setInterval(cycleStyles, 2500); // Change every 2.5 seconds

    // Initial position update in case waypoints are outside initial small container size
    // Or if containerRef is not immediately available.
    if (containerRef.current) {
        animatePosition();
    }


    return () => {
      clearInterval(animationInterval);
      clearInterval(styleInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dependencies: cursorIcons and followerContents are stable.

  return (
    // Added ref here and ensured position: relative (Tailwind's default for blocks)
    <div 
      ref={containerRef} 
      className="max-w-sm rounded-2xl bg-black dark:bg-gray-50 border dark:border-gray-400 shadow-md overflow-hidden relative group"
    >
      <div className="p-6 flex flex-col gap-10 ">

        <p
         className="text-4xl font-bold  text-gray-50 dark:text-gray-900"
         >
        Ready to accelerate your genomics?

        </p>


         


        <p className="dark:text-gray-700 text-gray-200 text-lg max-w-2xl">
          Join researchers and developers using <span className="font-semibold bg-gradient-to-r from-violet-600 to-fuchsia-500 text-transparent bg-clip-text">Nuro</span> for extreme-scale DNA analysis. Start exploring today!
        </p>
        <div className="flex items-center flex-wrap justify-center gap-4">
          <button
            className="cursor-none px-6 bg-gradient-to-r from-violet-600 to-indigo-500 text-white py-3 rounded-full border text-sm font-medium flex items-center justify-center gap-2 text-center max-md:grow shadow-lg hover:opacity-90 transition-all"
          >
            Request Access
          </button>
          <button
            className="cursor-none px-6 bg-white hover:bg-violet-50 transition-all py-3 rounded-full border border-violet-200 dark:text-gray-900 text-sm font-medium flex items-center justify-center gap-2 text-center max-md:grow shadow-md"
          >
            <Star size={15} fill="gold" stroke="orange" /> Star Nuro on GitHub
          </button>
        </div>
      </div>

      {/* Custom animated cursor: changed from 'fixed' to 'absolute' */}
      <div 
        className="pointer-events-none absolute transition-opacity duration-200 ease-in-out" 
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`, 
          transform: 'translate(-50%, -50%)', // Keeps the icon centered on position coordinates
          zIndex: 50,
          opacity: opacity,
        }}
      >
        {cursorIcons[activeIndex]}
      </div>
      
      {/* Cursor follower: changed from 'fixed' to 'absolute' */}
      <div 
        className="pointer-events-none absolute transition-opacity duration-200 ease-in-out" 
        style={{ 
          left: `${position.x + 20}px`, // Offset from the main cursor
          top: `${position.y + 20}px`,  // Offset from the main cursor
          zIndex: 49, // Ensure it's behind the main cursor if they overlap
          opacity: opacity,
          // transform: 'translateY(-100%)', // Optional: to position it above the cursor
        }}
      >
        {followerContents[activeIndex]}
      </div>
    </div>
  );
};

export default Nurocta;
