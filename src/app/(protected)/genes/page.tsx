"use client";

import React from "react";
import { GeneDesigner } from "@/components/evo2/gene-predection";
import { ThemeProvider } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { HeroHeader } from '@/components/hero9-header'

export default function Page() {
  return (
    <ThemeProvider attribute="class">
              <HeroHeader/>
      <div className={cn(
        "min-h-screen flex items-center justify-center p-8",
        "bg-gradient-to-br from-pink-100 via-purple-50 to-indigo-50",
        "dark:bg-gradient-to-br dark:from-black dark:via-gray-950 dark:to-gray-950/50"
      )}>


      
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl"
        >
          <GeneDesigner />
        </motion.div>
      </div>
    </ThemeProvider>
  );
}
