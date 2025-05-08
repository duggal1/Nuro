"use client";

import { useState, useCallback } from "react";

interface UseFileInputProps {
  maxSize?: number;
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
}

export const useFileInput = ({
  maxSize = 20 * 1024 * 1024, // 20MB default
  maxFiles = 10,
  onFilesChange,
}: UseFileInputProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
    [maxSize, maxFiles]
  );

  const handleFiles = useCallback((newFiles: File[]) => {
    // Filter files based on size and total count
    const validFiles = newFiles.filter(file => file.size <= maxSize);
    
    // Combine with existing files, respecting maxFiles limit
    const updatedFiles = [...selectedFiles, ...validFiles].slice(0, maxFiles);
    
    setSelectedFiles(updatedFiles);
    onFilesChange(updatedFiles);
    
    // Log validation results
    console.log(`[FileInput] Processing ${newFiles.length} files:`, {
      valid: validFiles.length,
      tooLarge: newFiles.length - validFiles.length,
      total: updatedFiles.length,
    });
  }, [selectedFiles, maxSize, maxFiles, onFilesChange]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(Array.from(files));
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = useCallback((fileName: string) => {
    console.log('[FileInput] Removing file:', fileName);
    setSelectedFiles(prev => {
      const updated = prev.filter(file => file.name !== fileName);
      console.log('[FileInput] Updated files:', updated);
      onFilesChange(updated);
      return updated;
    });
  }, [onFilesChange]);

  return {
    selectedFiles,
    handleDrop,
    handleFileChange,
    removeFile,
  };
};