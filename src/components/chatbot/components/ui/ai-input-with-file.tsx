/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Paperclip,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { useFileInput } from "@/hooks/use-file-input";


// Custom file icons as SVG components
const FileIcons = {
  PDF: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32">
      <path fill="#f42727" d="M28,29V3c0-1.7-1.3-3-3-3H3c1.7,0,3,1.3,3,3v26c0,1.7,1.3,3,3,3h22C29.3,32,28,30.7,28,29z"></path>
      <path fill="#e20c0c" d="M3 0C1.3 0 0 1.3 0 3v3h6V3C6 1.3 4.7 0 3 0zM6.9 31.1C7.4 31.7 8.2 32 9 32h3v-6L6.9 31.1z"></path>
      <path fill="#bf0202" d="M12,26v3c0,1.7-1.3,3-3,3h20c1.7,0,3-1.3,3-3v-3H12z"></path>
      <path fill="#e6e6e6" d="M12.4 14.8c-.1 0-.2 0-.2 0-.1 0-.2 0-.2 0v1.9h-.9v-4.9h1.4c.2 0 .4 0 .6 0 .2 0 .3.1.5.1.3.1.6.3.8.5.2.2.3.5.3.9 0 .2 0 .4-.1.6-.1.2-.2.3-.4.5s-.4.2-.7.3C13.1 14.8 12.8 14.8 12.4 14.8zM12 14c.1 0 .1 0 .2 0 .1 0 .2 0 .2 0 .2 0 .4 0 .6-.1s.3-.1.4-.2.2-.2.2-.3c0-.1.1-.2.1-.3 0-.1 0-.3-.1-.4-.1-.1-.2-.2-.3-.2-.1 0-.2-.1-.3-.1-.1 0-.3 0-.5 0H12V14zM15.6 16.7v-4.9h1.3c.1 0 .2 0 .4 0 .1 0 .2 0 .3 0 .1 0 .2 0 .3.1s.2 0 .3.1c.3.1.5.2.7.3.2.1.4.3.5.5.1.2.2.4.3.6.1.2.1.5.1.8 0 .3 0 .5-.1.7-.1.2-.1.4-.3.6-.1.2-.3.4-.5.5-.2.1-.4.3-.6.4-.2.1-.4.1-.7.2s-.6.1-.9.1H15.6zM16.8 16c.5 0 .9-.1 1.2-.2.3-.1.5-.3.6-.6.1-.2.2-.6.2-.9 0-.2 0-.4-.1-.5s-.1-.3-.2-.4c-.1-.1-.2-.2-.3-.3-.1-.1-.3-.2-.4-.2-.1-.1-.3-.1-.5-.1-.2 0-.4 0-.6 0h-.4V16H16.8zM21.6 16.7h-.9v-4.9h3.1v.8h-2.2v1.3h1.9v.8h-1.9V16.7z"></path>
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
      <path fill="#fff" d="M16 46h-2v-8h3c.8 0 1.4.2 1.9.7.4.4.6 1 .6 1.7 0 .8-.2 1.3-.7 1.8-.5.4-1.1.6-1.9.6H16V46zm0-5h.9c.2 0 .4-.1.6-.2a.9.9 0 0 0 .2-.7c0-.3-.1-.6-.2-.7-.2-.2-.4-.2-.7-.2H16V41zm7.1-3.2c.7 0 1.3.2 1.8.7.5.5.7 1.1.7 1.9V43c0 .8-.2 1.4-.7 1.9-.5.5-1.1.7-1.8.7s-1.3-.2-1.8-.7c-.5-.5-.7-1.1-.7-1.9v-2.6c0-.8.2-1.4.7-1.9.5-.5 1.1-.7 1.8-.7zm0 1.6c-.2 0-.4.1-.6.3-.1.2-.2.4-.2.8V43c0 .3.1.6.2.8.1.2.3.3.6.3.2 0 .4-.1.6-.3.1-.2.2-.4.2-.8v-2.6c0-.3-.1-.6-.2-.8-.2-.2-.4-.3-.6-.3zm3.6 3.3h3.1V44h-3.1v-1.3zm8.8-5h1.8L34 46h-1.8l-.6-2.2h-2.4l-.6 2.2h-1.8l3.4-8.2zm-1.4 4.5l-.8-3-.8 3h1.6z"></path>
    </svg>
  ),
  JSON: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 64 64">
      <path fill="#eee" d="M55 18H42V5a1 1 0 0 0-1-1H13a1 1 0 0 0-1 1v54a1 1 0 0 0 1 1h42a1 1 0 0 0 1-1V19a1 1 0 0 0-1-1Z"></path>
      <rect width="34" height="20" x="8" y="32" fill="#FFC107" rx="1" ry="1"></rect>
      <path fill="#e0e0e0" d="m55.71 18.29-14-14A1 1 0 0 0 40 5v14a1 1 0 0 0 1 1h14a1 1 0 0 0 .71-1.71Z"></path>
      <path fill="#fff" d="M16.9 41.7c0-.5-.1-.8-.3-1.1-.2-.2-.6-.3-1-.3-.5 0-.9.1-1.1.4-.3.2-.4.6-.4 1.1v2.4c0 .5.1.9.4 1.1.3.3.6.4 1.1.4.4 0 .8-.1 1-.3.2-.2.3-.6.3-1v-.5h-1.3v-1.2h3.1v1.5c0 .9-.2 1.6-.7 2.1-.5.5-1.2.7-2.1.7-1 0-1.7-.3-2.3-.8-.5-.5-.8-1.3-.8-2.2v-2.2c0-1 .3-1.7.8-2.2.5-.5 1.3-.8 2.3-.8.9 0 1.6.2 2.1.7.5.5.7 1.1.7 2v.2h-1.8zm3.8 3.8c0 .2.1.4.2.5.1.1.3.2.5.2.3 0 .5-.1.6-.2.1-.1.2-.3.2-.6v-.4c0-.2 0-.3-.1-.4s-.2-.1-.3-.2L20.5 44c-.4-.1-.7-.3-.9-.5-.2-.2-.3-.6-.3-1v-.3c0-.6.2-1 .5-1.3.3-.3.8-.5 1.4-.5s1.1.2 1.4.5c.3.3.5.8.5 1.3v.4h-1.7v-.2c0-.2-.1-.4-.2-.5-.1-.1-.3-.2-.4-.2-.2 0-.4.1-.5.2-.1.1-.2.3-.2.5v.2c0 .2.1.4.2.5.1.1.3.2.5.3l1.2.4c.4.1.7.3.9.6.2.2.3.6.3 1v.5c0 .6-.2 1-.5 1.3-.3.3-.8.5-1.5.5-.6 0-1.1-.2-1.5-.5-.3-.3-.5-.8-.5-1.4v-.6h1.7v.3zm6.7-6.7c.6 0 1.1.2 1.5.5.3.3.5.8.5 1.3v6h-1.8v-5.8c0-.2-.1-.4-.2-.5-.1-.1-.3-.2-.5-.2-.2 0-.4.1-.6.2-.1.1-.2.3-.2.5v5.8h-1.8v-8h1.8v.5c.3-.4.7-.6 1.3-.6zm3.8 1.8v6h-1.8v-6h1.8zm0-1.8h-1.8v-1.2h1.8v1.2zm5.2 0h-1.8v.5c-.1-.2-.3-.3-.5-.4-.2-.1-.4-.2-.7-.2-.6 0-1 .2-1.4.7-.3.4-.5 1.1-.5 1.9v1.5c0 .8.2 1.5.5 1.9.3.4.8.7 1.4.7.3 0 .5-.1.7-.2.2-.1.4-.3.5-.4v2.1h1.8v-8.1zm-1.8 5.1c0 .3-.1.5-.2.7-.1.2-.3.2-.6.2-.3 0-.5-.1-.6-.3-.1-.2-.2-.5-.2-.9v-1.6c0-.4.1-.7.2-.9.1-.2.3-.3.6-.3.2 0 .4.1.6.2.1.2.2.4.2.7v2.2z"></path>
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

const getFileIcon = (file: File): React.ReactElement => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (type.startsWith("image/")) return <FileIcons.IMAGE />;
  if (type === "application/pdf") return <FileIcons.PDF />;
  if (type.startsWith("text/")) {
    if (name.endsWith(".json")) return <FileIcons.JSON />;
    if (name.endsWith(".csv")) return <FileIcons.CSV />;
    if (name.endsWith(".html") || name.endsWith(".htm")) return <FileIcons.HTML />;
    if (name.endsWith(".md") || name.endsWith(".txt")) return <FileIcons.TXT />;
    if (name.match(/\.(js|ts|jsx|tsx|py|rb|java|c|cpp|go|rs|sh|bash)$/)) return <FileIcons.CODE />;
    return <FileIcons.TXT />;
  }
  if (type.startsWith("audio/")) return <FileIcons.AUDIO />;
  if (type.startsWith("video/")) return <FileIcons.VIDEO />;
  if (type.match(/application\/(zip|x-rar-compressed|x-tar|x-7z-compressed)/)) return <FileIcons.ZIP />;
  if (type.match(/application\/.*(excel|spreadsheet|sheet|csv)/)) return <FileIcons.XLSX />;
  if (type.match(/application\/.*(word|document)/)) return <FileIcons.DOC />;

  // Try to determine by file extension
  if (name.endsWith(".pdf")) return <FileIcons.PDF />;
  if (name.match(/\.(png|jpg|jpeg|gif|webp|svg|avif|ico)$/)) return <FileIcons.IMAGE />;
  if (name.match(/\.(mp3|wav|ogg|aac|flac)$/)) return <FileIcons.AUDIO />;
  if (name.match(/\.(mp4|webm|mov|avi|mkv)$/)) return <FileIcons.VIDEO />;
  if (name.match(/\.(zip|rar|tar|gz|7z)$/)) return <FileIcons.ZIP />;
  if (name.match(/\.(csv)$/)) return <FileIcons.CSV />;
  if (name.match(/\.(xls|xlsx|ods)$/)) return <FileIcons.XLSX />;
  if (name.match(/\.(doc|docx|odt)$/)) return <FileIcons.DOC />;
  if (name.match(/\.(json|xml)$/)) return <FileIcons.JSON />;
  if (name.match(/\.(js|ts|jsx|tsx|html|htm|css|py|rb|java|c|cpp|go|rs|sh|bash)$/)) return <FileIcons.CODE />;
  if (name.match(/\.txt$/)) return <FileIcons.TXT />;

  return <FileIcons.UNKNOWN />;
};

interface FilePillProps {
  file: File;
  onRemove: (fileName: string) => void;
}

function FilePill({ file, onRemove }: FilePillProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const Icon = getFileIcon(file);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.8, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.2 }}
      className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 w-fit px-3 py-1.5 rounded-xl group border border-gray-200 dark:border-gray-700 shadow-sm flex-shrink-0"
    >
      <div className="text-gray-600 dark:text-gray-300 flex-shrink-0">
        {Icon}
      </div>
      <div className="flex flex-col text-xs overflow-hidden">
        <span className="font-medium text-gray-900 dark:text-white truncate max-w-[100px] sm:max-w-[150px]" title={file.name}>
          {file.name}
        </span>
        <span className="text-gray-500 dark:text-gray-400">
          {formatFileSize(file.size)}
        </span>
      </div>
      <motion.button
        type="button"
        onClick={() => onRemove(file.name)}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.1)"}}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.1 }}
        className="ml-1 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-3 h-3" />
      </motion.button>
    </motion.div>
  );
}

export interface AIInputWithFileProps {
  onFilesChange: (files: File[]) => void;
  accept?: string;
  maxFileSize?: number;
  maxFiles?: number;
}

export const AIInputWithFile: React.FC<AIInputWithFileProps> = ({
  onFilesChange,
  accept = "*/*",
  maxFileSize = 2000,
  maxFiles = 10,
}) => {
  const { selectedFiles, handleDrop, handleFileChange } = useFileInput({
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
    maxFiles,
    onFilesChange: (files) => {
      console.log('AIInputWithFile: Files changed:', files);
      onFilesChange(files);
    }
  });

  return (
    <div className="relative">
      <label
        htmlFor="file-input"
        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-ring relative inline-flex"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('file-input')?.click();
          }
        }}
      >
        <Paperclip className="h-5 w-5" />
      </label>
      <input
        type="file"
        id="file-input"
        onChange={handleFileChange}
        accept={accept}
        multiple
        className="hidden"
      />
    </div>
  );
};