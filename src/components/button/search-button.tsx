"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function SearchButton() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setShowSearch(!showSearch)}
      className={cn(
        "rounded-full transition-all flex items-center gap-2 px-1.5 py-1 border h-8",
        showSearch
          ? "bg-sky-500/15 border-sky-400 text-sky-500"
          : "bg-black/5 dark:bg-white/5 border-transparent text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white"
      )}
    >
      <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
        <motion.div
          animate={{
            rotate: showSearch ? 180 : 0,
            scale: showSearch ? 1.1 : 1,
          }}
          whileHover={{
            rotate: showSearch ? 180 : 15,
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
          <Globe
            className={cn(
              "w-4 h-4",
              showSearch ? "text-sky-500" : "text-inherit"
            )}
          />
        </motion.div>
      </div>
      <AnimatePresence>
        {showSearch && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{
              width: "auto",
              opacity: 1,
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm overflow-hidden whitespace-nowrap text-sky-500 flex-shrink-0"
          >
            Search
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}