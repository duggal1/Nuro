"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

export function Toaster({ ...props }: ToasterProps) {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      className="toaster group"
      expand={false}
      closeButton
      richColors
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl dark:group-[.toaster]:bg-gray-900 dark:group-[.toaster]:text-gray-50 dark:group-[.toaster]:border-gray-800",
          title: "group-[.toast]:text-gray-950 dark:group-[.toast]:text-gray-50 group-[.toast]:font-serif group-[.toast]:font-medium",
          description: "group-[.toast]:text-gray-500 dark:group-[.toast]:text-gray-400 group-[.toast]:font-sans",
          actionButton:
            "group-[.toast]:bg-indigo-600 group-[.toast]:text-gray-50 dark:group-[.toast]:bg-indigo-500 dark:group-[.toast]:text-gray-50 group-[.toast]:rounded-xl group-[.toast]:font-sans",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500 dark:group-[.toast]:bg-gray-800 dark:group-[.toast]:text-gray-400 group-[.toast]:rounded-xl group-[.toast]:font-sans",
          closeButton:
            "group-[.toast]:text-gray-950/50 group-[.toast]:bg-transparent group-[.toast]:border-0 dark:group-[.toast]:text-gray-50/50",
          success:
            "group-[.toaster]:border group-[.toaster]:border-green-500/20 group-[.toaster]:bg-green-50 dark:group-[.toaster]:bg-green-950/30 group-[.toaster]:text-green-600 dark:group-[.toaster]:text-green-400",
          error:
            "group-[.toaster]:border group-[.toaster]:border-red-500/20 group-[.toaster]:bg-red-50 dark:group-[.toaster]:bg-red-950/30 group-[.toaster]:text-red-600 dark:group-[.toaster]:text-red-400",
          info: 
            "group-[.toaster]:border group-[.toaster]:border-blue-500/20 group-[.toaster]:bg-blue-50 dark:group-[.toaster]:bg-blue-950/30 group-[.toaster]:text-blue-600 dark:group-[.toaster]:text-blue-400",
          warning:
            "group-[.toaster]:border group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-amber-50 dark:group-[.toaster]:bg-amber-950/30 group-[.toaster]:text-amber-600 dark:group-[.toaster]:text-amber-400",
          loader:
            "group-[.toast]:text-indigo-500 dark:group-[.toast]:text-indigo-400",
        },
      }}
      {...props}
    />
  )
} 