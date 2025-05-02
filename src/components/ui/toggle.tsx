"use client"

import * as React from "react"
// Make sure you have these icons installed or replace them with your icon library
import { SunIcon, MoonIcon } from "@radix-ui/react-icons"

import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button" // Assuming shadcn/ui Button path
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" // Assuming shadcn/ui Dropdown path
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  // Variants for the dropdown menu content animation - slightly slower, softer ease
  const dropdownVariants = {
    hidden: { opacity: 0, scale: 0.97, y: -8 }, // Start slightly smaller and higher
    visible: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.97, y: -8 }, // Exit to the same state as hidden
  }

  // Variants for the icon cross-fade animation - slightly slower, softer ease
  const iconVariants = {
    hidden: { opacity: 0, rotate: -45, scale: 0.8 }, // Less rotation, same scale
    visible: { opacity: 1, rotate: 0, scale: 1 },
    exit: { opacity: 0, rotate: 45, scale: 0.8 }, // Less rotation
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Trigger Button with subtle hover/tap animations */}
        <motion.div
          whileHover={{ scale: 1.08 }} // Slightly increased hover scale for feedback
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 18 }} // Adjusted spring physics
          className="inline-block" // Prevents layout shift from scale
        >
          <Button
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 overflow-hidden rounded-full border border-border/30 bg-background p-0 shadow-sm transition-colors hover:bg-transparent focus:bg-transparent focus:outline-none focus:ring-0 focus:ring-offset-0 active:scale-95"
          >
            {/* AnimatePresence manages the mounting/unmounting for animations */}
            <AnimatePresence initial={false} mode="wait">
              {/* Animate Sun Icon */}
              {theme === "dark" ? null : (
                <motion.div
                  key="sun"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={iconVariants}
                  // Slower duration, softer easing
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center" // Center icon
                >
                  <SunIcon className="h-[1.4rem] w-[1.4rem]" />
                </motion.div>
              )}
              {/* Animate Moon Icon */}
              {theme === "light" ? null : (
                <motion.div
                  key="moon"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={iconVariants}
                  // Slower duration, softer easing
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center justify-center" // Center icon
                >
                  <MoonIcon className="h-[1.4rem] w-[1.4rem]" />
                </motion.div>
              )}
            </AnimatePresence>
            <span className="sr-only">Toggle theme</span>
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent
        align="end"
        // Slightly increased margin-top
        className="mt-2.5 min-w-[8rem] overflow-hidden rounded-xl border-none bg-popover p-1 shadow-xl"
        asChild // Important for motion component to inherit props
      >
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={dropdownVariants}
          // Slightly slower duration, softer ease for dropdown
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Map through themes to create menu items */}
          {["light", "dark", "system"].map((mode) => (
            <DropdownMenuItem
              key={mode}
              onClick={() => setTheme(mode)}
              // Adjusted padding and text size for refinement
              className={`cursor-pointer rounded-lg px-3 py-2 text-[13px] transition-colors focus:bg-accent focus:text-accent-foreground data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground ${
                theme === mode
                  ? "bg-accent text-accent-foreground" // Style for active theme
                  : "text-popover-foreground"
              }`}
            >
              {/* Capitalize first letter */}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </DropdownMenuItem>
          ))}
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
