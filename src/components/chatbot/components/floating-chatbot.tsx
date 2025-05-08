/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";
import { useTheme } from "next-themes";

import BlurText from "@/components/BlurText/BlurText";
import Chatbot from './chat-box';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [persistentConversation, setPersistentConversation] = useState<Array<{role: "user" | "assistant", content: string}>>([]);
  const pendingConversationUpdate = useRef<Array<{role: "user" | "assistant", content: string}> | null>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pendingConversationUpdate.current !== null) {
      setPersistentConversation(pendingConversationUpdate.current);
      pendingConversationUpdate.current = null;
    }
  });

  // Handle conversation persistence
  const handleConversationUpdate = (conversation: Array<{role: "user" | "assistant", content: string}>) => {
    pendingConversationUpdate.current = conversation;
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Enhanced wave animation with smoother transitions
  const waveAnimation = {
    waving: {
      rotate: [0, 14, -8, 14, -4, 8, 0],
      transition: {
        duration: 2,
        ease: [0.25, 0.1, 0.25, 1], // Custom cubic bezier for ultra-smooth feel
        times: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
        repeat: 1,
        repeatDelay: 0.3
      }
    }
  };

  // Smoother button hover effect
  const buttonHoverEffect = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.07,
      boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 0.6,
        duration: 0.3
      }
    },
    tap: { 
      scale: 0.95,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 15,
        mass: 0.6
      }
    }
  };

  // Ultra-smooth dialog animation
  const dialogAnimation = {
    hidden: { opacity: 0, y: 15, scale: 0.97 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300, 
        damping: 20,
        mass: 0.6,
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] // Custom cubic bezier for smooth feel
      }
    },
    exit: { 
      opacity: 0, 
      y: 12, 
      scale: 0.97,
      transition: {
        duration: 0.25,
        ease: [0.32, 0, 0.67, 0]
      }
    }
  };

  if (!mounted) return null;

  // Dynamic colors based on theme
  const iconBgColor = isDarkMode ? "bg-white" : "bg-black";
  const iconTextColor = isDarkMode ? "text-black" : "text-white";
  const closeBtnBgColor = isDarkMode ? "bg-zinc-800" : "bg-black";
  const closeBtnTextColor = isDarkMode ? "text-zinc-200" : "text-white";

  return (
    <>
      {/* Floating Chat Dialog */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            variants={dialogAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed right-6 bottom-24 z-50 bg-background shadow-xl rounded-2xl overflow-hidden border border-border dark:border-zinc-700 dark:bg-zinc-900"
            style={{
              width: "min(420px, calc(100vw - 48px))",
              height: "min(85vh, 700px)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column"
            }}
          >
            {/* Header with close button */}
            <div className="absolute top-3 right-3 z-10">
              <motion.button
                variants={buttonHoverEffect}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                onClick={toggleChat}
                className={`rounded-full ${closeBtnBgColor} ${closeBtnTextColor} p-2 shadow-lg`}
              >
                <X size={18} />
              </motion.button>
            </div>
         
            <div className="w-full h-full overflow-hidden flex flex-col">
              <div className="h-full flex-1 overflow-y-auto">
                <Chatbot
                  isDialog={true}
                  initialConversation={persistentConversation}
                  onConversationUpdate={handleConversationUpdate}
                  renderOpeningTitle={(
                    <div className="flex items-center justify-center gap-4">
                      <BlurText
                        text="Hey there"
                        delay={40}
                        animateBy="words"
                        direction="top"
                        className="text-4xl font-semibold dark:text-gray-50"
                      />
                      <motion.span 
                        className="text-4xl inline-block origin-bottom-right"
                        variants={waveAnimation}
                        initial="initial"
                        animate="waving"
                      >
                        👋
                      </motion.span>
                    </div>
                  )}
                  renderOpeningSubtitle={(
                    <div className="flex items-center justify-center">
                      <BlurText
                        text="What can I help you with?"
                        delay={40}
                        animateBy="words"
                        direction="top"
                        className="text-xl text-muted-foreground dark:text-gray-300"
                      />
                    </div>
                  )}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 15,
            mass: 0.6,
            duration: 0.3
          }
        }}
        variants={buttonHoverEffect}
        whileHover="hover"
        whileTap="tap"
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 p-4 rounded-full ${iconBgColor} ${iconTextColor} shadow-lg z-50 transition-colors duration-200`}
        style={{
          boxShadow: isDarkMode ? 
            "0 8px 20px rgba(255,255,255,0.15)" : 
            "0 8px 20px rgba(0,0,0,0.15)"
        }}
      >
        <motion.div
          animate={{ 
            rotate: isOpen ? 360 : 0 
          }}
          transition={{ 
            duration: 0.5, 
            ease: [0.25, 0.1, 0.25, 1], 
            type: "spring",
            stiffness: 100,
            damping: 10
          }}
        >
          <Bot size={24} />
        </motion.div>
      </motion.button>
    </>
  );
};

export default FloatingChatbot;