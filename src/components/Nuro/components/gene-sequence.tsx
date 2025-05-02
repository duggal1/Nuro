/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type { GeneBounds, GeneDetailsFromSearch } from "@/utils/genome-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getNucleotideColorClass } from "@/utils/coloring-utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileCode, Database, PlayCircle, Dna, AlertTriangle } from "lucide-react";
import { Loader } from "@/components/Loader";


export function GeneSequence({
  geneBounds,
  geneDetail,
  startPosition,
  endPosition,
  onStartPositionChange,
  onEndPositionChange,
  sequenceData,
  sequenceRange,
  isLoading,
  error,
  onSequenceLoadRequest,
  onSequenceClick,
  maxViewRange,
}: {
  geneBounds: GeneBounds | null;
  geneDetail: GeneDetailsFromSearch | null;
  startPosition: string;
  endPosition: string;
  onStartPositionChange: (value: string) => void;
  onEndPositionChange: (value: string) => void;
  sequenceData: string;
  sequenceRange: { start: number; end: number } | null;
  isLoading: boolean;
  error: string | null;
  onSequenceLoadRequest: () => void;
  onSequenceClick: (position: number, nucleotide: string) => void;
  maxViewRange: number;
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  
  const [sliderValues, setSliderValues] = useState({ start: 60, end: 70 });
  const [isDraggingStart, setIsDraggingStart] = useState(false);
  const [isDraggingEnd, setIsDraggingEnd] = useState(false);
  const [isDraggingRange, setIsDraggingRange] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<{
    x: number;
    startPos: number;
    endPos: number;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const currentRangeSize = useMemo(() => {
    const start = parseInt(startPosition);
    const end = parseInt(endPosition);
    return isNaN(start) || isNaN(end) || end < start ? 0 : end - start + 1;
  }, [startPosition, endPosition]);

  useEffect(() => {
    if (!geneBounds) return;

    const minBound = Math.min(geneBounds.min, geneBounds.max);
    const maxBound = Math.max(geneBounds.min, geneBounds.max);
    const totalSize = maxBound - minBound;

    const startNum = parseInt(startPosition);
    const endNum = parseInt(endPosition);

    if (isNaN(startNum) || isNaN(endNum) || totalSize <= 0) {
      setSliderValues({ start: 0, end: 100 });
      return;
    }

    const startPercent = ((startNum - minBound) / totalSize) * 100;
    const endPercent = ((endNum - minBound) / totalSize) * 100;

    setSliderValues({
      start: Math.max(0, Math.min(startPercent, 100)),
      end: Math.max(0, Math.min(endPercent, 100)),
    });
  }, [startPosition, endPosition, geneBounds]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingStart && !isDraggingEnd && !isDraggingRange) return;
      if (!sliderRef.current || !geneBounds) return;

      const sliderRect = sliderRef.current.getBoundingClientRect();
      const relativeX = e.clientX - sliderRect.left;
      const sliderWidth = sliderRect.width;
      let newPercent = (relativeX / sliderWidth) * 100;
      newPercent = Math.max(0, Math.min(newPercent, 100));

      const minBound = Math.min(geneBounds.min, geneBounds.max);
      const maxBound = Math.max(geneBounds.min, geneBounds.max);
      const geneSize = maxBound - minBound;

      const newPosition = Math.round(minBound + (geneSize * newPercent) / 100);
      const currentStartNum = parseInt(startPosition);
      const currentEndNum = parseInt(endPosition);

      if (isDraggingStart) {
        if (!isNaN(currentEndNum)) {
          if (currentEndNum - newPosition + 1 > maxViewRange) {
            onStartPositionChange(String(currentEndNum - maxViewRange + 1));
          } else if (newPosition < currentEndNum) {
            onStartPositionChange(String(newPosition));
          }
        }
      } else if (isDraggingEnd) {
        if (!isNaN(currentStartNum)) {
          if (newPosition - currentStartNum + 1 > maxViewRange) {
            onEndPositionChange(String(currentStartNum + maxViewRange - 1));
          } else if (newPosition > currentStartNum) {
            onEndPositionChange(String(newPosition));
          }
        }
      } else if (isDraggingRange) {
        if (!dragStartX.current) return;
        const pixelsPerBase = sliderWidth / geneSize;
        const dragDeltaPixels = relativeX - dragStartX.current.x;
        const dragDeltaBases = Math.round(dragDeltaPixels / pixelsPerBase);

        let newStart = dragStartX.current.startPos + dragDeltaBases;
        let newEnd = dragStartX.current.endPos + dragDeltaBases;
        const rangeSize =
          dragStartX.current.endPos - dragStartX.current.startPos;

        if (newStart < minBound) {
          newStart = minBound;
          newEnd = minBound + rangeSize;
        }
        if (newEnd > maxBound) {
          newEnd = maxBound;
          newStart = maxBound - rangeSize;
        }

        onStartPositionChange(String(newStart));
        onEndPositionChange(String(newEnd));
      }
    };

    const handleMouseUp = () => {
      if (
        (isDraggingStart || isDraggingEnd || isDraggingRange) &&
        startPosition &&
        endPosition
      ) {
        onSequenceLoadRequest();
      }
      setIsDraggingStart(false);
      setIsDraggingEnd(false);
      setIsDraggingRange(false);
      dragStartX.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isDraggingStart,
    isDraggingEnd,
    isDraggingRange,
    geneBounds,
    startPosition,
    endPosition,
    onStartPositionChange,
    onEndPositionChange,
    maxViewRange,
    onSequenceLoadRequest,
  ]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle: "start" | "end") => {
      e.preventDefault();
      if (handle === "start") setIsDraggingStart(true);
      else setIsDraggingEnd(true);
    },
    [],
  );

  const handleRangeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      if (!sliderRef.current) return;

      const startNum = parseInt(startPosition);
      const endNum = parseInt(endPosition);
      if (isNaN(startNum) || isNaN(endNum)) return;

      setIsDraggingRange(true);
      const sliderRect = sliderRef.current.getBoundingClientRect();
      const relativeX = e.clientX - sliderRect.left;
      dragStartX.current = {
        x: relativeX,
        startPos: startNum,
        endPos: endNum,
      };
    },
    [startPosition, endPosition],
  );

  const formattedSequence = useMemo(() => {
    if (!sequenceData || !sequenceRange) return null;

    const start = sequenceRange.start;
    const BASES_PER_LINE = 200;
    const lines: JSX.Element[] = [];

    for (let i = 0; i < sequenceData.length; i += BASES_PER_LINE) {
      const lineStartPos = start + i;
      const chunk = sequenceData.substring(i, i + BASES_PER_LINE);
      const colorizedChars: JSX.Element[] = [];

      for (let j = 0; j < chunk.length; j++) {
        const nucleotide = chunk[j] || "";
        const nucleotidePosition = lineStartPos + j;
        const color = getNucleotideColorClass(nucleotide);
        colorizedChars.push(
          <motion.span
            key={j}
            onClick={() => {
              onSequenceClick(nucleotidePosition, nucleotide);
              toast.info(`Selected ${nucleotide} at position ${nucleotidePosition.toLocaleString()}`, {
                icon: <Dna className="h-4 w-4" />,
                description: "Click 'Analyze variant' above to evaluate this position."
              });
            }}
            onMouseEnter={(e) => {
              setHoverPosition(nucleotidePosition);
              setMousePosition({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={(e) => {
              setHoverPosition(null);
              setMousePosition(null);
            }}
            whileHover={{ scale: 1.5, fontWeight: "bold" }}
            className={`${color} group relative cursor-pointer transition-colors hover:brightness-110`}
          >
            {nucleotide}
          </motion.span>,
        );
      }

      lines.push(
        <motion.div 
          key={i} 
          className="flex"
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.0005, duration: 0.2 }}
        >
          <div className={cn(
            "w-20 mr-2 text-right select-none",
            isDark ? "text-gray-500" : "text-gray-500"
          )}>
            {lineStartPos.toLocaleString()}
          </div>
          <div className="flex-1 tracking-wide">{colorizedChars}</div>
        </motion.div>,
      );
    }

    return lines;
  }, [sequenceData, sequenceRange, onSequenceClick, isDark]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className={cn(
        "overflow-hidden border-none shadow-xl rounded-2xl",
        isDark 
          ? "bg-gradient-to-b from-gray-900/60 to-black/90 backdrop-blur-md text-white" 
          : "bg-gradient-to-b from-white to-gray-50/90 backdrop-blur-md text-gray-900"
      )}>
        <CardHeader className={cn(
          "pt-6 pb-3",
          isDark ? "border-b border-gray-800/50" : "border-b border-gray-200/30"
        )}>
          <CardTitle className={cn(
            "flex items-center gap-2 font-serif text-lg",
            isDark ? "text-white" : "text-gray-900"
          )}>
            <FileCode className="h-5 w-5 text-indigo-500" />
            Gene Sequence
          </CardTitle>
        </CardHeader>

        <CardContent className="relative py-6">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className={cn(
              "absolute -inset-[40%] blur-3xl rounded-full",
              isDark ? "bg-indigo-900/30" : "bg-indigo-100/80"
            )} />
          </div>
          
          {geneBounds && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-col mb-6 relative z-10"
            >
              <div className={cn(
                "flex flex-col items-center justify-between mb-3 text-xs font-sans sm:flex-row",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                <motion.span 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="sm:hidden">From: </p>
                  <p>
                    {Math.min(geneBounds.min, geneBounds.max).toLocaleString()}
                  </p>
                </motion.span>
                <motion.span 
                  className={cn(
                    "font-medium",
                    isDark ? "text-indigo-300" : "text-indigo-600"
                  )}
                  whileHover={{ scale: 1.05 }}
                >
                  Selected: {parseInt(startPosition || "0").toLocaleString()} -{" "}
                  {parseInt(endPosition || "0").toLocaleString()} (
                  {currentRangeSize.toLocaleString()} bp)
                </motion.span>
                <motion.span 
                  className="flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="sm:hidden">To: </p>
                  <p>
                    {Math.max(geneBounds.min, geneBounds.max).toLocaleString()}
                  </p>
                </motion.span>
              </div>

              {/* Slider component */}
              <div className="space-y-6">
                <div className="relative">
                  <div
                    ref={sliderRef}
                    className="relative w-full h-8 cursor-pointer"
                  >
                    {/* Track background */}
                    <div className={cn(
                      "absolute top-1/2 h-2 w-full -translate-y-1/2 rounded-full",
                      isDark ? "bg-gray-800" : "bg-gray-200"
                    )}></div>

                    {/* Selected range */}
                    <motion.div
                      className={cn(
                        "absolute top-1/2 h-2 -translate-y-1/2 cursor-grab rounded-full active:cursor-grabbing",
                        isDark 
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600" 
                          : "bg-gradient-to-r from-indigo-500 to-purple-500"
                      )}
                      style={{
                        left: `${sliderValues.start}%`,
                        width: `${sliderValues.end - sliderValues.start}%`,
                      }}
                      onMouseDown={handleRangeMouseDown}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                    ></motion.div>

                    {/* Start handle */}
                    <motion.div
                      className={cn(
                        "absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 bg-white shadow active:cursor-grabbing",
                        isDark 
                          ? "border-indigo-600" 
                          : "border-indigo-500"
                      )}
                      style={{ left: `${sliderValues.start}%` }}
                      onMouseDown={(e) => handleMouseDown(e, "start")}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={cn(
                        "h-3 w-1 rounded-full",
                        isDark ? "bg-indigo-600" : "bg-indigo-500"
                      )}></div>
                    </motion.div>

                    {/* End handle */}
                    <motion.div
                      className={cn(
                        "absolute top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab items-center justify-center rounded-full border-2 bg-white shadow active:cursor-grabbing",
                        isDark 
                          ? "border-indigo-600" 
                          : "border-indigo-500"
                      )}
                      style={{ left: `${sliderValues.end}%` }}
                      onMouseDown={(e) => handleMouseDown(e, "end")}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={cn(
                        "h-3 w-1 rounded-full",
                        isDark ? "bg-indigo-600" : "bg-indigo-500"
                      )}></div>
                    </motion.div>
                  </div>
                </div>

                {/* Position controls */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-sans",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>Start:</span>
                    <Input
                      value={startPosition}
                      onChange={(e) => onStartPositionChange(e.target.value)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={cn(
                        "h-9 w-full text-xs font-sans transition-all",
                        isDark 
                          ? "border-gray-800 bg-gray-900/50 focus:border-indigo-700 focus:ring-indigo-700/30" 
                          : "border-gray-200 focus:border-indigo-600 focus:ring-indigo-600/20",
                        "sm:w-36"
                      )}
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      size="sm"
                      disabled={isLoading}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent page jump
                        onSequenceLoadRequest();
                        if (!isLoading) {
                          toast.info("Loading sequence data...");
                        }
                      }}
                      className={cn(
                        "h-9 w-full cursor-pointer text-xs font-sans text-white sm:w-auto",
                        isDark 
                          ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:brightness-110" 
                          : "bg-gradient-to-r from-green-400 to-emerald-500 hover:brightness-110",
                        isLoading && "opacity-70"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2 min-w-[100px]">
                        {isLoading ? (
                          <>
                        
                            <Loader />
               
                            <span>Loading...</span>
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-3.5 w-3.5" />
                            <span>Load sequence</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </motion.div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-xs font-sans",
                      isDark ? "text-gray-400" : "text-gray-600"
                    )}>End:</span>
                    <Input
                      value={endPosition}
                      onChange={(e) => onEndPositionChange(e.target.value)}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      className={cn(
                        "h-9 w-full text-xs font-sans transition-all",
                        isDark 
                          ? "border-gray-800 bg-gray-900/50 focus:border-indigo-700 focus:ring-indigo-700/30" 
                          : "border-gray-200 focus:border-indigo-600 focus:ring-indigo-600/20",
                        "sm:w-36"
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className={cn(
            "flex items-center justify-between mb-4 text-xs font-sans",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            <span>
              {geneDetail?.genomicinfo?.[0]?.strand === "+"
                ? "Forward strand (5' → 3')"
                : geneDetail?.genomicinfo?.[0]?.strand === "-"
                  ? "Reverse strand (3' ← 5')"
                  : "Strand information not available"}
            </span>
            <span className={cn(
              "px-3 py-1 rounded-full",
              isDark 
                ? "bg-gray-800 text-gray-300" 
                : "bg-gray-100 text-gray-700"
            )}>
              Max window: {maxViewRange.toLocaleString()} bp
            </span>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "mb-6 flex items-center gap-2 rounded-xl border p-4 text-sm",
                isDark 
                  ? "border-red-900/20 bg-red-950/10 text-red-400" 
                  : "border-red-100 bg-red-50 text-red-600"
              )}
            >
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          <div className={cn(
            "w-full rounded-xl p-4 relative overflow-hidden",
            isDark 
              ? "bg-gray-900/50 border border-gray-800/50" 
              : "bg-white/50 border border-gray-200/50"
          )}>
            <div className="absolute inset-0 pointer-events-none opacity-5">
              <div className={cn(
                "absolute -inset-[40%] blur-3xl rounded-full",
                isDark ? "bg-black" : "bg-gray-50"
              )} />
            </div>
            
            <AnimatePresence mode="wait" initial={false}>
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-64 items-center justify-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <Loader />
                    <p className={cn(
                      "text-sm animate-pulse",
                      isDark ? "text-gray-400" : "text-gray-500"
                    )}>Loading sequence...</p>
                  </div>
                </motion.div>
              ) : sequenceData ? (
                <motion.div 
                  key="sequence"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="relative h-64 overflow-auto rounded-md"
                >
                  <div className="sticky top-0 z-20 w-full">
                    {formattedSequence}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="no-data"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-64 flex-col items-center justify-center gap-4"
                >
                  <Database className={cn(
                    "h-8 w-8",
                    isDark ? "text-gray-700" : "text-gray-300"
                  )} />
                  <p className={cn(
                    "text-center text-sm",
                    isDark ? "text-gray-400" : "text-gray-500"
                  )}>
                    Select a region and click &quot;Load sequence&quot; to view data
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {hoverPosition !== null && mousePosition !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1 }}
              className={cn(
                "pointer-events-none fixed z-50 rounded-lg px-3 py-1.5 text-xs font-sans shadow-lg",
                isDark 
                  ? "bg-black text-gray-50" 
                  : "bg-white text-gray-900 border border-gray-200"
              )}
              style={{
                top: mousePosition.y - 30,
                left: mousePosition.x,
                transform: "translateX(-50%)",
              }}
            >
              Position: {hoverPosition.toLocaleString()}
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex flex-wrap items-center gap-6 mt-6 justify-center"
          >
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                className="w-4 h-4 bg-red-600 rounded-full shadow-sm" 
              />
              <span className={cn(
                "text-xs font-sans",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>Adenine (A)</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                className="w-4 h-4 bg-blue-600 rounded-full shadow-sm" 
              />
              <span className={cn(
                "text-xs font-sans",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>Thymine (T)</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                className="w-4 h-4 bg-green-600 rounded-full shadow-sm" 
              />
              <span className={cn(
                "text-xs font-sans",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>Guanine (G)</span>
            </div>
            <div className="flex items-center gap-2">
              <motion.div 
                whileHover={{ scale: 1.2 }} 
                className="w-4 h-4 rounded-full bg-amber-600 shadow-sm" 
              />
              <span className={cn(
                "text-xs font-sans",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>Cytosine (C)</span>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
