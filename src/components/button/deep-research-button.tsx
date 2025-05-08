"use client";

import { Telescope } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DeepResearchButtonProps {
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
}

export default function DeepResearchButton({ enabled = false, onChange }: DeepResearchButtonProps) {
  const [showResearch, setShowResearch] = useState(enabled);

  // Add useEffect to sync state with parent
  useEffect(() => {
    setShowResearch(enabled);
  }, [enabled]);

  const handleClick = () => {
    const newState = !showResearch;
    setShowResearch(newState);
    onChange?.(newState);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
        showResearch
          ? "bg-blue-500/15 border-blue-400 text-blue-500"
          : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
      )}
    >
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <motion.div
          animate={{
            rotate: showResearch ? 180 : 0,
            scale: showResearch ? 1.1 : 1,
          }}
          whileHover={{
            rotate: showResearch ? 195 : 15,
            scale: 1.1,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 10,
            },
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
          }}
        >
          <Telescope
            className={cn(
              "w-4 h-4",
              showResearch ? "text-blue-500" : "text-inherit"
            )}
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {showResearch && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: "auto",
              opacity: 1,
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm overflow-hidden whitespace-nowrap text-blue-500 flex-shrink-0"
          >
            Deep Research
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}