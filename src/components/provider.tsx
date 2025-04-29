'use client';
import { ThemeProvider } from 'next-themes';
import React from 'react';
import { ToastProvider } from './ui/toast-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ToastProvider />
      {children}
    </ThemeProvider>
  );
}
