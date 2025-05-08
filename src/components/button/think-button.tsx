"use client";

import { BrainCog } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ThinkButtonProps {
  isEnabled: boolean;
  onClick: () => void;
}

export default function ThinkButton({ isEnabled, onClick }: ThinkButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full transition-all flex items-center gap-1.5 px-1.5 py-1 border h-8",
        isEnabled
          ? "bg-purple-500/15 border-purple-400 text-purple-500"
          : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
      )}
    >
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <motion.div
          animate={{
            rotate: isEnabled ? 180 : 0,
            scale: isEnabled ? 1.1 : 1,
          }}
          whileHover={{
            rotate: isEnabled ? 180 : 15,
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
          <BrainCog
            className={cn(
              "w-4 h-4",
              isEnabled ? "text-purple-500" : "text-inherit"
            )}
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {isEnabled && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: "auto",
              opacity: 1,
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm overflow-hidden whitespace-nowrap text-purple-500 flex-shrink-0"
          >
            Think
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}