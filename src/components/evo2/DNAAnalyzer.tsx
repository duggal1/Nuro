/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DNAAnalyzerProps {
  sequence: string;
  properties?: any; // Replace with more specific type if available
  isDark: boolean;
}

export const DNAAnalyzer: React.FC<DNAAnalyzerProps> = ({ sequence, properties, isDark }) => {
  // Placeholder for DNA analysis logic
  const analysisResults = {
    length: sequence.length,
    gcContent: properties?.gc_content !== undefined ? (properties.gc_content * 100).toFixed(2) + "%" : "N/A",
    meltingTemp: properties?.melting_temperature !== undefined ? properties.melting_temperature.toFixed(1) + "°C" : "N/A",
    // Add more analysis based on sequence and properties
  };

  return (
    <div className={cn(
      "rounded-2xl p-6",
      isDark 
        ? "bg-gradient-to-br from-gray-900 to-purple-950 text-gray-100 border border-gray-700" 
        : "bg-gradient-to-br from-gray-50 to-purple-100 text-gray-900 border border-gray-200"
    )}>
      <h3 className={cn(
        "text-xl font-serif font-semibold mb-4 pb-2 border-b",
        isDark ? "border-gray-700" : "border-gray-300"
      )}>
        Detailed DNA Analytics
      </h3>
      {sequence ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Sequence Length:</p>
            <p className="text-lg">{analysisResults.length} bp</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">GC Content:</p>
            <p className="text-lg">{analysisResults.gcContent}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Melting Temperature:</p>
            <p className="text-lg">{analysisResults.meltingTemp}</p>
          </div>
          {properties?.stability_score !== undefined && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stability Score:</p>
              <p className="text-lg">{properties.stability_score.toFixed(2)}</p>
            </div>
          )}
          {properties?.expression_level !== undefined && (
             <div>
              <p className="text-sm font-medium text-muted-foreground">Predicted Expression:</p>
              <p className="text-lg">{properties.expression_level.toFixed(2)}</p>
            </div>
          )}
          {/* Add more detailed analytics display here */}
          <div className="md:col-span-2 mt-4">
            <p className="text-sm text-muted-foreground">
              Further analysis can include codon usage, open reading frames, and motif detection.
            </p>
          </div>
        </div>
      ) : (
        <p className={cn("text-center py-8 font-sans", isDark ? "text-gray-400" : "text-gray-600")}>
          No sequence data available for analysis.
        </p>
      )}
    </div>
  );
}; 