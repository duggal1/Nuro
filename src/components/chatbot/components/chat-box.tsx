/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */



"use client";

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpIcon, BarChart3Icon, FileTextIcon, X, Download, ImageIcon, SparklesIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { chat } from "@/actions/chat";
import { processPDF } from "@/actions/pdf";
import { PDFProcessResult } from "@/actions/pdf";
import { cn } from "@/lib/utils";
import MarkdownRenderer from "./markdown-renderer";
import { AIInputWithFile } from "./ui/ai-input-with-file";
import SearchButton from '@/components/button/search-button';
import ThinkButton from '@/components/button/think-button';
import DeepResearchButton from '@/components/button/deep-research-button';
import { SearchingShimmer, ResearchingShimmer, ThinkingShimmer, ImageGeneratingShimmer } from '@/components/BlurText/ShinnyText';

import { Skeleton } from "./ui/skeleton";
import BlurText from '@/components/BlurText/BlurText';

const prompts = [
    {
      // 1. Image generation prompt
      icon: <ImageIcon strokeWidth={1.8} className="h-7 w-7 text-indigo-500" />, // Indigo accent for images
      text: "Create an image of a DNA double helix",
    },
    {
      // 2. PDF summary prompt
      icon: <FileTextIcon strokeWidth={1.8} className="h-7 w-7 text-teal-500" />, // Teal accent for documents
      text: "Summarize the attached PDF",
    },
    {
      // 3. Bio/DNA prompt
      icon: <SparklesIcon strokeWidth={1.8} className="h-7 w-7 text-yellow-500" />, // Yellow accent for bio queries
      text: "Describe the DNA structure",
    },
    {
      // 4. Gene mutation prompt
      icon: <BarChart3Icon strokeWidth={1.8} className="h-7 w-7 text-purple-500" />, // Purple accent for genetics
      text: "Outline gene mutation mechanisms",
    },
  ];
  
export type Message = {
    role: "user" | "assistant";
    content: string;
    images?: GeneratedImage[];
}

interface GeneratedImage {
    id: number;
    data: string; // base64-encoded image data
}

interface ChatbotProps {
    isDialog?: boolean;
    renderOpeningTitle?: React.ReactNode;
    renderOpeningSubtitle?: React.ReactNode;
    initialConversation?: Message[];
    onConversationUpdate?: (conversation: Message[]) => void;
}

// Custom file icons as SVG components
const FileIcons = {
    PDF: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
        <path fill="#f42727" d="M28,29V3c0-1.7-1.3-3-3-3H3c1.7,0,3,1.3,3,3v26c0,1.7,1.3,3,3,3h22C29.3,32,28,30.7,28,29z"></path>
        <path fill="#e20c0c" d="M3 0C1.3 0 0 1.3 0 3v3h6V3C6 1.3 4.7 0 3 0zM6.9 31.1C7.4 31.7 8.2 32 9 32h3v-6L6.9 31.1z"></path>
        <path fill="#bf0202" d="M12,26v3c0,1.7-1.3,3-3,3h20c1.7,0,3-1.3,3-3v-3H12z"></path>
        <path fill="#e6e6e6" d="M12.4 14.8c-.1 0-.2 0-.2 0v1.9h-.9v-4.9h1.4c.2 0 .4 0 .6 0 .2 0 .3.1.5.1.3.1.6.3.8.5.2.2.3.5.3.9 0 .2 0 .4-.1.6-.1.2-.2.3-.4.5s-.4.2-.7.3C13.1 14.8 12.8 14.8 12.4 14.8zM12 14c.1 0 .1 0 .2 0 .1 0 .2 0 .2 0 .2 0 .4 0 .6-.1s.3-.1.4-.2.2-.2.2-.3c0-.1.1-.2.1-.3 0-.1 0-.3-.1-.4-.1-.1-.2-.2-.3-.2-.1 0-.2-.1-.3-.1-.1 0-.3 0-.5 0H12V14zM15.6 16.7v-4.9h1.3c.1 0 .2 0 .4 0 .1 0 .2 0 .3 0 .1 0 .2 0 .3.1s.2 0 .3.1c.3.1.5.2.7.3.2.1.4.3.5.5.1.2.2.4.3.6.1.2.1.5.1.8 0 .3 0 .5-.1.7-.1.2-.1.4-.3.6-.1.2-.3.4-.5.5-.2.1-.4.3-.6.4-.2.1-.4.1-.7.2s-.6.1-.9.1H15.6zM16.8 16c.5 0 .9-.1 1.2-.2.3-.1.5-.3.6-.6.1-.2.2-.6.2-.9 0-.2 0-.4-.1-.5s-.1-.3-.2-.4c-.1-.1-.2-.2-.3-.3-.1-.1-.3-.2-.4-.2-.1-.1-.3-.1-.5-.1-.2 0-.4 0-.6 0h-.4V16H16.8zM21.6 16.7h-.9v-4.9h3.1v.8h-2.2v1.3h1.9v.8h-1.9V16.7z"></path>
      </svg>
    ),
    CSV: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v28a1 1 0 0 0 1 1h27v16H13a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#66bb6a" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M19 43.32h1.8a3.15 3.15 0 0 1-.6 1.52 3.22 3.22 0 0 1-1.2.96 3.86 3.86 0 0 1-1.61.35A3.58 3.58 0 0 1 14.62 45a4.19 4.19 0 0 1-1.08-3 4.29 4.29 0 0 1 1.06-3 3.47 3.47 0 0 1 2.69-1.18A3.52 3.52 0 0 1 20 39a3.43 3.43 0 0 1 .79 1.76H19a1.57 1.57 0 0 0-.59-.88 1.91 1.91 0 0 0-1.1-.31 1.86 1.86 0 0 0-1.49.68 2.66 2.66 0 0 0-.56 1.75 2.6 2.6 0 0 0 .58 1.75 1.88 1.88 0 0 0 1.5.67 1.66 1.66 0 0 0 1.66-1.1zm3.35.3H24a1.37 1.37 0 0 0 1.49 1.08 1.42 1.42 0 0 0 .88-.25.8.8 0 0 0 .33-.67.77.77 0 0 0-.55-.78q-.11 0-1-.3a5.89 5.89 0 0 1-1.78-.7 2 2 0 0 1-.82-1.7 2.27 2.27 0 0 1 .75-1.78 2.85 2.85 0 0 1 2-.67 3.15 3.15 0 0 1 2 .62 2 2 0 0 1 .82 1.6h-1.67a1 1 0 0 0-1.13-.78 1.25 1.25 0 0 0-.77.22.71.71 0 0 0-.29.59.65.65 0 0 0 .36.62 5.64 5.64 0 0 0 1.25.36 4.82 4.82 0 0 1 1.58.56 2.17 2.17 0 0 1 1 1.91 2.38 2.38 0 0 1-1.13 2.12 3.41 3.41 0 0 1-1.87.46A3 3 0 0 1 22.83 45a2.9 2.9 0 0 1-.48-1.38zM32.26 46l-3-8h1.79L33 43.4l1.67-5.4h1.75l-2.65 8z"></path>
      </svg>
    ),
    XLSX: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#4CAF50" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M15.5 46l2.3-8h1.9l2.3 8h-1.8l-.5-1.8h-2l-.5 1.8h-1.7zm2.3-3.2h1.5l-.8-2.9-.7 2.9zm8.1-5h1.8v6.6h3.3V46h-5.1v-8.2zm6.2 0H34v8.2h-1.8v-8.2zm4.5 3.2h3.3v1.6h-3.3v1.8h3.5V46h-5.3v-8.2h5.1v1.6h-3.3v1.6z"></path>
      </svg>
    ),
    TXT: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#607D8B" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M21.5 46h-1.8v-6.6h-2.2v-1.6h6.2v1.6h-2.2V46zm4.9-8.2H30v8.2h-1.8v-8.2zm3.1 0h1.8v6.6h3.3V46h-5.1v-8.2z"></path>
      </svg>
    ),
    HTML: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#E65100" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M17.5 46l-3-8h1.9l2.1 5.5 2-5.5h1.9l-3 8h-1.9zm8.1-8.2h1.8v6.6h3.3V46h-5.1v-8.2zm3.8 4.1c0-1.3.3-2.3 1-3 .7-.7 1.6-1.1 2.7-1.1 1.2 0 2.1.4 2.8 1.1.7.7 1 1.7 1 3s-.3 2.3-1 3c-.7.7-1.6 1.1-2.8 1.1-1.2 0-2.1-.4-2.8-1.1-.6-.8-.9-1.8-.9-3.1zm1.8 0c0 .9.2 1.5.5 2 .3.4.8.6 1.4.6.6 0 1.1-.2 1.4-.6.3-.4.5-1.1.5-2s-.2-1.5-.5-2c-.3-.4-.8-.6-1.4-.6-.6 0-1.1.2-1.4.6-.3.5-.5 1.1-.5 2z"></path>
      </svg>
    ),
    IMAGE: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#03A9F4" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M17 38a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm-1 12l4-4 2 2 6-6 8 8H16z"></path>
      </svg>
    ),
    AUDIO: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#9C27B0" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M22 36v12h4V36h-4zm-8 4v8h4v-8h-4zm16 3v5h4v-5h-4z"></path>
      </svg>
    ),
    VIDEO: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#F44336" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M26 38l-10 6v-12l10 6zm-2 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"></path>
      </svg>
    ),
    ZIP: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#795548" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M26 36v1h-2v2h2v1h-2v2h2v2h-4v-8h4zm2-2h-8v12h8v-2h-2v-1h2v-2h-2v-1h2v-6z"></path>
      </svg>
    ),
    DOC: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#2196F3" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M16 46h-2v-8h3c.8 0 1.4.2 1.9.7.4.4.6 1 .6 1.7 0 .8-.2 1.3-.7 1.8-.5.4-1.1.6-1.9.6H16V46zm0-5h.9c.2 0 .4-.1.6-.2a.9.9 0 0 0 .2-.7c0-.3-.1-.6-.2-.7-.2-.2-.4-.2-.7-.2H16V41zm7.1-3.2c.7 0 1.3.2 1.8.7.5.5.7 1.1.7 1.9V43c0 .8-.2 1.4-.7 1.9-.5.5-1.1.7-1.8.7s-1.3-.2-1.8-.7c-.5-.5-.7-1.1-.7-1.9v-2.6c0-.8.2-1.4.7-1.9.5-.5 1.1-.7 1.8-.7zm0 1.6c-.2 0-.4.1-.6.3-.1.2-.2.4-.2.8V43c0 .3.1.6.2.8.1.2.3.3.6.3.2 0 .4-.1.6-.3.1-.2.2-.4.2-.8v-2.6c0-.3-.1-.6-.2-.8-.2-.2-.4-.3-.6-.3-.2 0 .4.1.6.2.1.2.2.4.2.7v2.2z"></path>
      </svg>
    ),
    JSON: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#FFC107" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M16.9 41.7c0-.5-.1-.8-.3-1.1-.2-.2-.6-.3-1-.3-.5 0-.9.1-1.1.4-.3.2-.4.6-.4 1.1v2.4c0 .5.1.9.4 1.1.3.3.6.4 1.1.4.4 0 .8-.1 1-.3.2-.2.3-.6.3-1v-.5h-1.3v-1.2h3.1v1.5c0 .9-.2 1.6-.7 2.1-.5.5-1.2.7-2.1.7-1 0-1.7-.3-2.3-.8-.5-.5-.8-1.3-.8-2.2v-2.2c0-1 .3-1.7.8-2.2.5-.5 1.3-.8 2.3-.8.9 0 1.6.2 2.1.7.5.5.7 1.1.7 2v.2h-1.8zm3.8 3.8c0 .2.1.4.2.5.1.1.3.2.5.2.3 0 .5-.1.6-.2.1-.1.2-.3.2-.6v-.4c0-.2 0-.3-.1-.4s-.2-.1-.3-.2L20.5 44c-.4-.1-.7-.3-.9-.5-.2-.2-.3-.6-.3-1v-.3c0-.6.2-1 .5-1.3.3-.3.8-.5 1.4-.5s1.1.2 1.4.5c.3.3.5.8.5 1.3v.4h-1.7v-.2c0-.2-.1-.4-.2-.5-.1-.1-.3-.2-.4-.2-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5v.2c0 .2.1.4.2.5.1.1.3.2.5.3l1.2.4c.4.1.7.3.9.6.2.2.3.6.3 1v.5c0 .6-.2 1-.5 1.3-.3.3-.8.5-1.5.5-.6 0-1.1-.2-1.5-.5-.3-.3-.5-.8-.5-1.4v-.6h1.7v.3zm6.7-6.7c.6 0 1.1.2 1.5.5.3.3.5.8.5 1.3v6h-1.8v-5.8c0-.2-.1-.4-.2-.5-.1-.1-.3-.2-.5-.2-.2 0-.4.1-.6.2-.1.1-.2.3-.2.5v5.8h-1.8v-8h1.8zm0-1.8h-1.8v-1.2h1.8v1.2zm5.2 0h-1.8v.5c-.1-.2-.3-.3-.5-.4-.2-.1-.4-.2-.7-.2-.6 0-1 .2-1.4.7-.3.4-.5 1.1-.5 1.9v1.5c0 .8.2 1.5.5 1.9.3.4.8.7 1.4.7.3 0 .5-.1.7-.2.2-.1.4-.3.5-.4v2.1h1.8v-8.1zm-1.8 5.1c0 .3-.1.5-.2.7-.1.2-.3.2-.6.2-.3 0-.5-.1-.6-.3-.1-.2-.2-.5-.2-.9v-1.6c0-.4.1-.7.2-.9.1-.2.3-.3.6-.3.2 0 .4.1.6.2.1.2.2.4.2.7v2.2z"></path>
      </svg>
    ),
    CODE: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#424242" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M20 38l-5 5 5 5 2-2-3-3 3-3-2-2zm8 0l2 2 3 3-3 3-2 2 5-5-5-5z"></path>
      </svg>
    ),
    UNKNOWN: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
        <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
        <rect width="34" height="20" x="8" y="32" fill="#9E9E9E" rx="1" ry="1"></rect>
        <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
        <path fill="#fff" d="M25 42a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm-3-6c-1.1 0-2 .9-2 2h4c0-1.1-.9-2-2-2z"></path>
      </svg>
    )
};

// Define Activity States (must match the one in chat.ts)
type ActivityState = "IDLE" | "THINKING" | "SEARCHING" | "RESEARCHING" | "GENERATING_IMAGES";

const Chatbot: React.FC<ChatbotProps> = ({ 
    isDialog = false, 
    renderOpeningTitle,
    renderOpeningSubtitle,
    initialConversation = [],
    onConversationUpdate
}) => {
    const messageEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);

    const [input, setInput] = useState<string>("");
    const [conversation, setConversation] = useState<Message[]>(initialConversation);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasStartedChat, setHasStartedChat] = useState<boolean>(initialConversation.length > 0);
    const [searchUrls, setSearchUrls] = useState<{ url: string; favicon: string }[]>([]);
    const [currentFiles, setCurrentFiles] = useState<File[]>([]);
    const [activityState, setActivityState] = useState<ActivityState>("IDLE");
    const [isThinkEnabled, setIsThinkEnabled] = useState<boolean>(false); // Make it true to enable thinking by default
    const [showThinkingShimmer, setShowThinkingShimmer] = useState<boolean>(false);
    const [isProcessingFiles, setIsProcessingFiles] = useState<boolean>(false);
    const [isDeepResearchEnabled, setIsDeepResearchEnabled] = useState<boolean>(false);
    // Image generation states
    const [isGeneratingImages, setIsGeneratingImages] = useState<boolean>(false);
    const [imageGenerationPrompt, setImageGenerationPrompt] = useState<string>("");
    const [currentMessageForImages, setCurrentMessageForImages] = useState<number | null>(null);
    
    // Add a special effect for dialog mode
    useEffect(() => {
        if (isDialog) {
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isDialog]);

    // Add this useEffect to monitor the state
    useEffect(() => {
        console.log('!!! currentFiles state updated in chat-box.tsx:', currentFiles);
    }, [currentFiles]);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Update the conversation and notify parent component if callback is provided
    // Not currently used but kept for potential future use
    const _updateConversation = (newConversation: Message[]) => {
        setConversation(newConversation);
        if (onConversationUpdate) {
            onConversationUpdate(newConversation);
        }
    };
    
    // Use this for updates that depend on the current state
    const appendToConversation = (message: Message) => {
        setConversation(prevConversation => {
            const updatedConversation = [...prevConversation, message];
            if (onConversationUpdate) {
                queueMicrotask(() => {
                    onConversationUpdate(updatedConversation);
                });
            }
            return updatedConversation;
        });
    };
    
    // Not used yet but might be useful for future implementations
    const _updateLastMessage = (content: string) => {
        setConversation(prevConversation => {
            if (prevConversation.length === 0) {
                return prevConversation;
            }
            
            const updatedConversation = [...prevConversation];
            updatedConversation[updatedConversation.length - 1] = {
                ...updatedConversation[updatedConversation.length - 1],
                content
            };
            
            if (onConversationUpdate) {
                onConversationUpdate(updatedConversation);
            }
            
            return updatedConversation;
        });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation, searchUrls]);

    const handlePromptClick = (text: string) => {
        setInput(text);
        if (inputRef.current) {
            inputRef.current.textContent = text;
        }
    };
    
    // Function to detect if a message is an image generation request
    const isImageGenerationRequest = (text: string): boolean => {
        const lowerText = text.toLowerCase().trim();
        // More flexible regex: looks for an action verb, then an image-related noun, then "of"
        // Allows other words in between using [\s\S]*? (non-greedy match for any character including newline)
        const imageGenRegex = /\b(generate|create|draw|make|render|visualize|imagine|show|craft|design|produce)\b[\s\S]*?\b(image|images|picture|pictures|photo|photos|illustration|illustrations|artwork|artworks|drawing|drawings|graphic|graphics)\b[\s\S]*?\bof\b/i;
        return imageGenRegex.test(lowerText);
    };
     
    
    // Function to generate images
    const generateImages = async (prompt: string): Promise<GeneratedImage[]> => {
        setIsGeneratingImages(true);
        try {
            const res = await fetch('/api/image-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to generate images');
            }
            
            interface ImageResponse {
                images: Array<{
                    id: number;
                    data: string;
                }>;
            }
            
            const data = await res.json() as ImageResponse;
            return data.images.map((img) => ({
                id: img.id,
                data: `data:image/png;base64,${img.data}`,
            }));
        } catch (error) {
            console.error('Image generation error:', error);
            throw error;
        } finally {
            setIsGeneratingImages(false);
        }
    };

    const handleFileChange = (files: File[]) => {
        console.log('!!! handleFileChange in chat-box.tsx CALLED with files:', files);
        setCurrentFiles(files);
    };

    const handleFileRemove = (index: number) => {
        console.log('!!! handleFileRemove called with index:', index);
        setCurrentFiles(prevFiles => {
            const updatedFiles = prevFiles.filter((_, i) => i !== index);
            console.log('Updated files after removal:', updatedFiles);
            return updatedFiles;
        });
    };

    // Helper functions to add (place these before handleSend in chat-box.tsx)
    const extractUrls = (text: string): string[] => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        return (text.match(urlRegex) || []).filter(url => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        });
    };

    const createFaviconUrl = (url: string): string => {
        try {
            return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(url).hostname)}`;
        } catch {
            return "/fallback-favicon.png";
        }
    };


    function extractImagePrompt(text: string): string {
        // Regex to capture the subject after "of" in an image generation command
        // It mirrors the flexibility of the new isImageGenerationRequest regex
        const imagePromptRegex = /\b(?:generate|create|draw|make|render|visualize|imagine|show|craft|design|produce)\b[\s\S]*?\b(?:image|images|picture|pictures|photo|photos|illustration|illustrations|artwork|artworks|drawing|drawings|graphic|graphics)\b[\s\S]*?\bof\s+([\s\S]+)/i;
        const match = text.match(imagePromptRegex);
        
        if (match && match[1]) {
            return match[1].trim(); // Return the captured group (the subject of the image)
        }
        // Fallback to returning the original text if the specific pattern isn't matched,
        // allowing the backend to attempt to parse it.
        return text;
    }

    const handleSend = async () => {
        const userTextInput = input.trim();
        const filesToSend = [...currentFiles];

        if (!userTextInput && filesToSend.length === 0) return;
        if (isLoading || isProcessingFiles || isGeneratingImages) return;

        setIsLoading(true);
        setHasStartedChat(true);
        setSearchUrls([]);
        
        // Check if this is an image generation request
        const isImageRequest = isImageGenerationRequest(userTextInput);

        let combinedInput = userTextInput;
        let pdfProcessingError: string | null = null;

        const pdfFiles = filesToSend.filter(file => file.type === 'application/pdf');
        if (pdfFiles.length > 0) {
            setIsProcessingFiles(true);
            setActivityState("THINKING");
            console.log(`[Chat] Processing ${pdfFiles.length} PDF file(s) from current selection...`);

            const pdfSummaries: string[] = [];

            try {
                const processingPromises = pdfFiles.map(async (pdfFile) => {
                    const formData = new FormData();
                    formData.append("file", pdfFile);
                    formData.append("prompt", `Summarize this document (${pdfFile.name}) concisely, focusing on the key points.`);
                    return await processPDF(formData);
                });

                const results = await Promise.all(processingPromises);

                results.forEach((result: PDFProcessResult) => {
                    if ('summary' in result) {
                        pdfSummaries.push(`Summary of ${result.fileName}:\n${result.summary}`);
                    } else {
                        console.error(`[Chat] Error processing PDF ${result.fileName}: ${result.error}`);
                        const errorMsg = `Error processing file: ${result.fileName}.`;
                        pdfProcessingError = pdfProcessingError ? `${pdfProcessingError} ${errorMsg}` : errorMsg;
                    }
                });

                if (pdfSummaries.length > 0) {
                    combinedInput = `Based on the attached file(s):\n${pdfSummaries.join("\n\n")}\n\n${userTextInput ? `User query: ${userTextInput}` : 'User asked to process the attached file(s).'}`;
                    console.log("[Chat] PDF Summaries combined with input.");
                } else if (!pdfProcessingError && userTextInput === "") {
                    combinedInput = "Could not extract summaries from the provided PDF(s). What would you like to know about them?";
                }

            } catch (error) {
                console.error("[Chat] Failed to process PDF files:", error);
                pdfProcessingError = "An unexpected error occurred while processing the PDF files.";
            }
        }

        if (!combinedInput.trim() && filesToSend.length > 0 && !pdfProcessingError) {
            combinedInput = `Processing attached file(s): ${filesToSend.map(f => f.name).join(', ')}. What would you like to do?`;
        }

        const userMessage: Message = {
            role: "user",
            content: combinedInput || `[User attached ${filesToSend.length} file(s)]`,
        };
        
        // Add user message if there's text/files or a PDF error
        let userMessageAdded = false;
        if (combinedInput.trim() || filesToSend.length > 0 || pdfProcessingError) {
            appendToConversation(userMessage);
            setInput(""); // Clear the text input only
            userMessageAdded = true; // Mark that we added it
            
            if (isImageRequest && userTextInput) {
                const imagePrompt = extractImagePrompt(userTextInput);
                setImageGenerationPrompt(imagePrompt);
                setCurrentMessageForImages(conversation.length);
            
                // Add assistant message placeholder
                const assistantMessage: Message = {
                    role: "assistant",
                    content: "Generating images based on your prompt..."
                };
            
                appendToConversation(assistantMessage);
            
                // Generate images
                try {
                    const generatedImages = await generateImages(imagePrompt);
            
                    // Update assistant message with generated images
                    setConversation(prevConversation => {
                        const updatedConversation = [...prevConversation];
                        const assistantIndex = updatedConversation.length - 1;
            
                        if (assistantIndex >= 0 && updatedConversation[assistantIndex].role === "assistant") {
                            updatedConversation[assistantIndex] = {
                                ...updatedConversation[assistantIndex],
                                content: `Here are the images based on your prompt: "${imagePrompt}"`,
                                images: generatedImages
                            };
                        }
            
                        if (onConversationUpdate) {
                            onConversationUpdate(updatedConversation);
                        }
            
                        return updatedConversation;
                    });
                } catch (error) {
                    // Update assistant message with error
                    setConversation(prevConversation => {
                        const updatedConversation = [...prevConversation];
                        const assistantIndex = updatedConversation.length - 1;
            
                        if (assistantIndex >= 0 && updatedConversation[assistantIndex].role === "assistant") {
                            updatedConversation[assistantIndex] = {
                                ...updatedConversation[assistantIndex],
                                content: `Sorry, I couldn't generate images based on your prompt. ${error instanceof Error ? error.message : 'Please try again with a different prompt.'}`
                            };
                        }
            
                        if (onConversationUpdate) {
                            onConversationUpdate(updatedConversation);
                        }
            
                        return updatedConversation;
                    });
                } finally {
                    setIsLoading(false);
                    setActivityState("IDLE");
                }
            
                return; // Exit early after image generation
           
            }
        } else {
            console.log("[Chat] No user text, files, or errors to process.");
            setIsLoading(false);
            setActivityState("IDLE");
            return; // Exit early
        }

        // Handle PDF processing errors (logic remains the same)
        if (pdfProcessingError) {
             appendToConversation({
                 role: "assistant",
                 content: `Sorry, I encountered an issue processing the PDF(s): ${pdfProcessingError}${userTextInput ? ' I will proceed with your text query.' : ' Please try again or ask without the file.'}`
             });
             if (!userTextInput) {
                 setIsLoading(false);
                 setIsProcessingFiles(false);
                 setActivityState("IDLE");
                 return;
             }
        }

        // Proceed with the chat API call only if a user message was actually added
        // (This prevents sending empty history if only a PDF error occurred without text)
        if (userMessageAdded && combinedInput.trim()) { // Ensure we intended to send content
            const thinkBudgetEnabled = isThinkEnabled;
            setShowThinkingShimmer(thinkBudgetEnabled);
            if (!isProcessingFiles && activityState !== "THINKING") {
                setActivityState("THINKING");
            }

            try {
                // Construct the history for the API call explicitly, including the new user message.
                // Use the state *before* the update + the new message for certainty.
                const historyForApi = [...conversation, userMessage];
                console.debug(`[Chat] Deep research enabled: ${isDeepResearchEnabled}`);

                const { stream, searchUrlsStream, activityState: initialActivityState } = await chat(
                    historyForApi, // Pass the explicitly constructed history
                    thinkBudgetEnabled,
                    isDeepResearchEnabled // Pass the deep research state
                );

                setActivityState(initialActivityState);
                if (searchUrlsStream && searchUrlsStream.length > 0) {
                    setSearchUrls(searchUrlsStream);
                }
                 const reader = stream.getReader();
                const decoder = new TextDecoder();
                let textContent = "";
                let placeholderAdded = false;

                // Add placeholder for assistant response
                setConversation(prevConversation => {
                     // ... (logic to add assistant placeholder remains the same) ...
                      const lastMsg = prevConversation[prevConversation.length - 1];
                    if (!lastMsg || lastMsg.role === 'user' || (lastMsg.role === 'assistant' && lastMsg.content !== "")) {
                        const assistantMsg: Message = { role: "assistant", content: "" };
                        // Use the callback form to ensure we append to the *latest* state
                        const newConv = [...prevConversation, assistantMsg]; 
                        if (onConversationUpdate) {
                            onConversationUpdate(newConv);
                        }
                        placeholderAdded = true;
                        return newConv;
                    }
                     if (lastMsg.role === 'assistant' && lastMsg.content === "") {
                        placeholderAdded = true; // Placeholder already exists
                     }
                    return prevConversation; // No change needed if placeholder exists
                });
                // Stream the response
                 while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    textContent += chunk;

                    // Update the last assistant message content
                    setConversation(prevConversation => {
                         // Use callback form to ensure update is based on the latest state
                         const updatedConv = [...prevConversation];
                         const lastMessageIndex = updatedConv.length - 1;

                          // Ensure placeholder logic runs correctly within the update
                         if (!placeholderAdded) {
                              const lastMsgCheck = updatedConv[lastMessageIndex];
                              if (!lastMsgCheck || lastMsgCheck.role === 'user' || (lastMsgCheck.role === 'assistant' && lastMsgCheck.content !== '')) {
                                  console.warn("Placeholder missing during stream, adding now.");
                                  updatedConv.push({ role: "assistant", content: "" });
                                  placeholderAdded = true;
                              } else if (lastMsgCheck.role === 'assistant' && lastMsgCheck.content === '') {
                                   placeholderAdded = true;
                              }
                         }

                         const currentLastIndex = updatedConv.length - 1; // Re-check index after potentially adding placeholder
                         if (currentLastIndex >= 0 && updatedConv[currentLastIndex]?.role === 'assistant') {
                             updatedConv[currentLastIndex].content = textContent; // Update the actual content
                         } else {
                             console.error("Streaming error: Could not find assistant message to update at index", currentLastIndex, updatedConv);
                         }

                         if (onConversationUpdate) {
                              // Call the update callback with the modified conversation
                              queueMicrotask(() => onConversationUpdate(updatedConv));
                         }
                         return updatedConv; // Return the updated state
                     });
                     // Extract URLs if present in the chunk
                    if (chunk.includes("http")) {
                        // ... (URL extraction logic remains the same) ...
                         const geminiUrls = extractUrls(textContent);
                         const currentUrlStrings = searchUrls.map(item => item.url);
                         const newUrls = geminiUrls.filter(url => !currentUrlStrings.includes(url));

                         if (newUrls.length > 0) {
                             const newUrlsWithFavicons = newUrls.map(url => ({
                                 url,
                                 favicon: createFaviconUrl(url)
                             }));
                              setSearchUrls(prev => {
                                 const combined = [...prev, ...newUrlsWithFavicons];
                                 const uniqueUrls = Array.from(new Map(combined.map(item => [item.url, item])).values());
                                 return uniqueUrls;
                              });
                         }
                    }
                 }

            } catch (error) {
                // ... (error handling logic remains the same) ...
                 console.error("Error in handleSend during chat stream: ", error);
                 // Update last message to show error
                 setConversation(prevConversation => {
                    // Use callback form for safety
                     const lastMessage = prevConversation[prevConversation.length - 1];
                    if (lastMessage?.role === 'assistant' && (lastMessage.content === "" || lastMessage.content.startsWith("Sorry"))) {
                         // Update existing empty/error assistant message
                         const updatedConv = [...prevConversation];
                         updatedConv[updatedConv.length - 1] = {
                                role: "assistant",
                                content: "Sorry, there was an error responding. Please try again",
                            };
                         if (onConversationUpdate) queueMicrotask(() => onConversationUpdate(updatedConv));
                         return updatedConv;
                        } else {
                            // Append a new error assistant message
                            const errorMsg: Message = {
                                role: "assistant",
                                content: "Sorry, there was an error responding. Please try again",
                            };
                        const newConv = [...prevConversation, errorMsg];
                        if (onConversationUpdate) queueMicrotask(() => onConversationUpdate(newConv));
                        return newConv;
                        }
                });

            } finally {
                // ... (finally block logic remains the same - DON'T clear files) ...
                setIsLoading(false);
                setIsProcessingFiles(false);
                setActivityState("IDLE");
                setShowThinkingShimmer(false);
            }
        } else {
             // This case handles situations where only a PDF error occurred without user text,
             // or if the user message wasn't added for some reason.
             setIsLoading(false);
             setIsProcessingFiles(false); // Ensure reset
             setActivityState("IDLE");
             console.log("[Chat] No text input sent to backend.");
        }
    };

    const truncateUrl = (url: string, maxLength: number = 50) => {
        return url.length > maxLength ? `${url.slice(0, maxLength - 3)}...` : url;
    };

    const getFileIconForType = (type: string, name: string) => {
        if (type.startsWith("image/")) {
            return <FileIcons.IMAGE />;
        } else if (type === "application/pdf") {
            return <FileIcons.PDF />;
        } else if (type.includes("word") || name.endsWith(".docx") || name.endsWith(".doc")) {
            return <FileIcons.DOC />;
        } else if (type === "text/plain" || name.endsWith(".txt")) {
            return <FileIcons.TXT />;
        } else if (name.endsWith(".csv")) {
            return <FileIcons.CSV />;
        } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
            return <FileIcons.XLSX />;
        } else if (name.endsWith(".html") || name.endsWith(".htm")) {
            return <FileIcons.HTML />;
        } else if (name.endsWith(".json")) {
            return <FileIcons.JSON />;
        } else if (name.match(/\.(js|ts|jsx|tsx|py|rb|java|c|cpp|go|rs|sh|bash)$/)) {
            return <FileIcons.CODE />;
        } else if (name.match(/\.(zip|rar|tar|gz|7z)$/)) {
            return <FileIcons.ZIP />;
        } else if (type.startsWith("audio/")) {
            return <FileIcons.AUDIO />;
        } else if (type.startsWith("video/")) {
            return <FileIcons.VIDEO />;
        } else {
            return <FileIcons.UNKNOWN />;
        }
    };

    // Component for displaying a file with animation
    function FilePill({ file, index, onRemove }: { file: File, index: number, onRemove: (index: number) => void }) {
        const formatFileSize = (bytes: number): string => {
            if (bytes === 0) return "0 Bytes";
            const k = 1024;
            const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
        };

        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.8, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 5 }}
                transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }}
                className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded-lg text-xs"
            >
                <div className="text-gray-600 dark:text-gray-300 flex-shrink-0">
                    {getFileIconForType(file.type, file.name)}
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate max-w-[120px]" title={file.name}>
                        {file.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                        {formatFileSize(file.size)}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        console.log(`!!! FilePill remove button clicked for index: ${index}`);
                        onRemove(index);
                    }}
                    className="ml-auto p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring z-10 relative flex-shrink-0"
                    aria-label={`Remove ${file.name}`}
                >
                    <X className="h-3 w-3" />
                </button>
            </motion.div>
        );
    }

    // Skeleton Component for Assistant Message
    const AssistantMessageSkeleton = () => (
        <div className="flex space-x-2 animate-pulse">
            <div className="h-3 w-3/5 rounded bg-muted-foreground/30"></div>
            <div className="h-3 w-2/5 rounded bg-muted-foreground/30"></div>
        </div>
    );

    const getActivityShimmer = () => {
        switch (activityState) {
            case "SEARCHING":
                return <SearchingShimmer />;
            case "RESEARCHING":
                return <ResearchingShimmer />;
            case "GENERATING_IMAGES":
                return <ImageGeneratingShimmer />;
            case "THINKING":
                return showThinkingShimmer && <ThinkingShimmer />;
            default:
                return null;
        }
    };

    const ImageGalleryGrid = ({ images, message }: { images: GeneratedImage[], message: Message }) => {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                    duration: 0.8,
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                }}
                className="mt-4 space-y-3"
            >
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.15,
                                delayChildren: 0.1
                            }
                        }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                >
                    {images.map((image) => (
                        <motion.div
                            key={image.id}
                            variants={{
                                hidden: { 
                                    opacity: 0, 
                                    scale: 0.8,
                                    y: 30,
                                    rotate: -5
                                },
                                visible: { 
                                    opacity: 1, 
                                    scale: 1,
                                    y: 0,
                                    rotate: 0,
                                    transition: {
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 20,
                                        mass: 1
                                    }
                                }
                            }}
                            whileHover={{ 
                                scale: 1.03,
                                rotate: 1,
                                transition: { 
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 20
                                }
                            }}
                            className="relative overflow-hidden rounded-xl bg-card border border-border shadow-lg transform-gpu"
                        >
                            <div className="relative aspect-square">
                                <motion.img
                                    initial={{ filter: 'blur(10px)' }}
                                    animate={{ filter: 'blur(0px)' }}
                                    transition={{ duration: 0.5 }}
                                    src={image.data}
                                    alt={`Generated image ${image.id + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
                                    initial={{ opacity: 0 }}
                                    whileHover={{ opacity: 1 }}
                                />
                            </div>
                            <motion.div 
                                className="absolute bottom-0 right-0 p-3"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <motion.a
                                    href={image.data}
                                    download={`generated-image-${image.id + 1}.png`}
                                    className="flex items-center justify-center size-10 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
                                    whileHover={{ 
                                        scale: 1.1,
                                        backgroundColor: 'rgba(255, 255, 255, 0.95)'
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Download size={18} />
                                </motion.a>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>
        );
    };

    const handleDeepResearchChange = (enabled: boolean) => {
        setIsDeepResearchEnabled(enabled);
        console.debug(`[Chat] Deep research mode ${enabled ? 'enabled' : 'disabled'}`);
    };

    return (
        <div className={cn(
            "relative h-full flex flex-col items-center",
            isDialog && "pt-10" // Add padding top when in dialog mode
        )}>
            {/* Message Container */}
            <div className="flex-1 w-full max-w-3xl px-4">
                {!hasStartedChat ? (
                    <div className="flex flex-col justify-end h-full space-y-8">
                        <div className="text-center space-y-4">
                            {renderOpeningTitle || (
                                <h1 className="text-4xl font-semibold">
                                    Hi there 👋
                                </h1>
                            )}
                            {renderOpeningSubtitle || (
                                <h2 className="text-xl text-muted-foreground">
                                    What can I help you with?
                                </h2>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-4">
                            <AnimatePresence>
                                {prompts.map((prompt, index) => (
                                    <motion.button
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ duration: 0.4, delay: index * 0.05, type: "spring", bounce: 0.25 }}
                                        onClick={() => handlePromptClick(prompt.text)}
                                        className="flex items-center gap-3 p-4 text-left border rounded-xl hover:bg-muted transition-all text-sm"
                                    >
                                        {prompt.icon}
                                        <span>

                                        <BlurText
                                         text={prompt.text}
                                         delay={10}
                                         animateBy="words"
                                         direction="top"
                                         className="text-md font-medium"
                                       />
                    
                     
                                          
                                        </span>
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        animate={{
                            paddingBottom: isDialog 
                                ? (input ? (input.split("\n").length > 3 ? "150px" : "100px") : "80px")
                                : (input ? (input.split("\n").length > 3 ? "206px" : "110px") : "80px")
                        }}
                        transition={{ duration: 0.2 }}
                        className="pt-8 space-y-4"
                    >
                        {conversation.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex",
                                    message.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                <div className={cn(
                                    "max-w-[80%] rounded-xl px-4 py-2 min-h-[36px]",
                                    message.role === "user"
                                        ? "bg-foreground text-background"
                                        : "bg-muted"
                                )}>
                                    {message.role === "assistant" ? (
                                        !message.content ? (
                                            <AssistantMessageSkeleton />
                                        ) : (
                                            <>
                                                <MarkdownRenderer content={message.content} />
                                                
                                                {/* Render generated images if present */}
                                                {message.images && message.images.length > 0 && (
                                                    <ImageGalleryGrid images={message.images} message={message} />
                                                )}

{message.content.includes("Generating images") && !message.images && (
    <>
            <ImageGeneratingShimmer />
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
            duration: 0.4,
            type: "spring",
            stiffness: 200,
            damping: 20
        }}
        className="mt-4 space-y-3"
    >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, idx) => (
                <motion.div 
                    key={idx} 
                    className="overflow-hidden rounded-xl border border-border bg-card"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.4,
                        delay: idx * 0.1,
                        type: "spring",
                        stiffness: 200,
                        damping: 20
                    }}
                >
                    <div className="relative aspect-square">
                        <Skeleton className="absolute inset-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent animate-pulse" />
                    </div>
                    <div className="p-2 flex justify-end">
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                </motion.div>
            ))}
                                                
                                               
                                                        </div>
                                                    </motion.div>
                                                    </>
)}
                                            </>
                                        )
                                    ) : (
                                        <p className="whitespace-pre-wrap">
                                            {message.content}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                         {activityState !== "IDLE" && (
                            <motion.div
                                key={`shimmer-${activityState}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex justify-start"
                            >
                                <div className="max-w-[80%] rounded-xl px-4 py-2 bg-muted">
                                    {getActivityShimmer()}
                                </div>
                            </motion.div>
                        )}

                        {searchUrls.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 p-4 bg-background border rounded-xl max-h-40 overflow-y-auto"
                            >
                                <h3 className="text-sm font-semibold text-foreground mb-2">Sources</h3>
                                <div className="space-y-2">
                                    {searchUrls.map((item, index) => (
                                        <motion.a
                                            key={index}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-all text-sm text-foreground"
                                        >
                                            <img
                                                src={item.favicon}
                                                alt="Favicon"
                                
                             
                                            />
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                        <div ref={messageEndRef} />
                    </motion.div>
                )}
            </div>

            {/* Input Container */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ 
                    opacity: 1, 
                    y: 0, 
                    position: hasStartedChat && !isDialog ? "fixed" : "relative"
                }}
                className={cn(
                    "w-full bg-gradient-to-t from-background via-background/80 to-transparent pb-4 pt-6 bottom-0 mt-auto z-10",
                    isDialog && "sticky bottom-0"
                )}
            >
                 <div className="max-w-3xl mx-auto px-4">
                    <AnimatePresence>
                        {currentFiles.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginBottom: '0.5rem' }}
                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="rounded-xl px-3 py-2 overflow-hidden"
                            >
                                <div className="text-xs text-muted-foreground mb-1">
                                    {currentFiles.length} {currentFiles.length === 1 ? 'file' : 'files'} selected
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {currentFiles.map((file, index) => (
                                        <FilePill
                                            key={`${file.name}-${file.lastModified}-${index}`}
                                            file={file}
                                            index={index}
                                            onRemove={handleFileRemove}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-end gap-2">
                        <motion.div
                           layout
                           transition={{ duration: 0.3, type: "spring", bounce: 0.3 }}
                           className="flex-grow border rounded-2xl p-2.5 flex items-end gap-2 bg-background shadow-sm"
                        >
                           <div className="flex gap-1 items-center shrink-0">
                                <SearchButton />
                                <ThinkButton
                                    isEnabled={isThinkEnabled}
                                    onClick={() => setIsThinkEnabled(!isThinkEnabled)}
                                />
                                <DeepResearchButton 
                                    enabled={isDeepResearchEnabled}
                                    onChange={handleDeepResearchChange}
                                />
                            </div>

                            <div
                                contentEditable
                                role="textbox"
                                onInput={(e) => {
                                    setInput(e.currentTarget.textContent || "");
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                data-placeholder="Message..."
                                className="flex-1 min-h-[24px] max-h-[150px] overflow-y-auto focus:outline-none text-sm bg-transparent empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)] whitespace-pre-wrap break-words self-center py-1"
                                ref={(element) => {
                                    inputRef.current = element;
                                    if (element && element.textContent !== input) {
                                       element.textContent = input;
                                    } else if (element && !input) {
                                        element.textContent = "";
                                    }
                                }}
                             />

                             <div className="flex gap-2 items-center shrink-0 self-end">
                                 <div className="shrink-0">
                                     <AIInputWithFile
                                         onFilesChange={handleFileChange}
                                         accept="*/*"
                                         maxFileSize={2000}
                                         maxFiles={10}
                                     />
                                 </div>
                                 <Button
                                     size="icon"
                                     className="rounded-full shrink-0 h-9 w-9"
                                     onClick={handleSend}
                                     disabled={isLoading || isProcessingFiles || (!input.trim() && currentFiles.length === 0)}
                                 >
                                     <ArrowUpIcon strokeWidth={2.5} className="size-5" />
                                 </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
};

export default Chatbot