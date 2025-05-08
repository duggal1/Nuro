/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useMemo,
    type ReactNode,
    type MouseEvent as ReactMouseEvent,
    type SVGProps,
} from 'react';
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
    type Transition,
    type VariantLabels,
    type Target,
    type AnimationControls,
    type TargetAndTransition,
    type Variants,
} from 'framer-motion';
import { authClient } from '@/lib/auth-client';


import Link from 'next/link'
import Image from 'next/image'
import { BlurredStagger } from '../ui/blurred-stagger-text';
import AnimationContainer from '../Contanier';

function cn(...classes: (string | undefined | null | boolean)[]): string {
  return classes.filter(Boolean).join(" ");
}

// --- RotatingText Component START ---
interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof motion.span>,
    "children" | "transition" | "initial" | "animate" | "exit"
  > {
  texts: string[];
  transition?: Transition;
  initial?: boolean | Target | VariantLabels;
  animate?: boolean | VariantLabels | AnimationControls | TargetAndTransition;
  exit?: Target | VariantLabels;
  animatePresenceMode?: "sync" | "wait";
  animatePresenceInitial?: boolean;
  rotationInterval?: number;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | "random" | number;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 20, stiffness: 280 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-110%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2500,
      staggerDuration = 0.015,
      staggerFrom = "last",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    },
    ref
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && Intl.Segmenter) {
        try {
           const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
           return Array.from(segmenter.segment(text), (segment) => segment.segment);
        } catch (error) {
           console.warn("Intl.Segmenter failed, falling back to simple split:", error);
           return text.split('');
        }
      }
      return text.split('');
    };

    const elements = useMemo(() => {
        const currentText: string = texts[currentTextIndex] ?? '';
        if (splitBy === "characters") {
            const words = currentText.split(/(\s+)/);
            let charCount = 0;
            return words.filter(part => part.length > 0).map((part) => {
                const isSpace = /^\s+$/.test(part);
                const chars = isSpace ? [part] : splitIntoCharacters(part);
                const startIndex = charCount;
                charCount += chars.length;
                return { characters: chars, isSpace: isSpace, startIndex: startIndex };
            });
        }
        if (splitBy === "words") {
            return currentText.split(/(\s+)/).filter(word => word.length > 0).map((word, i) => ({
                characters: [word], isSpace: /^\s+$/.test(word), startIndex: i
            }));
        }
        if (splitBy === "lines") {
            return currentText.split('\n').map((line, i) => ({
                characters: [line], isSpace: false, startIndex: i
            }));
        }
        return currentText.split(splitBy).map((part, i) => ({
            characters: [part], isSpace: false, startIndex: i
        }));
    }, [texts, currentTextIndex, splitBy]);

    const totalElements = useMemo(() => elements.reduce((sum, el) => sum + el.characters.length, 0), [elements]);

    const getStaggerDelay = useCallback(
      (index: number, total: number): number => {
        if (total <= 1 || !staggerDuration) return 0;
        const stagger = staggerDuration;
        switch (staggerFrom) {
          case "first": return index * stagger;
          case "last": return (total - 1 - index) * stagger;
          case "center":
            const center = (total - 1) / 2;
            return Math.abs(center - index) * stagger;
          case "random": return Math.random() * (total - 1) * stagger;
          default:
            if (typeof staggerFrom === 'number') {
              const fromIndex = Math.max(0, Math.min(staggerFrom, total - 1));
              return Math.abs(fromIndex - index) * stagger;
            }
            return index * stagger;
        }
      },
      [staggerFrom, staggerDuration]
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext]
    );

    const next = useCallback(() => {
      const nextIndex = currentTextIndex === texts.length - 1 ? (loop ? 0 : currentTextIndex) : currentTextIndex + 1;
      if (nextIndex !== currentTextIndex) handleIndexChange(nextIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const previous = useCallback(() => {
      const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange]
    );

     const reset = useCallback(() => {
        if (currentTextIndex !== 0) handleIndexChange(0);
     }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

    useEffect(() => {
      if (!auto || texts.length <= 1) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto, texts.length]);

    return (
      <motion.span
        className={cn("inline-flex flex-wrap whitespace-pre-wrap relative align-bottom pb-[2px] md:pb-[3px] lg:pb-[4px]", mainClassName)}
        {...rest}
      
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.div
            key={currentTextIndex}
            className={cn(
               "inline-flex flex-wrap relative",
               splitBy === "lines" ? "flex-col items-start w-full" : "flex-row items-baseline"
            )}
            layout 
            aria-hidden="true"
            initial="initial"
            animate="animate"
            exit="exit"
          >
             {elements.map((elementObj, elementIndex) => (
                <span
                    key={elementIndex}
                    className={cn("inline-flex", splitBy === 'lines' ? 'w-full' : '', splitLevelClassName)}
                    style={{ whiteSpace: 'pre' }}
                >
                    {elementObj.characters.map((char, charIndex) => {
                        const globalIndex = elementObj.startIndex + charIndex;
                        return (
                            <motion.span
                                key={`${char}-${charIndex}`}
                                initial={initial}
                                animate={animate}
                                exit={exit}
                                transition={{
                                    ...transition,
                                    delay: getStaggerDelay(globalIndex, totalElements),
                                }}
                                className={cn("inline-block leading-none tracking-tight", elementLevelClassName)}
                            >
                                {char === ' ' ? '\u00A0' : char}
                            </motion.span>
                        );
                     })}
                </span>
             ))}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    );
  }
);
RotatingText.displayName = "RotatingText";



const ShinyText: React.FC<{ text: string; className?: string }> = React.memo(({ text, className = "" }) => ( // Added React.memo
    <span className={cn(
        "relative overflow-hidden inline-block",
        "bg-violet-100 border border-violet-300 text-violet-700",
        "dark:bg-violet-500/20 dark:border-violet-500/30 dark:text-violet-400",
        "px-4 py-1 rounded-full text-xs sm:text-sm font-medium cursor-pointer shadow-sm hover:shadow-md",
        "hover:border-violet-400 dark:hover:border-violet-500/50",
        "transition-all duration-200",
        className
    )}>
        {text}
        <span style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }} className="dark:opacity-60 opacity-80 animate-shine pointer-events-none"></span>
        <style>{`
            @keyframes shine {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
        `}</style>
    </span>
));
ShinyText.displayName = "ShinyText";


const ChevronDownIcon: React.FC<SVGProps<SVGSVGElement>> = React.memo((props) => ( // Added React.memo
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3 ml-1 inline-block transition-transform duration-200 group-hover:rotate-180" {...props}>
     <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
   </svg>
));
ChevronDownIcon.displayName = "ChevronDownIcon";

const MenuIcon: React.FC<SVGProps<SVGSVGElement>> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
));
MenuIcon.displayName = "MenuIcon";

const CloseIcon: React.FC<SVGProps<SVGSVGElement>> = React.memo((props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
));
CloseIcon.displayName = "CloseIcon";

const ExternalLinkIcon: React.FC<SVGProps<SVGSVGElement>> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
));
ExternalLinkIcon.displayName = "ExternalLinkIcon";

const SunIcon: React.FC<SVGProps<SVGSVGElement>> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" />
  </svg>
));
SunIcon.displayName = "SunIcon";

const MoonIcon: React.FC<SVGProps<SVGSVGElement>> = React.memo((props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
  </svg>
));
MoonIcon.displayName = "MoonIcon";


interface NavLinkProps {
    href?: string;
    children: ReactNode;
    hasDropdown?: boolean;
    className?: string;
    onClick?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = React.memo(({ href = "#", children, hasDropdown = false, className = "", onClick }) => ( // Added React.memo
   <motion.a
     href={href}
     onClick={onClick}
     className={cn(
        "relative group text-sm font-medium text-slate-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-white transition-colors duration-200 flex items-center py-1",
        className
     )}
     whileHover="hover"
   >
     {children}
     {hasDropdown && <ChevronDownIcon />}
     {!hasDropdown && (
         <motion.div
           className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-violet-500 dark:bg-violet-400"
           variants={{ initial: { scaleX: 0, originX: 0.5 }, hover: { scaleX: 1, originX: 0.5 } }}
           initial="initial"
           transition={{ duration: 0.3, ease: "easeOut" }}
         />
     )}
   </motion.a>
 ));
NavLink.displayName = "NavLink";


interface DropdownMenuProps {
    children: ReactNode;
    isOpen: boolean;
}

const DropdownMenu: React.FC<DropdownMenuProps> = React.memo(({ children, isOpen }) => ( // Added React.memo
   <AnimatePresence>
     {isOpen && (
       <motion.div
         initial={{ opacity: 0, y: 10, scale: 0.95 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: 10, scale: 0.95, transition: { duration: 0.15 } }}
         transition={{ duration: 0.2, ease: "easeOut" }}
         className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-56 origin-top z-40"
       >
           <div className="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-gray-700/50 rounded-md shadow-xl p-2">
               {children}
           </div>
       </motion.div>
     )}
   </AnimatePresence>
));
DropdownMenu.displayName = "DropdownMenu";

interface DropdownItemProps {
    href?: string;
    children: ReactNode;
    icon?: React.ReactElement<SVGProps<SVGSVGElement>>;
}

const DropdownItem: React.FC<DropdownItemProps> = React.memo(({ href = "#", children, icon }) => ( // Added React.memo
 <a
   href={href}
   className="group flex items-center justify-between w-full px-3 py-2 text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700/30 hover:text-violet-600 dark:hover:text-white rounded-md transition-colors duration-150"
 >
   <span>{children}</span>
   {icon && React.cloneElement(icon, { className: "w-4 h-4 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" })}
 </a>
));
DropdownItem.displayName = "DropdownItem";


interface Dot {
    x: number;
    y: number;
    targetOpacity: number;
    currentOpacity: number;
    opacitySpeed: number;
    baseRadius: number;
    currentRadius: number;
}

const InteractiveHero: React.FC = () => {
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const animationFrameId = useRef<number | null>(null);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
   const [openDropdown, setOpenDropdown] = useState<string | null>(null);
   const [isScrolled, setIsScrolled] = useState<boolean>(false);
   const [theme, setTheme] = useState<'light' | 'dark'>('light');
   const [isVideoExpanded, setIsVideoExpanded] = useState(false);
   const [isVideoTransitioning, setIsVideoTransitioning] = useState(false);
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [isLoadingAuth, setIsLoadingAuth] = useState(true);


   useEffect(() => {
     const storedTheme = localStorage.getItem('theme');
     const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
     if (storedTheme === 'light' || storedTheme === 'dark') {
       setTheme(storedTheme);
     } else if (prefersDark) {
       setTheme('dark');
     } else {
       setTheme('light'); // Default to light if no preference and no storage
     }
   }, []);

   useEffect(() => {
     if (theme === 'dark') {
       document.documentElement.classList.add('dark');
     } else {
       document.documentElement.classList.remove('dark');
     }
     localStorage.setItem('theme', theme);
   }, [theme]);

   const toggleTheme = () => {
     setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
   };

   useEffect(() => {
    async function checkSession() {
        try {
            const { data } = await authClient.getSession();
            setIsAuthenticated(!!data?.user);
        } catch (error) {
            console.error("Error checking session:", error);
            setIsAuthenticated(false); // Assume not authenticated on error
        } finally {
            setIsLoadingAuth(false);
        }
    }
    checkSession();
   }, []);

   const { scrollY } = useScroll();
   useMotionValueEvent(scrollY, "change", (latest) => {
       setIsScrolled(latest > 10);
   });

   const dotsRef = useRef<Dot[]>([]);
   const gridRef = useRef<Record<string, number[]>>({});
   const canvasSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
   const mousePositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

   const DOT_SPACING = 35; // Increased for better performance
   const BASE_OPACITY_MIN = 0.25; // Slightly adjusted
   const BASE_OPACITY_MAX = 0.35; // Slightly adjusted
   const BASE_RADIUS = 0.8; // Slightly smaller base
   const INTERACTION_RADIUS = 150;
   const INTERACTION_RADIUS_SQ = INTERACTION_RADIUS * INTERACTION_RADIUS;
   const OPACITY_BOOST = 0.6;
   const RADIUS_BOOST = 2.0; // Slightly reduced radius boost for subtlety
   const GRID_CELL_SIZE = Math.max(50, Math.floor(INTERACTION_RADIUS / 1.5));


   const handleMouseMove = useCallback((event: globalThis.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            mousePositionRef.current = { x: null, y: null };
            return;
        }
        const rect = canvas.getBoundingClientRect();
        const canvasX = event.clientX - rect.left;
        const canvasY = event.clientY - rect.top;
        mousePositionRef.current = { x: canvasX, y: canvasY };
   }, []);

   const createDots = useCallback(() => {
       const { width, height } = canvasSizeRef.current;
       if (width === 0 || height === 0) return;
       const newDots: Dot[] = [];
       const newGrid: Record<string, number[]> = {};
       const cols = Math.ceil(width / DOT_SPACING);
       const rows = Math.ceil(height / DOT_SPACING);
       for (let i = 0; i < cols; i++) {
           for (let j = 0; j < rows; j++) {
               const x = i * DOT_SPACING + DOT_SPACING / 2;
               const y = j * DOT_SPACING + DOT_SPACING / 2;
               const cellX = Math.floor(x / GRID_CELL_SIZE);
               const cellY = Math.floor(y / GRID_CELL_SIZE);
               const cellKey = `${cellX}_${cellY}`;
               if (!newGrid[cellKey]) newGrid[cellKey] = [];
               const dotIndex = newDots.length;
               newGrid[cellKey].push(dotIndex);
               const baseOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
               newDots.push({ x, y, targetOpacity: baseOpacity, currentOpacity: baseOpacity, opacitySpeed: (Math.random() * 0.005) + 0.002, baseRadius: BASE_RADIUS, currentRadius: BASE_RADIUS });
           }
       }
       dotsRef.current = newDots;
       gridRef.current = newGrid;
   }, [DOT_SPACING, GRID_CELL_SIZE, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]); // Dependencies are constants, fine

   const handleResize = useCallback(() => {
       const canvas = canvasRef.current;
       if (!canvas) return;
       const container = canvas.parentElement;
       const width = container ? container.clientWidth : window.innerWidth;
       const height = container ? container.clientHeight : window.innerHeight;
       if (canvas.width !== width || canvas.height !== height || canvasSizeRef.current.width !== width || canvasSizeRef.current.height !== height) {
           canvas.width = width;
           canvas.height = height;
           canvasSizeRef.current = { width, height };
           createDots();
       }
   }, [createDots]);

   const animateDots = useCallback(() => {
        // Optional: if (isScrollingRef.current) { animationFrameId.current = requestAnimationFrame(animateDots); return; }

       const canvas = canvasRef.current;
       const ctx = canvas?.getContext('2d');
       const dots = dotsRef.current;
       const grid = gridRef.current;
       const { width, height } = canvasSizeRef.current;
       const { x: mouseX, y: mouseY } = mousePositionRef.current;

       if (!ctx || !dots || !grid || width === 0 || height === 0) {
           animationFrameId.current = requestAnimationFrame(animateDots);
           return;
       }
       ctx.clearRect(0, 0, width, height);
       const activeDotIndices = new Set<number>();
       if (mouseX !== null && mouseY !== null) {
           const mouseCellX = Math.floor(mouseX / GRID_CELL_SIZE);
           const mouseCellY = Math.floor(mouseY / GRID_CELL_SIZE);
           const searchRadius = Math.ceil(INTERACTION_RADIUS / GRID_CELL_SIZE); // Keep search radius based on INTERACTION_RADIUS
           for (let i = -searchRadius; i <= searchRadius; i++) {
               for (let j = -searchRadius; j <= searchRadius; j++) {
                   const cellKey = `${mouseCellX + i}_${mouseCellY + j}`;
                   if (grid[cellKey]) grid[cellKey].forEach(dotIndex => activeDotIndices.add(dotIndex));
               }
           }
       }
       
       const isDarkMode = document.documentElement.classList.contains('dark');
       const r = isDarkMode ? '139' : '109'; 
       const g = isDarkMode ? '92'  : '40';
       const b = isDarkMode ? '246' : '217';

       dots.forEach((dot, index) => {
           dot.currentOpacity += dot.opacitySpeed;
           if (dot.currentOpacity >= dot.targetOpacity || dot.currentOpacity <= BASE_OPACITY_MIN) {
               dot.opacitySpeed = -dot.opacitySpeed;
               dot.currentOpacity = Math.max(BASE_OPACITY_MIN, Math.min(dot.currentOpacity, BASE_OPACITY_MAX));
               dot.targetOpacity = Math.random() * (BASE_OPACITY_MAX - BASE_OPACITY_MIN) + BASE_OPACITY_MIN;
           }
           let interactionFactor = 0;
           dot.currentRadius = dot.baseRadius;
           if (mouseX !== null && mouseY !== null && activeDotIndices.has(index)) {
               const dx = dot.x - mouseX; const dy = dot.y - mouseY;
               const distSq = dx * dx + dy * dy;
               if (distSq < INTERACTION_RADIUS_SQ) {
                   const distance = Math.sqrt(distSq);
                   interactionFactor = Math.max(0, 1 - distance / INTERACTION_RADIUS) ** 2; // Smoother falloff
               }
           }
           const finalOpacity = Math.min(1, dot.currentOpacity + interactionFactor * OPACITY_BOOST);
           dot.currentRadius = dot.baseRadius + interactionFactor * RADIUS_BOOST;
           ctx.beginPath();
           ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalOpacity.toFixed(3)})`;
           ctx.arc(dot.x, dot.y, dot.currentRadius, 0, Math.PI * 2);
           ctx.fill();
       });
       animationFrameId.current = requestAnimationFrame(animateDots);
   }, [GRID_CELL_SIZE, INTERACTION_RADIUS, INTERACTION_RADIUS_SQ, OPACITY_BOOST, RADIUS_BOOST, BASE_OPACITY_MIN, BASE_OPACITY_MAX, BASE_RADIUS]); // Dependencies are constants, fine

   useEffect(() => {
       handleResize(); // Initial size and dot creation
       const handleMouseLeave = () => { mousePositionRef.current = { x: null, y: null }; };
       
       // Use parent of canvas for mousemove if canvas itself is pointer-events-none
       const eventTarget = canvasRef.current?.parentElement || window;

       eventTarget.addEventListener('mousemove', handleMouseMove as EventListener, { passive: true });
       window.addEventListener('resize', handleResize);
       document.documentElement.addEventListener('mouseleave', handleMouseLeave); // Mouse leaving entire window
       
       animationFrameId.current = requestAnimationFrame(animateDots);
       
       return () => {
           eventTarget.removeEventListener('mousemove', handleMouseMove as EventListener);
           window.removeEventListener('resize', handleResize);
           document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
           if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
       };
   }, [handleResize, handleMouseMove, animateDots]);

   useEffect(() => {
       document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
       return () => { document.body.style.overflow = 'unset'; };
   }, [isMobileMenuOpen]);

   const headerVariants: Variants = {
       top: {
           backgroundColor: theme === 'dark' ? "rgba(17, 17, 17, 0.85)" : "rgba(255, 255, 255, 0.75)", // Slightly more opaque
           borderBottomColor: theme === 'dark' ? "rgba(55, 65, 81, 0.5)" : "rgba(226, 232, 240, 0.5)",
           boxShadow: 'none',
       },
       scrolled: {
           backgroundColor: theme === 'dark' ? "rgba(17, 17, 17, 0.9)" : "rgba(255, 255, 255, 0.8)", // Slightly more opaque
           borderBottomColor: theme === 'dark' ? "rgba(75, 85, 99, 0.7)" : "rgba(203, 213, 225, 0.7)",
           boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.05)', // Softer shadow
       }
   };
    const memoizedHeaderVariants = useMemo(() => headerVariants, [theme]);

   const mobileMenuVariants: Variants = {
       hidden: { opacity: 0, y: -20 },
       visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } }, // Slightly longer
       exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } } // Slightly longer
   };

    const contentDelay = 0.25; // Slightly faster start
    const itemDelayIncrement = 0.08; // Faster stagger
    const bannerVariants: Variants = { hidden: { opacity: 0, y: -10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: contentDelay, ease:"easeOut" } } };
    const headlineVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement, ease:"easeOut" } } };
    const subHeadlineVariants: Variants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: contentDelay + itemDelayIncrement * 2, ease:"easeOut" } } };
    const videoContainerVariants: Variants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.6, delay: contentDelay + itemDelayIncrement * 5, ease: [0.22, 1, 0.36, 1] } } }; // Adjusted ease

  return (

<div className="relative bg-white dark:bg-black text-slate-900 dark:text-gray-50 min-h-screen flex flex-col overflow-x-hidden transition-colors duration-300">
        <AnimationContainer animation="slide-up" delay={0.3} duration={0.8}>
             

        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none opacity-60 dark:opacity-70" // Reduced opacity slightly
            style={{ willChange: 'contents' }} // Hint for canvas redraws
        />
        <div className="absolute inset-0 z-1 pointer-events-none" style={{
            background: theme === 'dark'
                ? 'linear-gradient(to bottom, transparent 0%, #111111 90%), radial-gradient(ellipse at center, transparent 35%, #111111 90%)' // Adjusted gradient
                : 'linear-gradient(to bottom, transparent 0%, #FFFFFF 90%), radial-gradient(ellipse at center, transparent 35%, #FFFFFF 90%)' // Adjusted gradient
        }}></div>

        <motion.header
            key={theme} 
            variants={memoizedHeaderVariants}
            initial={false} // Avoid initial animation if already at top
            animate={isScrolled ? "scrolled" : "top"}
            transition={{ duration: 0.3, ease: "circOut" }} // Faster, smoother ease
            className={cn(
                " w-full  sticky top-0 z-30 border-b",
        
            )}
            style={{ willChange: 'background-color, border-bottom-color, box-shadow' }}
        >
           <nav className="flex justify-between items-center max-w-screen-xl mx-auto px-4">
            
            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center space-x-2 ">
                             <Image
                                    src="/nuro1.png"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="size-20 w-20 hover:animate-spin "
                                />
                               
                          
                            </Link>

                            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
                    <NavLink href="#">Product</NavLink>
                    <NavLink href="#">Use Cases</NavLink> 
                    <div
                        className="relative"
                        onMouseEnter={() => setOpenDropdown('resources')}
                        onMouseLeave={() => setOpenDropdown(null)}
                    >
                        <NavLink href="#" hasDropdown>Resources</NavLink>
                        <DropdownMenu isOpen={openDropdown === 'resources'}>
                            <DropdownItem href="#" icon={<ExternalLinkIcon/>}>Blog</DropdownItem>
                            <DropdownItem href="#">Publications</DropdownItem>
                            <DropdownItem href="#">Documentation</DropdownItem>
                        </DropdownMenu>
                    </div>
                    <NavLink href="#">Pricing</NavLink>
                </div>

                <div className="flex items-center space-x-3 lg:space-x-4">
                    <button
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className="p-2 rounded-full text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-gray-700/40 transition-colors"
                    >
                        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                    </button>
                    {!isLoadingAuth && (
                        isAuthenticated ? (
                            <motion.a
                                href="/dashboard"
                                className="bg-violet-600 dark:bg-violet-500 text-white dark:text-slate-900 px-4 py-[6px] rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-lg hover:shadow-violet-500/30 dark:hover:shadow-violet-400/30"
                                whileHover={{ scale: 1.03, y: -1 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                            >
                                Dashboard
                            </motion.a>
                        ) : (
                            <>
                                <NavLink href="/login" className="hidden md:inline-block">Sign in</NavLink>
                                <motion.a
                                    href="/signup"
                                    className="bg-violet-600 dark:bg-violet-500 text-white dark:text-slate-900 px-4 py-[6px] rounded-md text-sm font-semibold hover:bg-opacity-90 transition-colors duration-200 whitespace-nowrap shadow-sm hover:shadow-lg hover:shadow-violet-500/30 dark:hover:shadow-violet-400/30"
                                    whileHover={{ scale: 1.03, y: -1 }}
                                    whileTap={{ scale: 0.97 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                >
                                    Request Access
                                </motion.a>
                            </>
                        )
                    )}
                    <motion.button
                        className="md:hidden text-slate-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-white z-50"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    >
                        {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </motion.button>
                </div>
            </nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        key="mobile-menu"
                        variants={mobileMenuVariants} initial="hidden" animate="visible" exit="exit"
                        className="md:hidden absolute top-full left-0 right-0 bg-white/90 dark:bg-[#111111]/90 backdrop-blur-sm shadow-lg py-4 border-t border-slate-200 dark:border-gray-800/50"
                      
                    >
                        <div className="flex flex-col items-center space-y-4 px-6">
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Product</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Use Cases</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Resources</NavLink>
                            <NavLink href="#" onClick={() => setIsMobileMenuOpen(false)}>Pricing</NavLink>
                            <hr className="w-full border-t border-slate-300 dark:border-gray-700/50 my-2"/>
                            {!isLoadingAuth && (
                                isAuthenticated ? (
                                    <NavLink href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                                ) : (
                                    <NavLink href="/login" onClick={() => setIsMobileMenuOpen(false)}>Sign in</NavLink>
                                )
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>

        <main className="flex-grow flex flex-col items-center justify-center text-center px-4 pt-8 pb-16 relative z-10">
            <motion.div
                variants={bannerVariants}
                initial="hidden"
                animate="visible"
                className="mb-6"
            >
                <ShinyText text="Nuro Research Preview: Available Now 🎉" />
            </motion.div>
            <BlurredStagger 
                        text="Nuro: Extreme-Scale for Your "
                        className="text-6xl font-black text-slate-900 dark:text-white "
                    />

            <motion.h1
                variants={headlineVariants}
                initial="hidden"
                animate="visible"
                className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[60px] font-semibold text-slate-900 dark:text-white leading-tight max-w-4xl mb-4"
            >
              {' '}
                <span className="inline-block h-[1.1em] sm:h-[1.15em] lg:h-[1.2em] xl:h-[1.2em] overflow-hidden align-bottom">
                    <RotatingText
                        texts={['DNA', 'Genomes', 'Insights', 'Discoveries']}
                        mainClassName="text-violet-500 dark:text-violet-700 mx-1"
                        splitLevelClassName="leading-tight lg:leading-snug" 
                        elementLevelClassName="leading-tight lg:leading-snug"
                    />
                </span>
            </motion.h1>

            <motion.p
                variants={subHeadlineVariants}
                initial="hidden"
                animate="visible"
                className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-gray-400 max-w-3xl mx-auto mb-8"
            >
                A cutting-edge DNA language model built for extreme-scale genomic analysis. It models up to 1 million base pairs at single-nucleotide resolution using StripedHyena 2, trained on 8.8 trillion tokens from across all life. Pure power for your gene niche—no fluff, just precision.
            </motion.p>

            <div className="mb-10">
               
            </div>


            <motion.div
                variants={videoContainerVariants}
                initial="hidden"
                animate="visible"
                className={cn(
                    "relative  mb-10 mx-auto px-4 sm:px-0 cursor-pointer group",
                    isVideoExpanded ? "w-full max-w-5xl" : "w-full max-w-3xl" 
                )}
                onClick={() => {
                    setIsVideoTransitioning(true); 
                    setIsVideoExpanded(!isVideoExpanded);
                }}
                layout
                transition={{ type: "spring", stiffness: 230, damping: 35 }} 
                onLayoutAnimationComplete={() => {
  
                    setTimeout(() => setIsVideoTransitioning(false), 50); 
                }}
                whileHover={!isVideoExpanded ? { scale: 1.025, transition: { type: "spring", stiffness: 350, damping: 15 } } : {}}
                style={{ willChange: 'transform, width, height' }} 
            >
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10"></div>
                   
        
                <motion.div
                    className="relative aspect-video shadow-2xl rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700/50 group-hover:border-violet-400 dark:group-hover:border-violet-500 transition-colors duration-300"
                    animate={{ filter: isVideoTransitioning ? "blur(4px)" : "blur(0px)" }}
                    transition={{ filter: { duration: 0.25, ease: "easeOut" } }} 
                    style={{ willChange: 'filter' }} 
                >
                    <div className="absolute inset-0 z-[1] pointer-events-none opacity-80 dark:opacity-100"
                         style={{
                            background: `
                                linear-gradient(to top, ${theme === 'dark' ? 'rgba(17,17,17,0.3)' : 'rgba(255,255,255,0.1)'} 0%, transparent 15%),
                                linear-gradient(to bottom, ${theme === 'dark' ? 'rgba(17,17,17,0.3)' : 'rgba(255,255,255,0.1)'} 0%, transparent 15%),
                                linear-gradient(to left, ${theme === 'dark' ? 'rgba(17,17,17,0.2)' : 'rgba(255,255,255,0.05)'} 0%, transparent 10%),
                                linear-gradient(to right, ${theme === 'dark' ? 'rgba(17,17,17,0.2)' : 'rgba(255,255,255,0.05)'} 0%, transparent 10%)
                            `
                         }}
                    ></div>
                   
            

                    <video
                        src="/"
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline 
                    >
                    Your browser does not support the video tag 😢 .
                    </video>
                </motion.div>
            </motion.div>
           
        </main>

      </AnimationContainer>
      
      
    </div>
  );
};

export default InteractiveHero;

